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
    .controller('UserProfileController', function ($state, $moment, R, user, coaches, subscriptions, administrationService, modalService, nameService, userInfoService) {

        this.id = userInfoService.getUserInfo().id
        this.isAdmin = userInfoService.getUserInfo().isAdmin
        this.isCoach = userInfoService.getUserInfo().isCoach

        this.user = user
        this.subscriptions = R.reverse(R.map((subscription) => {
            subscription.from = $moment(subscription.from).toDate()
            subscription.to = $moment(subscription.to).toDate()
            subscription.amount = R.reduce((acc, credit) => acc + credit.amount, 0, subscription.Credits)
            subscription.assigned = 0
            subscription.attendeed = 0
            subscription.missed = 0
            subscription.Trainings = R.sort((a, b) => $moment(a.from).valueOf() - $moment(b.from).valueOf(), R.map((training) => {
                if (training.Attendee.checkIn) {
                    training.cssClass = 'text-success'
                    subscription.attendeed++
                } else if ($moment().isAfter(training.to)) {
                    training.cssClass = 'text-danger'
                    subscription.missed++
                } else {
                    subscription.assigned++
                }
                return training
            }, subscription.Trainings))
            var diff = subscription.amount - subscription.assigned - subscription.attendeed - subscription.missed
            if ($moment().isAfter(subscription.to, 'day')) {
                subscription.lost = diff
            } else {
                subscription.free = diff
            }
            subscription.canBeDeleted = this.isAdmin || (this.isCoach && subscription.Coach.id === this.id)
            return subscription
        }, subscriptions))
        

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

        this.deleteSubscription = (subscriptionId) => {
            administrationService.deleteSubscription(subscriptionId)
                .then(() => modalService.info(this.title, 'A bérlet törlésre került'))
                .then(() => $state.reload())
                .catch((error) => modalService.info(this.title, error))
        }

    })