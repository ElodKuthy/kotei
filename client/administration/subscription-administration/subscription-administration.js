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
                    coaches: (infoService) => {
                        return infoService.getAllCoaches()
                    },
                    locations: (infoService) => {
                        return infoService.getAllLocations()
                    },
                    subscriptionTypes: (infoService) => {
                        return infoService.getAllSubscriptionTypes()
                    }
                },
                roles: ['admin']
        })
    })
    .controller('SubscriptionAdministrationController', function ($moment, coaches, locations, subscriptionTypes, modalService, administrationService) {

        this.title = 'Új edzésalkalom létrehozása'

        this.coaches = coaches
        this.locations = locations
        this.subscriptionTypes = subscriptionTypes

        this.submit = () => {
            delete this.error

            var subscriptionTypeIds = []

            for (var property in this.subscription.selectedSubscriptionTypes) {
                if (this.subscription.selectedSubscriptionTypes.hasOwnProperty(property)) {
                    subscriptionTypeIds.push(property)
                }
            }

            const newTraining = {
                name: this.subscription.name,
                from: this.subscription.from,
                to: this.subscription.to,
                max: this.subscription.max,
                coach_id: this.subscription.coach.id,
                location_id: this.subscription.location.id,
                subscription_type_ids: subscriptionTypeIds,
                interval: this.subscription.interval && $moment(this.subscription.interval).isAfter(this.subscription.to) ? this.subscription.interval : null
            }

            administrationService.addNewTraining(newTraining)
                    .then((result) => {
                        modalService.info(this.title, result)//.then($state.go('welcome'))
                    })
                    .catch((error) => {
                        this.error = error
                    })
        }
    })