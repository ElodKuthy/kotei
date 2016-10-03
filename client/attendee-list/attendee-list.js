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
                roles: ['coach', 'admin']
        })
    })
    .controller('AttendeeController', function (R, $state, $moment, $filter, training, clients, userInfoService, administrationService, modalService) {

        this.userInfo = userInfoService.getUserInfo()

        if (this.userInfo.isCoach && this.userInfo.id !== training.Coach.id) {
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
            max: training.max
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

        this.canAdd = (this.training.count < this.training.max) && (this.userInfo.isAdmin || (this.userInfo.isCoach && this.userInfo.id === this.training.coach_id))

        this.canModify = training.canModify
        
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

            modalService.decision('Edzés törlése', 'Biztos, hogy törölni akarod ezt az órát? A jelenlegi feliratkozók alkalma jóváírásra kerül, a bérletük érvényessége meghosszabbodik egy héttel, és email értesítést kapnak arról, hogy elmarad az óra.')
            .then(() => administrationService.deleteTraining(training.id))
            .then(() => modalService.info(this.title, 'Az edzés törölve lett'))
            .then(() => $state.go('schedule'))
            .catch(error => this.error = error === 'no' ? '' : error)
        }
    })