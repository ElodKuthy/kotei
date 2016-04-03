angular.module('kotei')
    .config(($stateProvider) => {

        $stateProvider
            .state('administration.edit-subscription', {
                url: '/edit-subscription/:subscriptionId',
                views: {
                    'navbar@': {
                        templateUrl: 'navbar/navbar.html',
                        controller: 'NavbarController as navbar'
                    },
                    'content@': {
                        templateUrl: 'administration/subscription-administration/edit-subscription.html',
                        controller: 'EditSubscriptionController as editSubscription'
                    }
                },
                resolve: {
                    subscription: ($stateParams, infoService) => {
                        return infoService.getSubscription($stateParams.subscriptionId)
                    },
                    coaches: (infoService) => {
                        return infoService.getAllCoaches()
                    },
                    subscriptionTypes: (infoService) => {
                        return infoService.getAllSubscriptionTypes()
                    }
                },
                roles: ['admin']
        })
    })
    .controller('EditSubscriptionController', function (R, $rootScope, $state, $moment, subscription, coaches, subscriptionTypes, nameService, administrationService, modalService) {

        if (subscription.length === 0) {
            $state.go('welcome')
            return
        }

        this.title = 'Bérlet módosítása'
        
        this.subscriptionTypes = subscriptionTypes

        this.subscription = subscription[0]
        
        this.subscription.SubscriptionType = R.find((type) => type.id === this.subscription.SubscriptionType.id, this.subscriptionTypes)
        
        this.subscription.from = $moment(this.subscription.from).toDate()
        this.subscription.to = $moment(this.subscription.to).toDate()
        this.subscription.Coach.displayName = nameService.displayName(this.subscription.Coach)

        this.coaches = nameService.addDisplayName(coaches)

        this.submit = () => {
            delete this.error

            var subscription = {
                id: this.subscription.id,
                from: $moment(this.subscription.from).format('YYYY-MM-DD'),
                to: $moment(this.subscription.to).format('YYYY-MM-DD'),
                coach_id: this.subscription.Coach.id,
                subscription_type_id: this.subscription.SubscriptionType.id,
                price: this.subscription.price 
            }

            administrationService.updateSubscription(subscription)
                .then(() => modalService.info(this.title, 'Sikeres bérletmódosítás'))
                .catch((error) => this.error = error)
        }
        
        this.delete = () => {
            administrationService.deleteSubscription(this.subscription.id)
                .then(() => modalService.info(this.title, 'A bérlet törlésre került'))
                .then(() => {
                    if ($rootScope.previousState.abstract
                        || $rootScope.previousState.name === 'forgotten-password'
                        || $rootScope.previousState.name === 'reset-password') {
                        $state.go('welcome')
                    } else {
                        $state.go($rootScope.previousState)
                    }
                })
                .catch((error) => this.error = error)
        }

    })