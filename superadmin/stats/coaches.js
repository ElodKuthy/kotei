angular.module('superadmin')
    .config(($stateProvider) => {

        $stateProvider
            .state('stats.coaches', {
                url: '/coaches',
                views: {
                    'navbar@': {
                        templateUrl: 'navbar/navbar.html',
                        controller: 'NavbarController as navbar'
                    },
                    'content@': {
                        templateUrl: 'stats/coaches.html',
                        controller: 'CoachesController as vm'
                    }
                },
                resolve: {
                    coachesStats: (infoService) => infoService.getCoachesStats()
                },
                roles: ['admin']
        })
    })
    .controller('CoachesController', function ($scope, $moment, coachesStats) {
        this.coachesStats = coachesStats
})
