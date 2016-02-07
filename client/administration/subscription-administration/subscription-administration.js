angular.module('kotei')
    .config(($stateProvider) => {

        $stateProvider
            .state('administration.new-subscription', {
                url: '/new-subscription',
                views: {
                    'navbar@': {
                        templateUrl: 'navbar/navbar.html',
                        controller: 'NavbarController as navbar'
                    },
                    'content@': {
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
    .controller('SubscriptionAdministrationController', function (R, $moment, userInfoService, clients, coaches, subscriptionTypes, infoService, modalService, administrationService) {

        const displayName = (client) => {
            return client.fullName == client.nickname
                ? client.fullName
                : `${client.fullName} "${client.nickname}"`
        }

        const addDisplayName = (clients) => R.map((client) => {
            client.displayName = displayName(client)
            return client
        }, clients)

        this.title = 'Bérletvásárlás'

        this.userInfo = userInfoService.getUserInfo()
        this.isAdmin = this.userInfo.isAdmin

        if (!this.isAdmin) {
            this.coach = this.userInfo
        }

        this.clients = addDisplayName(clients)
        this.coaches = addDisplayName(coaches)
        this.subscriptionTypes = subscriptionTypes
        this.type = this.subscriptionTypes[0]

        this.from = $moment().startOf('day').toDate()

        const decorateTrainings = (trainings) => {
            trainings.forEach((training) => {
                training.name = training.TrainingType.name
                training.date = $moment(training.from).toDate()
                training.coach = training.Coach.fullName
            })
            return trainings
        }

        this.typeChanged = () => {
            this.templates = null
            this.trainings = null
            this.variant = null
            this.credits = null
            infoService.getSubscriptionTemplates(this.type.id)
                .then((templates) => {
                    this.templates = R.map((template) => {
                        template.valid = template.SubscriptionVariant.valid
                        template.validText =
                            template.valid >= 7
                            ? `${template.valid / 7} hét`
                            : `${template.valid} nap`
                        template.amount = R.reduce((acc, credit) => acc + credit.amount,  0, template.CreditTemplates)
                        template.amountPerWeek =
                            template.valid >= 7
                            ? Math.ceil(template.amount * 7 / template.valid)
                            : template.amount
                        template.CreditTemplates.price = template.SubscriptionVariant.price
                        return template
                    }, templates)
                })
            infoService.getTrainingsByDateAndType($moment(this.from).startOf('isoweek').format(), $moment(this.from).endOf('isoweek').format(), this.type.id)
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
                to: $moment(this.from).startOf('day').add({ days: this.variant.valid }).format(),
                Credits: this.credits,
                price: this.credits.price,
                client_id: this.client.id,
                coach_id: this.coach.id,
                subscription_type_id: this.type.id,
                defaultTrainingDates: defaultTrainingDates
            }

            return administrationService.addNewSubscription(subscription).then(() => modalService.info(this.title, 'Sikeres bérletvásárlás'))
        }
    })