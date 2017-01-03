angular.module('kotei')
    .config(($stateProvider) => {

        $stateProvider
            .state('attendee-list', {
                url: '/attendee-list/:trainingId',
                views: {
                    'navbar': {
                        templateUrl: 'navbar/navbar.html',
                        controller: 'NavbarController as navbar'
                    },
                    'content': {
                        templateUrl: 'attendee-list/attendee-list.html',
                        controller: 'AttendeeController as attendeeList'
                    }
                },
                resolve: {
                    training: ($stateParams, infoService) => {
                        return infoService.getTrainingById($stateParams.trainingId)
                    },
                    clients: (userInfoService, infoService) => {
                        return userInfoService.getUserInfo().isClient ? [] : infoService.getAllClients()
                    }
                },
                roles: ['client', 'coach', 'admin']
        })
    })
    .controller('AttendeeController', function (R, $state, $moment, $filter, $uibModal, training, clients, userInfoService, administrationService, modalService) {

        this.userInfo = userInfoService.getUserInfo()

        if (!training || !training.canSeeAttendees) {
            return $state.go('welcome')
        }

        const displayName = (client) => {
            return client.fullName == client.nickname
                ? client.fullName
                : `${client.fullName} "${client.nickname}"`
        }

        const addDisplayName = (clients) => R.map((client) => {
            client.displayName = displayName(client)
            return client
        }, clients)

        const isAttendee = R.curry((attendees, client) => R.find((attendee) => attendee.id === client.id, attendees))

        const findNotAttendees = (attendees, clients) => R.filter(R.compose(R.not, isAttendee(attendees)), clients)

        const generateAddClientsList = R.compose(addDisplayName, findNotAttendees)

        this.training = {
            id: training.id,
            name: training.TrainingType.name,
            date: $moment(training.from).toDate(),
            coach_id: training.Coach.id,
            coach: training.Coach.nickname,
            location: training.Location.name,
            count: training.Subscriptions.length,
            max: training.max,
        }

        this.title = `${this.training.name} - ${$filter('date')(this.training.date, 'yyyy. MM. dd. HH:mm')}`

        this.attendees = R.map((subscription) => {
            return {
                id: subscription.Client.id,
                name: displayName(subscription.Client),
                checkIn: subscription.Attendee.checkIn,
                cssClass: subscription.Attendee.checkIn ? 'text-success' : moment().isBefore(training.to) ? 'hide' : 'text-danger'

            }
        }, training.Subscriptions)

        this.clients = generateAddClientsList(this.attendees, clients)

        this.canAdd = training.canAdd
        this.canModify = training.canModify
        this.canJoin =  training.canJoin
        this.canLeave = training.canLeave


        this.toggleAttendee = (attendee) => {

            if (!this.userInfo.isClient) {
                administrationService.updateAttendee(training.id, attendee.id, !attendee.checkIn)
                    .then(() => $state.reload())
                    .catch((error) => this.error = error)
            }
        }

        this.removeAttendee = (attendee) => {
            administrationService.removeAttendee(training.id, attendee.id)
                .then(() => $state.reload())
                .catch((error) => this.error = error)
        }

        this.addClientKeyDown = ($event) => {
            this.addClientError = null

            if ($event.keyCode === 13) {
                this.addClient(this.clientToAdd)
            }
        }

        this.addClient = (clientToAdd) => {
            if (!clientToAdd) {
                this.addClientError = 'Nincs ilyen nevű tanítvány'
                return
            }

            administrationService.addAttendee(training.id, clientToAdd.id)
                .then(() => $state.reload())
                .catch((error) => this.addClientError = error)
        }

        this.deleteTraining = () => {

            $uibModal.open({
                template: `
                    <div>
                        <div class="modal-header">
                            <h3 class="modal-title">Edzés törlése</h3>
                        </div>
                        <div class="modal-body">
                            Biztos, hogy törölni akarod ezt az órát? A jelenlegi feliratkozók alkalma jóváírásra kerül,
                            <span ng-if="vm.extend">a bérletük érvényessége meghosszabbodik egy héttel,</span>
                            és email értesítést kapnak arról, hogy elmarad az óra.
                        </div>
                        <div class="checkbox" style="margin: 10px;">
                        <label>
                            <input type="checkbox" ng-model="vm.extend">
                                A bérletek érvényesség hosszabbodjon meg egy héttel
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
                        administrationService.deleteTraining(training.id, this.extend)
                            .then(() => $uibModalInstance.close())
                            .catch(error => $uibModalInstance.dismiss(error))
                    }
                    this.cancel = () => {
                        $uibModalInstance.dismiss('no')
                    }
                },
                controllerAs: 'vm'
            }).result
            .then(() => modalService.info(this.title, 'Az edzés törölve lett'))
            .then(() => $state.go('schedule'))
            .catch(error => this.error = ['no', 'backdrop click'].indexOf(error) > -1 ? null : error)
        }

        this.join = () => {
            administrationService.addAttendee(training.id, this.userInfo.id)
                .then(() => $state.reload())
                .catch(error => modalSerive.info(this.title, error))
        }

        this.leave = () => {
                administrationService.removeAttendee(training.id, this.userInfo.id)
                    .then(() => $state.reload())
                    .catch(error => modalSerive.info(this.title, error))
        }

    })