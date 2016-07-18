angular.module('superadmin')
    .config(($stateProvider) => {

        $stateProvider
            .state('stats', {
                url: '/stats',
                views: {
                    'navbar@': {
                        templateUrl: 'navbar/navbar.html',
                        controller: 'NavbarController as navbar'
                    },
                    'content@': {
                        templateUrl: 'stats/stats.html',
                        controller: 'StatsController as stats'
                    }
                },
                roles: ['admin']
        })
    })
    
    .controller('StatsController', function () {})
