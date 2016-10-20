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
                    coachesStats: infoService => infoService.getCoachesStats()
                },
                roles: ['admin']
        })
    })
    .controller('CoachesController', function ($scope, $moment, $filter, coachesStats) {
        this.onlyCore = true
        const coreGyms = ['retro', 'omszk', 'zuglo']
        
        const sortedCoachesStats = coachesStats.map(stat => {
            stat.coaches = stat.coaches.map(coach => {
                coach.trainings = coach.trainings.sort((a, b) => {
                    return $moment(a.from).valueOf() - $moment(b.from).valueOf()
                })
                return coach
            })
            return stat
        })

        this.changeFilter = () => {
            this.coachesStats = sortedCoachesStats
                .filter(stat => !this.onlyCore || coreGyms.indexOf(stat.gym) > -1)

        }

        this.changeFilter()

        function aggregateTrainings(acc, curr) {
            return acc + (acc === '' ? '' : '\n') + curr.name + ' (' + $filter('date')(curr.from, 'EEEE HH:mm') + ')'
        }

        this.exportCoaches = () => {
            return this.coachesStats.reduce((acc, curr) => {
                return acc.concat(curr.coaches.map(item => {
                    return {
                        fullName: item.coach.fullName,
                        gym: curr.gym,
                        count: item.count,
                        trainings: item.trainings.reduce(aggregateTrainings, '')
                    }
                }))
            }, [])
        }
})
