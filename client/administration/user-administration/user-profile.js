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
                    subscriptions: ($stateParams, infoService) => {
                        return infoService.getSubscriptionsByClient($stateParams.userId)
                    }
                },
                roles: ['coach', 'admin']
        })
    })
    .controller('UserProfileController', function ($moment, R, user, subscriptions) {
        this.user = user
        this.subscriptions = R.map((subscription) => {
            subscription.from = $moment(subscription.from).toDate()
            subscription.to = $moment(subscription.to).toDate()
            return subscription
        }, subscriptions)
    })