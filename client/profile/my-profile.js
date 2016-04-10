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
    .controller('MyProfileController', function (R, $moment, profileInfo, subscriptions) {
        this.profileInfo = profileInfo
        this.subscriptions = R.map((subscription) => {
            subscription.from = $moment(subscription.from).toDate()
            subscription.to = $moment(subscription.to).toDate()
            subscription.Trainings = R.map((training) => {
                training.cssClass = training.Attendee.checkIn ? 'text-success' : $moment().isAfter(training.to) ? 'text-danger' : ''
                return training
            }, subscription.Trainings)
            return subscription
        }, subscriptions)
    })