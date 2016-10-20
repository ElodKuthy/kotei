angular.module('superadmin')
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
                    clientsStats: infoService => infoService.getClientsStats()
                },
                roles: ['admin']
        })
    })
    .controller('ClientsController', function ($scope, $moment, $filter, clientsStats) {
        this.onlyCore = true
        const coreGyms = ['retro', 'omszk', 'zuglo']

        this.clientsStats = clientsStats
        
        this.exportClients = () => {
            return this.clientsStats.reduce((acc, curr) => {
                return acc.concat(curr.clients.map(client => {
                    return {
                        gym: curr.gym,
                        name: client.name,
                        email: client.email,
                        phone: client.phone,
                        trainings: client.trainings.join('\n'),
                        coaches: client.coaches.join('\n'),
                        active: client.active ? 'Aktív' : 'Passzív',
                        registered: $filter('date')(client.registered, 'yyyy. MMMM dd.')
                    }
                }))
            }, [])
        }
})
