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
    .controller('ClientsController', function ($scope, $state, $moment, $filter, userInfo, infoService) {

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

        this.newClientsHeader = ['Név', 'Feliratkozás']
        this.passiveClientsHeader = ['Név', 'Feliratkozás', 'Utolsó bérlet vásárlás', 'Utolsó bérlet lejára']
        if (this.isAdmin) {
            this.newClientsHeader.push('Edző')
            this.passiveClientsHeader.push('Edző')
        }

        this.exportNewClients = () =>
            this.clients.news.map(client => {
                let result = {
                    client: client.fullName + (client.fullName !== client.nickname ? '(' + client.nickname + ')' : ''),
                    created: $filter('date')(client.created_at, 'yyyy-MM-dd')
                }
                if (this.isAdmin) {
                    result.coach = client.Coach && client.Coach.fullName + (client.Coach.fullName !== client.Coach.nickname ? '(' + client.Coach.nickname + ')' : '')
                }
                return result
            })

        this.exportPassiveClients = () =>
            this.clients.passives.map(client => {
                let result = {
                    client: client.fullName + (client.fullName !== client.nickname ? '(' + client.nickname + ')' : ''),
                    created: $filter('date')(client.created_at, 'yyyy-MM-dd'),
                    from: $filter('date')(client.from, 'yyyy-MM-dd'),
                    to: $filter('date')(client.to, 'yyyy-MM-dd')
                }
                if (this.isAdmin) {
                    result.coach = client.Coach && client.Coach.fullName + (client.Coach.fullName !== client.Coach.nickname ? '(' + client.Coach.nickname + ')' : '')
                }
                return result
            })
})
