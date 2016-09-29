angular.module('kotei')
    .config(($stateProvider) => {

        $stateProvider
            .state('stats.clients', {
                url: '/clients',
                views: {
                    'navbar@': {
                        templateUrl: 'navbar/navbar.html',
                        controller: 'NavbarController as navbar'
                    },
                    'content@': {
                        templateUrl: 'stats/clients.html',
                        controller: 'ClientsController as vm'
                    }
                },
                resolve: {
                    userInfo: userInfoService => userInfoService.getUserInfo()
                },
                roles: ['coach', 'admin']
        })
    })
    .controller('ClientsController', function ($scope, $state, $moment, userInfo, infoService) {

        this.isAdmin = userInfo.isAdmin
        this.month = $moment().subtract({month: 1}).startOf('month').toDate()

        this.dateChanged = (id, value) => {
            if ($moment(this.month).isSame(value, 'month')) {
                return
            }
            this.fetchStats(value)
        }

        this.fetchStats = value => {
            this.clients = null
            const month = $moment(value || this.month).startOf('month').format('YYYY-MM-DD')
            infoService.getClientsStats(month).then(clients => this.clients = clients)
        }

        this.userProfile = userId => $state.go('administration.user-profile', { userId })

        this.fetchStats()
})
