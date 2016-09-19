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
                    locations: infoService => infoService.getAllLocations()
                },
                roles: ['admin']
        })
    })
    .controller('TrainingListController', function ($scope, $state, $moment, infoService, userInfoService, 
        nameService, trainingTypes, coaches, locations, administrationService, modalService) {
        this.title = 'Edzések'
        this.isAdmin = userInfoService.getUserInfo().isAdmin
        this.trainingTypes = trainingTypes
        this.trainingTypes.push({ name: '-'})
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
                    fromDate:       id === 'from-date' ? value : this.filter.fromDate,
                    toDate:         id === 'to-date' ? value : this.filter.toDate,
                    trainingTypeId: this.filter.trainingType && this.filter.trainingType.id,
                    coachId:        this.filter.coach && this.filter.coach.id,
                    locationId:     this.filter.location && this.filter.location.id,
                    dayOfTheWeek:   this.filter.dayOfTheWeek && this.filter.dayOfTheWeek.id,
                    fromTime:       this.filter.isFromTime ? $moment(this.filter.fromTime).format('hh:mm:00') : undefined,
                    toTime:         this.filter.isToTime ? $moment(this.filter.toTime).format('hh:mm:00') : undefined
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
                    fromDate:       this.filter.fromDate,
                    toDate:         this.filter.toDate,
                    trainingTypeId: this.filter.trainingType && this.filter.trainingType.id,
                    coachId:        this.filter.coach && this.filter.coach.id,
                    locationId:     this.filter.location && this.filter.location.id,
                    dayOfTheWeek:   this.filter.dayOfTheWeek && this.filter.dayOfTheWeek.id,
                    fromTime:       this.filter.isFromTime ? $moment(this.filter.fromTime).format('hh:mm:00') : undefined,
                    toTime:         this.filter.isToTime ? $moment(this.filter.toTime).format('hh:mm:00') : undefined
                }, {
                    trainingTypeId: this.newValues.trainingType && this.newValues.trainingType.id,
                    coachId:        this.newValues.coach && this.newValues.coach.id,
                    locationId:     this.newValues.location && this.newValues.location.id,
                    dayOfTheWeek:   this.newValues.dayOfTheWeek && this.newValues.dayOfTheWeek.id,
                    fromTime:       this.newValues.isFromTime ? $moment(this.newValues.fromTime).format('hh:mm:00') : undefined,
                    toTime:         this.newValues.isToTime ? $moment(this.newValues.toTime).format('hh:mm:00') : undefined
                })
                .then(() => modalService.info('Edzések módosítása', 'Sikeres módosítás'))
                .catch(err => modalService.info('Sikertelen módosítás', err))
                .finally(() => this.filterChanged())
        }

        this.deleteAll = () => {
            modalService.decision('Edzések törlése', 'Biztos, hogy törölni akarod az összes órát? A jelenlegi feliratkozók alkalma jóváírásra kerül, a bérletük érvényessége meghosszabbodik egy héttel, és email értesítést kapnak arról, hogy elmarad az óra.')
                .then(() => administrationService.deleteAllTrainings({
                    fromDate:       this.filter.fromDate,
                    toDate:         this.filter.toDate,
                    trainingTypeId: this.filter.trainingType && this.filter.trainingType.id,
                    coachId:        this.filter.coach && this.filter.coach.id,
                    locationId:     this.filter.location && this.filter.location.id,
                    dayOfTheWeek:   this.filter.dayOfTheWeek && this.filter.dayOfTheWeek.id,
                    fromTime:       this.filter.isFromTime ? $moment(this.filter.fromTime).format('hh:mm:00') : undefined,
                    toTime:         this.filter.isToTime ? $moment(this.filter.toTime).format('hh:mm:00') : undefined                    
                }))
                .then(() => modalService.info(this.title, 'Az edzések törölve lettek'))
                .catch(error => {
                    if (error !== 'no') {
                        modalService.info('Sikertelen törlés', err)
                    }
                })
                .finally(() => this.filterChanged())
        }
    })