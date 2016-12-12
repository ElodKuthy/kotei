angular.module('kotei')
    .config(($stateProvider) => {

        $stateProvider
            .state('administration.subscription-template-list', {
                url: '/subscription-template-list',
                views: {
                    'navbar@': {
                        templateUrl: 'navbar/navbar.html',
                        controller: 'NavbarController as navbar'
                    },
                    'content@': {
                        templateUrl: 'administration/subscription-administration/subscription-template-list.html',
                        controller: 'SubscriptionTemplateListController as vm'
                    }
                },
                resolve: {
                    templates: (infoService) => {
                        return infoService.getAllSubscriptionTemplates()
                    },
                    coaches: (userInfoService, infoService) => {
                        return userInfoService.getUserInfo().isAdmin ? infoService.getAllCoaches() : []
                    }
                },
                roles: ['admin']
        })
    })
    .controller('SubscriptionTemplateListController', function ($state, $filter, userInfoService, templates, nameService) {
        this.templates = templates.map(template => ({
            id: template.id,
            name: template.SubscriptionType ? template.SubscriptionType.name : '-',
            category: template.CreditTemplates[0].TrainingCategory && template.CreditTemplates[0].TrainingCategory.name,
            training: template.CreditTemplates[0].TrainingType ? template.CreditTemplates[0].TrainingType.name : 'Összes',
            coach: template.CreditTemplates[0].Coach ? nameService.displayName(template.CreditTemplates[0].Coach) : 'Összes',
            price: $filter('currency')(template.SubscriptionVariant.price, 'Ft', 0),
            amount: template.CreditTemplates[0].amount,
            valid: template.SubscriptionVariant.valid > 7 ? template.SubscriptionVariant.valid / 7 + ' hét' : template.SubscriptionVariant.valid + ' nap',
            allowFreeCredits: template.allowFreeCredits ? 'Igen' : 'Nem'
        }))
        this.showCategory = templates.some(template => template.CreditTemplates[0].TrainingCategory)
        
        this.newSubscriptionTemplate = id => $state.go('administration.edit-subscription-template')
        this.editSubscriptionTemplate = id => $state.go('administration.edit-subscription-template', { id })
    })