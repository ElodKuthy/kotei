angular.module('kotei')
    .config(($stateProvider) => {

        $stateProvider
            .state('administration.user-profile', {
                url: '/user-profile/:userId',
                views: {
                    'navbar@': {
                        templateUrl: 'navbar/navbar.html',
                        controller: 'NavbarController as navbar'
                    },
                    'content@': {
                        templateUrl: 'administration/user-administration/user-profile.html',
                        controller: 'UserProfileController as userProfile'
                    }
                },
                resolve: {
                    user: ($stateParams, infoService) => {
                        return infoService.getUser($stateParams.userId)
                    },
                    coaches: (infoService) => {
                        return infoService.getAllCoaches()
                    },
                    subscriptions: ($stateParams, infoService) => {
                        return infoService.getSubscriptionsByClient($stateParams.userId)
                    }
                },
                roles: ['coach', 'admin']
        })
    })
    .controller('UserProfileController', function ($moment, R, user, coaches, subscriptions, administrationService, modalService, nameService, userInfoService) {

        this.user = user
        this.subscriptions = R.reverse(R.map((subscription) => {
            subscription.from = $moment(subscription.from).toDate()
            subscription.to = $moment(subscription.to).toDate()
            subscription.Trainings = R.sort((a, b) => $moment(a.from).valueOf() - $moment(b.from).valueOf(), R.map((training) => {
                training.cssClass = training.Attendee.checkIn ? 'text-success' : $moment().isAfter(training.to) ? 'text-danger' : ''
                return training
            }, subscription.Trainings))
            return subscription
        }, subscriptions))
        
        this.isAdmin = userInfoService.getUserInfo().isAdmin

        this.states = [
            { name: 'aktív', value: true },
            { name: 'passzív', value: false }
        ]

        this.registration = $moment(this.user.created_at).toDate()

        this.coaches = nameService.addDisplayName(coaches)
        this.coach = R.find((coach) => coach.id === this.user.coach_id, this.coaches)

        this.resendRegistration = () => {
            return administrationService.resendRegistration(this.user.id)
                .then(() => modalService.info('Regisztrációs email', 'A regisztrációs emailt újra elküldtük'))
        }

        this.submitUser = () => {
            delete this.error
            this.user.coach_id = this.coach ? this.coach.id : null
            return administrationService.updateUser(this.user)
                .then(() => modalService.info('Felhasználó adatainakmódosítása', 'A felhasználó adatait sikeresen módosítottad'),
                    (error) => this.userError = error)
        }
    })