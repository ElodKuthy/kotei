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
    .controller('MyProfileController', function (R, profileInfo, subscriptions) {
        this.profileInfo = profileInfo
        this.subscriptions = R.map((subscription) => {
            subscription.from = new Date(subscription.from)
            subscription.to = new Date(subscription.to)
            return subscription
        }, subscriptions)
    })