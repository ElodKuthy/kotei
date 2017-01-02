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
                    clients: infoService => infoService.getAllClients(),
                    coaches: infoService => infoService.getAllCoaches(),
                    subscriptionTypes: infoService => infoService.getAllSubscriptionTypes(),
                    allTrainingTypes: infoService => infoService.getAllTrainingTypes(),
                    allTrainingCategories: infoService => infoService.getAllTrainingCategories(),
                },
                roles: ['coach', 'admin']
        })
    })
    .controller('SubscriptionAdministrationController', function (R, $scope, $stateParams, $state, $moment, userInfoService, clients, coaches, subscriptionTypes, allTrainingTypes, infoService, modalService, administrationService, nameService, allTrainingCategories) {

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
        this.client = clientId ? R.find(client => client.id === clientId, this.clients) : null

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
                this.trainings = R.filter((training) => training.Coach.id === this.coach.id, this.allTrainings || [])
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
                            template.CreditTemplates = r.sort((a, b) => a.TrainingType.name >= b.TrainingType.name, template.CreditTemplates)
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
                    this.templates = R.sort((a, b) => {
                        if (a.valid === b.valid) {
                            return a.amount > b.amount
                        }

                        return a.valid > b.valid
                    } , this.templates)

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

                    const trainingCategoryIds =
                        this.templates.some((template) => template.CreditTemplates.some((creditTemplate) => !creditTemplate.TrainingCategory))
                        ? allTrainingCategories.map((trainingCategory) => trainingCategory.id)
                        : this.templates.reduce((acc, template) => {
                            template.CreditTemplates.forEach((creditTemplate) => {
                                if (!acc.some((item) => item === creditTemplate.TrainingCategory.id)) {
                                    acc.push(creditTemplate.TrainingCategory.id)
                                }
                            })
                            return acc
                        }, []).sort((a, b) => a >= b)

                    const days = this.templates.reduce((acc, curr) => Math.max(acc, curr.SubscriptionVariant.valid), 0)
                    const from = $moment(this.from).startOf('day').format('YYYY-MM-DD')
                    const to = $moment(this.from).startOf('day').add({ days }).format('YYYY-MM-DD')

                    infoService.getTrainingsByDateAndType(from, to, trainingTypeIds, trainingCategoryIds)
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
            || (!this.variant.allowFreeCredits && (R.filter(training => training.selected, this.trainings).length < R.reduce((acc, credit) => acc + credit.amountPerWeek, 0, this.credits)))

        const calculateFrom = (from) => {
            const previousWeek = $moment(from).subtract({ week: 1})
            if (previousWeek.isAfter(this.from)) {
                return calculateFrom(previousWeek)
            } else {
                return from
            }
        }

        this.submit = () => {
            delete this.error

            var defaultTrainings = []

            this.trainings.forEach((training) => {
                if (training.selected) {
                    defaultTrainings.push({
                        from: calculateFrom(training.from),
                        Location: training.Location
                    })
                }
            })

            var subscription = {
                from: $moment(this.from).startOf('day').format('YYYY-MM-DD'),
                to: $moment(this.from).startOf('day').add({ days: this.variant.valid }).format('YYYY-MM-DD'),
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