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

        this.headers = [
            'Megtartott edzések',
            'Összes hely',
            'Feliratkozások',
            'Kihasználtság',
            'Résztvevők',
            'Résztvevők aránya',
            'Bérlet eladás',
            'Felhasznált kredit érték'
        ]

        if (this.isAdmin) {
            this.headers.push('Edző')
        }

        this.dateChanged = (id, value) => {
            if ($moment(this.month).isSame(value, 'month')) {
                return
            }
            this.fetchStats(value)
        }

        const overviewConverter = ({trainingsCount, max, subscriptions, attendees, sold, spent, Coach}) => {
            let result =  {
                trainingsCount,
                max,
                subscriptions,
                utilization: Math.round((max ? (subscriptions / max) : 0) * 10000) / 10000,
                attendees,
                foo: Math.round((subscriptions ? (attendees / subscriptions) : 0) * 10000) / 10000,
                sold: Math.round(sold),
                spent: Math.round(spent)
            }
            if (this.isAdmin) {
                result.coach = Coach && Coach.fullName + (Coach.fullName !== Coach.nickname ? '(' + Coach.nickname + ')' : '')
            }
            return result
        }

        this.fetchStats = value => {
            this.overviews = null
            const month = $moment(value).startOf('month').format('YYYY-MM-DD')
            infoService.getStatsOverview(month).then(overviews => this.overviews = overviews.map(overviewConverter))
        }

        this.fetchStats()

        this.export = () => this.overviews
})
