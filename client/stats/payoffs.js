angular.module('kotei')
    .config(($stateProvider) => {

        $stateProvider
            .state('stats.payoffs', {
                url: '/payoffs',
                views: {
                    'navbar@': {
                        templateUrl: 'navbar/navbar.html',
                        controller: 'NavbarController as navbar'
                    },
                    'content@': {
                        templateUrl: 'stats/payoffs.html',
                        controller: 'PayoffsController as payoffs'
                    }
                },
                resolve: {
                    userInfo: (userInfoService) => userInfoService.getUserInfo()
                },
                roles: ['coach', 'admin']
        })
    })
    .controller('PayoffsController', function ($scope, $moment, userInfo, infoService) {
        this.month = $moment().subtract({month: 1}).startOf('month').toDate()
        this.isAdmin = userInfo.isAdmin
        
        this.dateChanged = () => {
            if (this.last && this.last.isSame(this.month, 'month')) {
                return
            }
            this.last = $moment(this.month)
            this.payoffs = null
            const from = $moment(this.month).startOf('month').format('YYYY-MM-DD')
            const to = $moment(this.month).endOf('month').format('YYYY-MM-DD')
            infoService.getPayoffs(from, to).then(payoffs => {
                this.payoffs = payoffs.map(payoff => {
                    payoff.amounts = payoff.amounts.map(amount => {
                        amount.cssClass = amount.amount > 0 ? 'text-success' : amount.amount < 0 ? 'text-danger' : undefined
                        return amount
                    })
                    return payoff
                })
            })
        }

        $scope.$watch(() => this.month, this.dateChanged)
})
