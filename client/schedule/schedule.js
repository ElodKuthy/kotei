angular.module('kotei')
    .config(($stateProvider) => {

        $stateProvider
            .state('schedule', {
                url: '/schedule?categoryId',
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
                        return $moment().startOf('isoweek').add({ week: 1 })
                    },
                    trainings: ($stateParams, $moment, infoService) => {
                        return infoService.getTrainingsByDate($moment().startOf('isoweek').format('YYYY-MM-DD'), 
                            $moment().startOf('isoweek').add({ week: 1 }).format('YYYY-MM-DD'), $stateParams.categoryId)
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
                        return infoService.getTrainingsByDate($stateParams.from, $stateParams.to, $stateParams.categoryId)
                    }
                },
                roles: ['client', 'coach', 'admin']
        })
    })
    .controller('ScheduleController', function (R, $state, $moment, from, to, trainings, userInfoService, administrationService,
        modalService) {

        this.previous = {
            from: $moment(from).subtract({ week: 1 }).format('YYYY-MM-DD'),
            to: $moment(to).subtract({ week: 1 }).format('YYYY-MM-DD'),
        }

        this.next = {
            from: $moment(from).add({ week: 1 }).format('YYYY-MM-DD'),
            to: $moment(to).add({ week: 1 }).format('YYYY-MM-DD'),
        }

        this.title = `Órarend ${$moment(from).format('YYYY. MM. DD.')} - ${$moment(to).format('YYYY. MM. DD.')}`

        this.userInfo = userInfoService.getUserInfo()

        this.from = from
        this.to = to

        const days = R.map((offset) => $moment(from).add({ days: offset }).valueOf(), [0, 1, 2, 3, 4, 5, 6])

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

            var dayIndex = from.isoWeekday() - 1

            location.days[dayIndex] = days[dayIndex]
            row.cells[dayIndex].push({
                id: training.id,
                name: training.TrainingType.name,
                utilization: training.utilization,
                current: training.Subscriptions && training.Subscriptions.length,
                max: training.max,
                coach: training.Coach.nickname,
                from: from.format('HH:mm'),
                to: to.format('HH:mm'),
                hasMinutes: from.minutes() || to.minutes(),
                involved: training.involved,
                attended: training.attended,
                participated: training.participated,
                missed: training.missed,
                canJoin: training.canJoin,
                canLeave: training.canLeave,
                canModify: training.canModify,
                canSeeAttendees: training.canSeeAttendees,
                isCoach: training.Coach.id === this.userInfo.id
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
            location.trainings.sort((a, b) => a.hour < b.hour ? -1 : 1)
        })

        this.manipulate = (training) => {
            if (training.canSeeAttendees || training.canModify || training.isCoach) {
                $state.go('attendee-list', { trainingId: training.id })
            } else if (training.canJoin) {
                administrationService.addAttendee(training.id, this.userInfo.id)
                    .then(() => $state.reload())
                    .catch(error => modalSerive.info(this.title, error))
            } else if (training.canLeave) {
                administrationService.removeAttendee(training.id, this.userInfo.id)
                    .then(() => $state.reload())
                    .catch(error => modalSerive.info(this.title, error))
            }
        }
    })