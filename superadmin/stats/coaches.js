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
    .controller('CoachesController', function ($scope, $moment, $filter, coachesStats) {
        this.coachesStats = coachesStats.map(function (stat) {
            stat.coaches = stat.coaches.map(function (coach) {
                coach.trainings = coach.trainings.sort(function (a, b) {
                    return $moment(a.from).valueOf() - $moment(b.from).valueOf()
                })
                return coach
            })
            return stat
        })

        function aggregateTrainings(acc, curr) {
            return acc + (acc === '' ? '' : '\n') +  curr.name + ' (' + $filter('date')(curr.from, 'EEEE HH:mm') + ')'
        }

        this.exportCoaches = function () {
            return this.coachesStats.reduce(function (acc, curr) {
                return acc.concat(curr.coaches.map(function (item) {
                    return {
                        fullName: item.coach.fullName,
                        gym: curr.gym,
                        count: item.count,
                        trainings: item.trainings.reduce(aggregateTrainings, '')
                    }
                }))
            }, []);
        }
})
