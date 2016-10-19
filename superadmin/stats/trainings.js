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
    .controller('TrainingsController', function ($scope, $state, $filter, $moment, infoService) {

        this.date = $moment().endOf('month').toDate()
        this.minDate = $moment('2016-01-01').toDate()
        this.maxDate = $moment().endOf('month').toDate()
        this.onlyCore = true
        const coreGyms = ['retro', 'omszk', 'zuglo']

        this.dateChanged = () => {
            delete this.trainingsStats
            infoService.getTrainingsStats(this.date)                
                .then(trainingsStats => this.trainingsStats = trainingsStats
                .filter(stat => !this.onlyCore || coreGyms.indexOf(stat.gym) > -1))
        }

        $scope.$watch(() => this.date, this.dateChanged)

        this.exportTrainings = () => {            
            return this.trainingsStats.reduce((acc, curr) => {
                return acc.concat(curr.trainings.map(training => {
                    return {
                        gym: curr.gym,
                        name: training.name,
                        date: $filter('date')(training.from, 'EEEE HH:mm'),
                        coach: training.coach,
                        location: training.location,
                        utilization: training.utilization,
                        max: training.max,
                        percentage: Math.round(training.utilization / training.max * 100) + '%'
                    }
                }))
            }, [])
        }
})
