angular.module('kotei')
    .config(($stateProvider) => {

        $stateProvider
            .state('administration.training-list', {
                url: '/training-list',
                views: {
                    'navbar@': {
                        templateUrl: 'navbar/navbar.html',
                        controller: 'NavbarController as navbar'
                    },
                    'content@': {
                        templateUrl: 'administration/training-administration/training-list.html',
                        controller: 'TrainingListController as vm'
                    }
                },
                resolve: {
                    trainingTypes: infoService => infoService.getAllTrainingTypes(),
                    coaches: infoService => infoService.getAllCoaches(),
                    locations: infoService => infoService.getAllLocations(),
                    trainingCategories: infoService => infoService.getAllTrainingCategories()
                },
                roles: ['admin']
        })
    })
    .controller('TrainingListController', function ($scope, $state, $moment, $uibModal, infoService, userInfoService,
        nameService, trainingTypes, coaches, locations, administrationService, modalService, trainingCategories) {
        this.title = 'Órák'
        this.isAdmin = userInfoService.getUserInfo().isAdmin
        this.trainingTypes = trainingTypes
        this.trainingTypes.push({ name: '-'})
        this.trainingCategories = trainingCategories
        this.trainingCategories.push({ name: '-'})
        this.coaches = nameService.addDisplayName(coaches)
        this.coaches.push({ displayName: '-'})
        this.locations = locations
        this.locations.push({ name: '-'})
        this.days = [
            { name: '-' },
            { name: 'Hétfő',     id: 2 },
            { name: 'Kedd',      id: 3 },
            { name: 'Szerda',    id: 4 },
            { name: 'Csütörtök', id: 5 },
            { name: 'Péntek',    id: 6 },
            { name: 'Szombat',   id: 7 },
            { name: 'Vasárnap',  id: 1 },
        ]
        this.filtersOpen = true
        this.modifyOpen = true

        this.filter = {
            minDate: $moment('2016-01-01').toDate(),
            maxDate: $moment().endOf('year').add({ year: 1 }).toDate(),
            fromDate: $moment().startOf('month').toDate(),
            toDate: $moment().endOf('month').toDate(),
            isFromTime: false,
            fromTime: $moment().startOf('day'),
            isToTime: false,
            toTime: $moment().startOf('day')
        }

        this.newValues = {
            isFromTime: false,
            fromTime: $moment().startOf('day'),
            isToTime: false,
            toTime: $moment().startOf('day')
        }

        this.filterChanged = (id, value) => {
            this.isLoading = true
            infoService.getTrainingsByFilter({
                    fromDate:           id === 'from-date' ? value : this.filter.fromDate,
                    toDate:             id === 'to-date' ? value : this.filter.toDate,
                    trainingCategoryId: this.filter.trainingCategory && this.filter.trainingCategory.id,
                    trainingTypeId:     this.filter.trainingType && this.filter.trainingType.id,
                    coachId:            this.filter.coach && this.filter.coach.id,
                    locationId:         this.filter.location && this.filter.location.id,
                    dayOfTheWeek:       this.filter.dayOfTheWeek && this.filter.dayOfTheWeek.id,
                    fromTime:           this.filter.isFromTime ? $moment(this.filter.fromTime).format('HH:mm:00') : undefined,
                    toTime:             this.filter.isToTime ? $moment(this.filter.toTime).format('HH:mm:00') : undefined,
                    max:                this.filter.max
                })
                .then(trainings => {
                    this.trainings = trainings.map(training => {
                        training.Coach.displayName = nameService.displayName(training.Coach)
                        return training
                    })
                    this.isLoading = false
                })
                .catch(error => {
                    this.error = error
                    this.isLoading = false
                })
        }

        this.trainingDetails = training => $state.go('attendee-list', { trainingId: training.id })

        this.filterChanged()

        this.saveModifications = () => {
            this.isLoading = true
            administrationService.bulkEditTrainings({
                    fromDate:           this.filter.fromDate,
                    toDate:             this.filter.toDate,
                    trainingTypeId:     this.filter.trainingType && this.filter.trainingType.id,
                    trainingCategoryId: this.filter.trainingCategory && this.filter.trainingCategory.id,
                    coachId:            this.filter.coach && this.filter.coach.id,
                    locationId:         this.filter.location && this.filter.location.id,
                    dayOfTheWeek:       this.filter.dayOfTheWeek && this.filter.dayOfTheWeek.id,
                    fromTime:           this.filter.isFromTime ? $moment(this.filter.fromTime).format('HH:mm:00') : undefined,
                    toTime:             this.filter.isToTime ? $moment(this.filter.toTime).format('HH:mm:00') : undefined,
                    max:                this.filter.max

                }, {
                    trainingTypeId:     this.newValues.trainingType && this.newValues.trainingType.id,
                    trainingCategoryId: this.newValues.trainingCategory && this.newValues.trainingCategory.id,
                    coachId:            this.newValues.coach && this.newValues.coach.id,
                    locationId:         this.newValues.location && this.newValues.location.id,
                    dayOfTheWeek:       this.newValues.dayOfTheWeek && this.newValues.dayOfTheWeek.id,
                    fromTime:           this.newValues.isFromTime ? $moment(this.newValues.fromTime).format('HH:mm:00') : undefined,
                    toTime:             this.newValues.isToTime ? $moment(this.newValues.toTime).format('HH:mm:00') : undefined,
                    max:                this.newValues.max,
                    tillDate:           this.newValues.tillDate

                })
                .then(() => modalService.info('Órák módosítása', 'Sikeres módosítás'))
                .catch(err => modalService.info('Sikertelen módosítás', err))
                .finally(() => this.filterChanged())
        }

        this.deleteAll = () => {
            const filter = this.filter
            $uibModal.open({
                template: `
                    <div>
                        <div class="modal-header">
                            <h3 class="modal-title">Órák törlése</h3>
                        </div>
                        <div class="modal-body">
                            Biztos, hogy törölni akarod az összes órát? A jelenlegi feliratkozók alkalma jóváírásra kerül,
                            <span ng-if="vm.extend">a bérletük érvényessége meghosszabbodik egy héttel alkalmanként,</span>
                            és email értesítést kapnak arról, hogy elmaradnak az órák.
                        </div>
                        <div class="checkbox" style="margin: 10px;">
                        <label>
                            <input type="checkbox" ng-model="vm.extend">
                                A bérletek érvényesség hosszabbodjon meg egy héttel alkalmanként
                        </label>
                        </div>
                        <div class="modal-footer">
                            <button
                                class="btn btn-primary pull-left"
                                type="button"
                                ng-click="vm.cancel()">Mégsem</button>
                            <button
                                class="btn btn-primary"
                                type="button"
                                ng-click="vm.delete()">Törlés</button>
                        </div>
                    </div>
                `,
                controller: function ($uibModalInstance) {
                    this.extend = true
                    this.delete = () => {
                        administrationService.deleteAllTrainings({
                            fromDate:           filter.fromDate,
                            toDate:             filter.toDate,
                            trainingTypeId:     filter.trainingType && filter.trainingType.id,
                            trainingCategoryId: filter.trainingCategory && filter.trainingCategory.id,
                            coachId:            filter.coach && filter.coach.id,
                            locationId:         filter.location && filter.location.id,
                            dayOfTheWeek:       filter.dayOfTheWeek && filter.dayOfTheWeek.id,
                            fromTime:           filter.isFromTime ? $moment(filter.fromTime).format('HH:mm:00') : undefined,
                            toTime:             filter.isToTime ? $moment(filter.toTime).format('HH:mm:00') : undefined,
                            max:                filter.max
                        }, this.extend)
                        .then(() => $uibModalInstance.close())
                        .catch(error => $uibModalInstance.dismiss(error))
                    }
                    this.cancel = () => {
                        $uibModalInstance.dismiss('no')
                    }
                },
                controllerAs: 'vm'
            }).result
                .then(() => modalService.info(this.title, 'Az órák törölve lettek'))
                .catch(error => {
                    if (this.error = ['no', 'backdrop click'].indexOf(error) === -1) {
                        modalService.info('Sikertelen törlés', error)
                    }
                })
                .finally(() => this.filterChanged())
        }
    })