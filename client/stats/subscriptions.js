angular.module('kotei')
    .config(($stateProvider) => {

        $stateProvider
            .state('stats.subscriptions', {
                url: '/subscriptions',
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
                    userInfo: userInfoService => userInfoService.getUserInfo(),
                    active: infoService => infoService.getActiveSubscriptions()
                },
                roles: ['coach', 'admin']
        })
    })
    .controller('SubscriptionsController', function ($scope, $state, $moment, userInfo, active, infoService) {

        this.isAdmin = userInfo.isAdmin
        this.month = $moment().subtract({month: 1}).startOf('month').toDate()
        this.subscriptions = {
            active: active.map(subscription => {
                subscription.remainingCssClass = subscription.remaining === 1 ? 'btn-danger' : subscription.remaining === 2 ? 'btn-warning' : ''
                subscription.toCssClass = $moment(subscription.to).diff($moment(), 'weeks') < 1 ? 'btn-danger' : $moment(subscription.to).diff($moment(), 'weeks') < 2 ? 'btn-warning' : ''
                return subscription
            })
        }

        this.dateChanged = (id, value) => {
            if ($moment(this.month).isSame(value, 'month')) {
                return
            }
            this.fetchStats(value)
        }

        this.fetchStats = value => {
            this.subscriptions.sold = null
            const month = $moment(value || this.month).startOf('month').format('YYYY-MM-DD')
            infoService.getSoldSubscriptions(month).then(sold => this.subscriptions.sold = sold)
        }

        this.userProfile = userId => $state.go('administration.user-profile', { userId })

        this.fetchStats()
})
