angular.module('kotei')
    .config(($stateProvider) => {

        $stateProvider
            .state('profile', {
                url: '/profile',
                views: {
                    'navbar': {
                        templateUrl: 'navbar/navbar.html',
                        controller: 'NavbarController as navbar'
                    },
                    'content': {
                        templateUrl: 'profile/my-profile.html',
                        controller: 'MyProfileController as myProfile'
                    }
                },
                resolve: {
                    profileInfo: (infoService) => {
                        return infoService.getMyProfile()
                    },
                    subscriptions: (infoService) => {
                        return infoService.getMyProfile()
                            .then((profileInfo) =>
                                infoService.getSubscriptionsByClient(profileInfo.id))
                    }
                },
                roles: ['client', 'coach', 'admin']
        })
    })
    .controller('MyProfileController', function (R, $state, $moment, profileInfo, subscriptions, administrationService, modalService) {
        this.profileInfo = profileInfo
        this.subscriptions = R.reverse(R.map((subscription) => {
            subscription.from = $moment(subscription.from).toDate()
            subscription.to = $moment(subscription.to).toDate()
            subscription.amount = R.reduce((acc, credit) => acc + credit.amount, 0, subscription.Credits)
            subscription.assigned = 0
            subscription.attendeed = 0
            subscription.missed = 0
            subscription.Trainings = R.sort((a, b) => $moment(a.from).valueOf() - $moment(b.from).valueOf(), R.map((training) => {
                if ($moment().isAfter(training.to)) {
                    if (training.Attendee.checkIn) {
                        training.cssClass = 'text-success'
                        subscription.attendeed++
                    } else {
                        training.cssClass = 'text-danger'
                        subscription.missed++
                    }                    
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
            return subscription
        }, subscriptions))
                        
        this.leaveTraining = (training) => {
            administrationService.removeAttendee(training.id, this.profileInfo.id)
                .then(() => $state.reload())
                .catch((error) => modalService.info(this.title, error))
        }
    })