angular.module('kotei')
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
                    userInfo: userInfoService => userInfoService.getUserInfo()
                },
                roles: ['coach', 'admin']
        })
    })
    .controller('TrainingsController', function ($scope, $state, $moment, $filter, userInfo, infoService) {

        this.isAdmin = userInfo.isAdmin
        this.month = $moment().subtract({month: 1}).startOf('month').toDate()

        this.dateChanged = (id, value) => {
            if ($moment(this.month).isSame(value, 'month')) {
                return
            }
            this.fetchStats(value)
        }

        this.fetchStats = value => {
            this.trainings = null
            const month = $moment(value || this.month).startOf('month').format('YYYY-MM-DD')
            infoService.getTrainingsStats(month).then(trainings => this.trainings = trainings)
        }

        this.fetchStats()

        this.header = [
            'Típus',
            'Időpont',
            'Terem',
            'Összes feliratkozás',
            'Összes megjelent',
            'Átlag feliratkozás',
            'Átlag megjelent',
            'Minimum feliratkozás',
            'Minimum megjelent',
            'Maximum feliratkozás',
            'Maximum megjelent'
        ]
        if (this.isAdmin) {
            this.header.push('Oktató')
        }

        this.export = () => this.trainings.map(({
            typeName,
            date,
            locationName,
            subscriptions,
            attendees,
            count,
            Coach
        }) => {
            let result = {
                typeName,
                date: $filter('date')(date, 'EEEE HH:mm'),
                locationName,
                subscriptionsSum: subscriptions.sum,
                attendeesSum: attendees.sum,
                subscriptionsAvg: count && Math.round(subscriptions.sum / count * 100) / 100,
                attendeesAvg: count && Math.round(attendees.sum / count * 100) / 100,
                subscriptionsMin: subscriptions.min,
                attendeesMin: attendees.min,
                subscriptionsMax: subscriptions.max,
                attendeesMax: attendees.max

            }
            if (this.isAdmin) {
                result.coach = Coach ? Coach.fullName + (Coach.fullName !== Coach.nickname ? '(' + Coach.nickname + ')' : '') : ''
            }
            return result
        })
})
