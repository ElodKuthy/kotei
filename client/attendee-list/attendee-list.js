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
    .controller('AttendeeController', function (R, $state, $moment, training, clients, userInfoService, administrationService, modalService) {

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

        this.userInfo = userInfoService.getUserInfo()

        this.training = {
            id: training.id,
            name: training.name,
            date: $moment(training.from).toDate(),
            coach: training.Coach.nickname,
            location: training.Location.name,
            count: training.Subscriptions.length,
            max: training.max
        }

        this.attendees = R.map((subscription) => {
            return {
                id: subscription.Client.id,
                name: displayName(subscription.Client),
                checkIn: subscription.Attendee.checkIn,
                cssClass: subscription.Attendee.checkIn ? 'text-success' : moment().isBefore(training.to) ? 'hide' : 'text-dangers'

            }
        }, training.Subscriptions)

        this.clients = generateAddClientsList(this.attendees, clients)

        this.canAdd = (this.training.count < this.training.max) && (this.userInfo.isAdmin || (this.userInfo.isCoach && this.userInfo.id === this.training.id && moment().isBefore(training.to)))

        this.canModify = this.userInfo.isAdmin || (this.userInfo.isCoach && this.userInfo.id === this.training.id && moment().diff(training.from, 'hours') <= -3)

        this.canJoin = this.userInfo.isClient && moment().isBefore(training.to) && (this.training.count < this.training.max) && !isAttendee(this.attendees, this.userInfo)

        this.canLeave = (moment().diff(training.from, 'hours') <= -3) && isAttendee(this.attendees, this.userInfo)

        this.toggleAttendee = (attendee) => {

            if (!this.userInfo.isClient && moment().isAfter(training.from) && moment().isBefore(moment(training.to).endOf('day'))) {
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

        this.modifyTraining = () => {

            console.log(training.id)
        }
    })