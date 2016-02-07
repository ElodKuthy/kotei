angular.module('kotei')
    .config(($stateProvider) => {

        $stateProvider
            .state('schedule', {
                url: '/schedule',
                views: {
                    'navbar': {
                        templateUrl: 'navbar/navbar.html',
                        controller: 'NavbarController as navbar'
                    },
                    'content': {
                        templateUrl: 'schedule/schedule.html',
                        controller: 'ScheduleController as schedule'
                    }
                },
                resolve: {
                    from: ($moment) => {
                        return $moment().startOf('isoweek')
                    },
                    to: ($moment) => {
                        return $moment().endOf('isoweek')
                    },
                    trainings: ($moment, infoService) => {
                        return infoService.getTrainingsByDate($moment().startOf('isoweek').format('YYYY-MM-DD'), $moment().endOf('isoweek').format('YYYY-MM-DD'))
                    }
                },
                roles: ['client', 'coach', 'admin']
        })

            .state('schedule.custom', {
                url: '/:from/:to',
                views: {
                    'navbar@': {
                        templateUrl: 'navbar/navbar.html',
                        controller: 'NavbarController as navbar'
                    },
                    'content@': {
                        templateUrl: 'schedule/schedule.html',
                        controller: 'ScheduleController as schedule'
                    }
                },
                resolve: {
                    from: ($moment, $stateParams) => {
                        return $moment($stateParams.from)
                    },
                    to: ($moment, $stateParams) => {
                        return $moment($stateParams.to)
                    },
                    trainings: ($stateParams, infoService) => {
                        return infoService.getTrainingsByDate($stateParams.from, $stateParams.to)
                    }
                },
                roles: ['client', 'coach', 'admin']
        })
    })
    .controller('ScheduleController', function (R, $state, $moment, from, to, trainings, userInfoService) {

        this.previous = {
            from: $moment(from).subtract({ week: 1 }).format('YYYY-MM-DD'),
            to: $moment(to).subtract({ week: 1 }).format('YYYY-MM-DD'),
        }

        this.next = {
            from: $moment(from).add({ week: 1 }).format('YYYY-MM-DD'),
            to: $moment(to).add({ week: 1 }).format('YYYY-MM-DD'),
        }

        this.userInfo = userInfoService.getUserInfo()

        const days = ['Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat', 'Vasárnap']

        this.locations = []

        trainings.forEach((training) => {

            var location = R.find((current) => current.name === training.Location.name, this.locations)
            if (!location) {
                location = {
                    name: training.Location.name,
                    days: [null, null, null, null, null, null, null],
                    trainings: []
                }
                this.locations.push(location)
            }

            var from = $moment(training.from)
            var to = $moment(training.to)

            var hour = from.minutes() > 30 ? $moment(from).add({ hour: 1 }).format('HH:00') : from.format('HH:00')
            var row = R.find((current) => current.hour === hour, location.trainings)
            if (!row) {
                row = { hour: hour, cells: [[], [], [], [], [], [], []] }
                location.trainings.push(row)
            }

            var userSubscription = R.find((current) => current.Client.id === this.userInfo.id, training.Subscriptions)
            var involved = !!userSubscription
            var dayIndex = from.isoWeekday() - 1

            location.days[dayIndex] = days[dayIndex]
            row.cells[dayIndex].push({
                id: training.id,
                name: training.TrainingType.name,
                current: training.Subscriptions.length,
                max: training.max,
                coach: training.Coach.nickname,
                from: from.format('HH:mm'),
                to: to.format('HH:mm'),
                hasMinutes: from.minutes() || to.minutes(),
                involved: involved,
                attended: involved && $moment().isBefore(from),
                participated: involved && $moment().isAfter(from) && userSubscription.Attendee.checkIn,
                missed: involved && $moment().isAfter(from) && !userSubscription.Attendee.checkIn
            })
        })

        this.locations.forEach((location) => {
            var offset = 0
            location.days.forEach((day, index) => {
                if (!day) {
                    location.trainings.forEach((row) => {
                        row.cells.splice(index - offset, 1)
                    })
                    offset++
                }
            })
            location.days = R.filter((day) => !!day, location.days)
            location.trainings.sort((a, b) => a.hour >= b. hour)
        })

        this.showAttendees = (trainingId) => {
            $state.go('attendee-list', { trainingId: trainingId })
        }
    })