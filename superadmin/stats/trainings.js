angular.module('superadmin')
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
                    trainingsStats: (infoService) => {
                        return infoService.getTrainingsStats()
                    }
                },
                roles: ['admin']
        })
    })
    .controller('TrainingsController', function ($scope, $state, $moment, trainingsStats) {

        this.trainingsStats = trainingsStats
})
