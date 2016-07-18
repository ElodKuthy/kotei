angular.module('kotei')
    .config(($stateProvider) => {

        $stateProvider
            .state('stats.subscriptions', {
                url: '/stats/subscriptions',
                views: {
                    'navbar@': {
                        templateUrl: 'navbar/navbar.html',
                        controller: 'NavbarController as navbar'
                    },
                    'content@': {
                        templateUrl: 'stats/subscriptions.html',
                        controller: 'SubscriptionsController as vm'
                    }
                },
                resolve: {
                    userInfo: (userInfoService) => userInfoService.getUserInfo(),
                    subscriptions: (userInfoService, infoService) => {
                        return infoService.getActiveSubscriptions()
                    }
                },
                roles: ['coach', 'admin']
        })
    })
    .controller('SubscriptionsController', function ($scope, $state, $moment, userInfo, subscriptions, infoService) {

        this.isAdmin = userInfo.isAdmin
        this.subscriptions = subscriptions.map(subscription => {
            subscription.remainingCssClass = subscription.remaining === 1 ? 'btn-danger' : subscription.remaining === 2 ? 'btn-warning' : ''
            subscription.toCssClass = $moment(subscription.to).diff($moment(), 'weeks') < 1 ? 'btn-danger' : $moment(subscription.to).diff($moment(), 'weeks') < 2 ? 'btn-warning' : ''
            return subscription
        })

        this.userProfile = (userId) => $state.go('administration.user-profile', { userId })
})
