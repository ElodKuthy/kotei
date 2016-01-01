angular.module('kotei')
    .config(($stateProvider) => {

        $stateProvider
            .state('new-subscription', {
                url: '/new-subscription',
                views: {
                    'navbar': {
                        templateUrl: 'navbar/navbar.html',
                        controller: 'NavbarController as navbar'
                    },
                    'content': {
                        templateUrl: 'administration/subscription-administration/subscription-administration.html',
                        controller: 'SubscriptionAdministrationController as subscriptionAdministration'
                    }
                },
                resolve: {
                    clients: (infoService) => {
                        return infoService.getAllClients()
                    },
                    coaches: (infoService) => {
                        return infoService.getAllCoaches()
                    },
                    subscriptionTypes: (infoService) => {
                        return infoService.getAllSubscriptionTypes()
                    }
                },
                roles: ['coach', 'admin']
        })
    })
    .controller('SubscriptionAdministrationController', function ($moment, userInfoService, clients, coaches, subscriptionTypes, infoService, modalService, administrationService) {

        this.title = 'Bérletvásárlás'

        this.userInfo = userInfoService.getUserInfo()
        this.isAdmin = this.userInfo.isAdmin

        if (!this.isAdmin) {
            this.coach = this.userInfo
        }

        this.clients = clients
        this.coaches = coaches
        this.subscriptionTypes = subscriptionTypes
        this.type = this.subscriptionTypes[0]

        this.coachDictionary = {}
        coaches.forEach((coach) => this.coachDictionary[coach.id] = coach.nickname)

        this.from = $moment().startOf('day').toDate()

        const decorateTrainings = (trainings) => {
            trainings.forEach((training) => {
                training.date = $moment(training.from).toDate()
                training.coach = this.coachDictionary[training.coach_id]
            })
            return trainings
        }

        this.typeChanged = () => {
            this.variants = null
            this.trainings = null
            this.amount = null
            infoService.getSubscriptionVariants(this.type.id)
                .then((variants) => this.variants = variants)
            infoService.getTrainingsByDateAndAllowedType($moment('2016-01-04').startOf('week').format(), $moment('2016-01-04').endOf('week').format(), this.type.id)
                .then((trainings) => this.trainings = decorateTrainings(trainings))
        }

        this.typeChanged()

        this.clickTraining = (training) => {
            training.selected = !training.selected
        }


        this.submit = () => {
            delete this.error

            var defaultTrainingDates = []

            this.trainings.forEach((training) => {
                if (training.selected) {
                    defaultTrainingDates.push(training.from)
                }
            })

            var subscription = {
                from: $moment(this.from).startOf('day').format(),
                to: $moment(this.from).startOf('day').add({ days: this.valid.valid }).format(),
                amount: this.amount.amount,
                price: this.amount.price,
                client_id: this.client.id,
                coach_id: this.coach.id,
                subscription_type_id: this.type.id,
                defaultTrainingDates: defaultTrainingDates
            }

            console.log(subscription)
            //return administrationService.addNewSubscription(subscription).then(() => modalService.info(this.title, 'Sikeres bérletvásárlás'))
        }
    })