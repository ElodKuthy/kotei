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
                resolve: {},
                roles: ['admin']
        })
    })
    .controller('TrainingsController', function ($scope, $state, $moment, infoService) {

        this.date = $moment().endOf('month').toDate()
        this.minDate = $moment('2016-01-01').toDate()
        this.maxDate = $moment().endOf('month').toDate()

        this.dateChanged = () => {
            delete this.trainingsStats
            infoService.getTrainingsStats(this.date).then(trainingsStats => this.trainingsStats = trainingsStats)
        }

        $scope.$watch(() => this.date, this.dateChanged)

})
