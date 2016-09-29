angular.module('kotei')
    .config(($stateProvider) => {

        $stateProvider
            .state('stats.trainings', {
                url: '/trainings',
                views: {
                    'navbar@': {
                        templateUrl: 'navbar/navbar.html',
                        controller: 'NavbarController as navbar'
                    },
                    'content@': {
                        templateUrl: 'stats/trainings.html',
                        controller: 'TrainingsController as vm'
                    }
                },
                resolve: {
                    userInfo: userInfoService => userInfoService.getUserInfo()
                },
                roles: ['coach', 'admin']
        })
    })
    .controller('TrainingsController', function ($scope, $state, $moment, userInfo, infoService) {

        this.isAdmin = userInfo.isAdmin
        this.month = $moment().subtract({month: 1}).startOf('month').toDate()

        this.dateChanged = (id, value) => {
            if ($moment(this.month).isSame(value, 'month')) {
                return
            }
            this.fetchStats(value)
        }

        this.fetchStats = value => {
            this.trainings = null
            const month = $moment(value || this.month).startOf('month').format('YYYY-MM-DD')
            infoService.getTrainingsStats(month).then(trainings => this.trainings = trainings)
        }

        this.fetchStats()
})
