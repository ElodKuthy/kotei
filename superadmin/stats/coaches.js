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
                resolve: {},
                roles: ['admin']
        })
    })
    .controller('CoachesController', function ($scope, $moment, $filter, infoService) {
        this.month = $moment().toDate()
        this.onlyCore = true
        const coreGyms = ['retro', 'omszk', 'zuglo']
        
        this.dateChanged = (id, value) => {
            if (!$moment(this.month).isSame(value, 'month')) {
                this.fetchStats(value)
            }
        }

        this.fetchStats = month => {
            this.isLoading = true
            infoService.getCoachesStats(month).then(coachesStats => {
                this.isLoading = false
                this.coachesStats = coachesStats
                    .filter(stat => !this.onlyCore || coreGyms.indexOf(stat.gym) > -1)
                    .map(stat => {
                        stat.coaches = stat.coaches.map(coach => {
                            coach.trainings = coach.trainings.sort((a, b) => {
                                return $moment(a.from).valueOf() - $moment(b.from).valueOf()
                            })
                            return coach
                        })
                        return stat
                    })
            })
        }

        this.fetchStats(this.month)

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
            }, []);
        }
})
