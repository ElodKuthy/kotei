angular.module('kotei')
    .config(($stateProvider) => {

        $stateProvider
            .state('administration.edit-subscription-template', {
                url: '/edit-subscription-template/:id?',
                views: {
                    'navbar@': {
                        templateUrl: 'navbar/navbar.html',
                        controller: 'NavbarController as navbar'
                    },
                    'content@': {
                        templateUrl: 'administration/subscription-administration/edit-subscription-template.html',
                        controller: 'EditSubscriptionTemplateController as vm'
                    }
                },
                resolve: {
                    templates: ($stateParams, infoService) => {
                        return $stateParams.id ? infoService.getSubscriptionTemplate($stateParams.id) : null
                    },
                    coaches: (infoService) => {
                        return infoService.getAllCoaches()
                    },
                    subscriptionTypes: (infoService) => {
                        return infoService.getAllSubscriptionTypes()
                    },
                    trainingTypes: infoService => infoService.getAllTrainingTypes(),
                    trainingCategories: infoService => infoService.getAllTrainingCategories()
                },
                roles: ['admin']
        })
    })
    .controller('EditSubscriptionTemplateController', function (R, $rootScope, $state, $moment, 
        templates, coaches, subscriptionTypes, trainingTypes, trainingCategories, nameService, administrationService, modalService) {

        if (templates && templates.length === 0) {
            $state.go('welcome')
            return
        }

        this.newTemplate = !templates
        this.title = this.newTemplate ? 'Új bérlettípus' : 'Bérlettpus módosítása'
        this.deleteButtonTitle = this.newTemplate ? 'Mégsem' : 'Törlés'
        
        this.subscriptionTypes = subscriptionTypes
        this.trainingCategories = trainingCategories
        this.trainingTypes = [{ name: 'Összes' }].concat(trainingTypes)
        this.coaches = [{ displayName: 'Összes' }].concat(nameService.addDisplayName(coaches))

        if (this.newTemplate) {
            this.name = this.subscriptionTypes.length ? this.subscriptionTypes[0] : null
            this.trainingCategory = this.trainingCategories.length ? this.trainingCategories[0] : null
            this.trainingType = this.trainingTypes.length ? this.trainingTypes[0] : null
        } else {
            const template = templates[0]
            this.id = template.id
            this.name = template.SubscriptionType
            this.trainingCategory = template.CreditTemplates[0].TrainingCategory
            this.trainingType = template.CreditTemplates[0].TrainingType
            this.coach = template.CreditTemplates[0].Coach
            this.price = template.SubscriptionVariant.price
            this.amount = template.CreditTemplates[0].amount
            this.valid = template.SubscriptionVariant.valid
            this.allowFreeCredits = template.allowFreeCredits
            this.subscription_variant_id = template.SubscriptionVariant.id
            this.credit_template_id = template.CreditTemplates[0].id
        }

        this.submit = () => {
            delete this.error

            const template = {
                id: this.id,
                subscription_type_id: this.name.id,
                training_category_id: this.trainingCategory && this.trainingCategory.id,
                training_type_id: this.trainingType && this.trainingType.id,
                coach_id: this.coach && this.coach.id,
                price: this.price,
                amount: this.amount,
                valid: this.valid,
                allowFreeCredits: this.allowFreeCredits,
                subscription_variant_id: this.subscription_variant_id,
                credit_template_id: this.credit_template_id
            }

            administrationService.updateSubscriptionTemplate(template)
                .then(() => modalService.info(this.title, `Sikeres bérlettípus ${this.newTemplate ? 'létrehozás' : 'módosítás'}`))
                .then(() => {
                    if (this.newTemplate) {
                        $state.go('administration.subscription-template-list')
                    }
                })
                .catch((error) => this.error = error)
        }
        
        this.delete = () => {
            if (this.newTemplate) {
                $state.go('administration.subscription-template-list')
            }
            administrationService.deleteSubscriptionTemplate(this.id)
                .then(() => modalService.info(this.title, 'A bérlet típus törlésre került'))
                .then(() => $state.go('administration.subscription-template-list'))
                .catch(error => this.error = error)
        }

    })
