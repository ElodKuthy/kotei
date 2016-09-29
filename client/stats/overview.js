angular.module('kotei')
    .config(($stateProvider) => {
        $stateProvider
            .state('stats.overview', {
                url: '/overview',
                views: {
                    'navbar@': {
                        templateUrl: 'navbar/navbar.html',
                        controller: 'NavbarController as navbar'
                    },
                    'content@': {
                        templateUrl: 'stats/overview.html',
                        controller: 'StatsOverviewController as vm'
                    }
                },
                resolve: {
                    userInfo: userInfoService => userInfoService.getUserInfo(),
                },
                roles: ['coach', 'admin']
        })
    })
    .controller('StatsOverviewController', function ($scope, $moment, userInfo, infoService) {
        this.month = $moment().subtract({month: 1}).startOf('month').toDate()
        this.isAdmin = userInfo.isAdmin
        
        this.dateChanged = (id, value) => {
            if ($moment(this.month).isSame(value, 'month')) {
                return
            }
            this.fetchStats(value)
        }

        this.fetchStats = value => {
            this.overviews = null
            const month = $moment(value).startOf('month').format('YYYY-MM-DD')
            infoService.getStatsOverview(month).then(overviews => this.overviews = overviews)
        }

        this.fetchStats()
})
