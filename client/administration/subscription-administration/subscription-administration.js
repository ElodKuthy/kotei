angular.module('kotei')
    .config(($stateProvider) => {

        $stateProvider
            .state('administration.new-subscription', {
                url: '/new-subscription',
                params: {
                    clientId: null,  
                },
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
                    },
                    allTrainingTypes: (infoService) => {
                        return infoService.getAllTrainingTypes()
                    }
                },
                roles: ['coach', 'admin']
        })
    })
    .controller('SubscriptionAdministrationController', function (R, $scope, $stateParams, $state, $moment, userInfoService, clients, coaches, subscriptionTypes, allTrainingTypes, infoService, modalService, administrationService, nameService) {

        this.title = 'Bérletvásárlás'

        this.userInfo = userInfoService.getUserInfo()
        this.isAdmin = this.userInfo.isAdmin

        if (!this.isAdmin) {
            this.coach = this.userInfo
        }

        this.clients = nameService.addDisplayName(clients)
        this.coaches = nameService.addDisplayName(coaches)
        this.subscriptionTypes = subscriptionTypes
        this.type = this.subscriptionTypes[0]
        const clientId = +$stateParams.clientId
        this.client = clientId ? this.clients.find(client => client.id === clientId) : null

        this.from = $moment().startOf('day').toDate()
        
        this.sendEmail = false

        const decorateTrainings = (trainings) => {
            trainings.forEach((training) => {
                training.name = training.TrainingType.name
                training.date = $moment(training.from).toDate()
                training.coach = training.Coach.fullName
            })
            return trainings
        }
        
        const filterTrainings = () => {
            if (this.isAdmin || this.showAllTraining) {
                this.trainings = this.allTrainings
            } else {
                this.trainings = R.filter((training) => training.Coach.id === this.coach.id, this.allTrainings)
            }            
        }

        this.typeChanged = () => {
            this.templates = null
            this.trainings = null
            this.variant = null
            this.credits = null

            if (!this.coach) {
                return
            }

            var coach;

            infoService.getSubscriptionTemplates(this.type.id)
                .then((templates) => {
                    this.templates = R.map((template) => {
                        template.valid = template.SubscriptionVariant.valid
                        template.validText =
                            template.valid >= 7
                            ? `${template.valid / 7} hét`
                            : `${template.valid} nap`

                        if (template.CreditTemplates.length > 1) {
                            template.CreditTemplates.sort((a, b) => a.TrainingType.name >= b.TrainingType.name)
                            template.CreditTemplates = R.map((creditTemplate) => {
                               creditTemplate.amountPerWeek = 
                                    template.valid >= 7
                                    ? Math.ceil(creditTemplate.amount * 7 / template.valid)
                                    : creditTemplate.amount
                                return creditTemplate
                            }, template.CreditTemplates)
                            template.amountPerWeek = template.CreditTemplates.reduce((acc, creditTemplate) => {
                                if (acc) {
                                    acc = acc + ' + '
                                }

                                return acc +
                                    (template.valid >= 7
                                    ? Math.ceil(creditTemplate.amount * 7 / template.valid)
                                    : creditTemplate.amount) + ' ' +
                                    creditTemplate.TrainingType.name
                            }, '')
                        } else {
                            template.amount = template.CreditTemplates[0].amount
                            template.CreditTemplates[0].amountPerWeek = 
                                 (template.valid >= 7
                                ? Math.ceil(template.amount * 7 / template.valid)
                                : template.amount)
                            template.amountPerWeek = template.CreditTemplates[0].amountPerWeek + ' alkalom'

                        }
                        template.CreditTemplates.price = template.SubscriptionVariant.price
                        return template
                    }, templates)
                    this.templates = R.filter((template) => {
                        coach = R.reduce((acc, value) => acc ? acc : value.Coach, null, template.CreditTemplates)
                        return !coach || coach.id === this.coach.id
                    }, this.templates)

                    const trainingTypeIds =
                        this.templates.some((template) => template.CreditTemplates.some((creditTemplate) => !creditTemplate.TrainingType))
                        ? allTrainingTypes.map((trainingType) => trainingType.id)
                        : this.templates.reduce((acc, template) => {
                            template.CreditTemplates.forEach((creditTemplate) => {
                                if (!acc.some((item) => item === creditTemplate.TrainingType.id)) {
                                    acc.push(creditTemplate.TrainingType.id)
                                }
                            })
                            return acc
                        }, []).sort((a, b) => a >= b)

                    const oneDay = !this.templates.some((template) => template.SubscriptionVariant.valid > 1)
                    const format = oneDay ? 'day' : 'isoweek'
                    const from = $moment(this.from).startOf(format).format()
                    const to = $moment(this.from).endOf(format).format()

                    infoService.getTrainingsByDateAndType(from, to, trainingTypeIds)
                        .then((trainings) => {
                            this.allTrainings = decorateTrainings(trainings)
                            filterTrainings()
                        })
                })

        }

        $scope.$watch(() => this.coach, this.typeChanged)

        $scope.$watch(() => this.from, this.typeChanged)
        
        $scope.$watch(() => this.showAllTraining, filterTrainings)

        this.clickTraining = (training) => {
            training.selected = !training.selected
        }
        
        this.invalid = () => !this.client || !this.coach || !this.variant || !this.credits
            || (R.filter(training => training.selected, this.trainings).length < R.reduce((acc, credit) => acc + credit.amountPerWeek, 0, this.credits))
        
        this.submit = () => {
            delete this.error

            var defaultTrainings = []

            this.trainings.forEach((training) => {
                if (training.selected) {
                    defaultTrainings.push(training)
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
                defaultTrainings: defaultTrainings,
                sendEmail: this.sendEmail
            }

            return administrationService.addNewSubscription(subscription)
                .then(() => modalService.info(this.title, 'Sikeres bérletvásárlás'))
                .then(() => $state.go('administration.user-profile', { userId: subscription.client_id }))
                .catch(error => this.error = error)
        }
    })