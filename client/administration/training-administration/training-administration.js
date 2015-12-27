angular.module('kotei')
    .config(($stateProvider) => {

        $stateProvider
            .state('new-training', {
                url: '/new-training',
                views: {
                    'navbar': {
                        templateUrl: 'navbar/navbar.html',
                        controller: 'NavbarController as navbar'
                    },
                    'content': {
                        templateUrl: 'administration/training-administration/training-administration.html',
                        controller: 'TrainingAdministrationController as trainingAdministration'
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
    .controller('TrainingAdministrationController', function ($moment, coaches, locations, subscriptionTypes, modalService, administrationService) {

        this.title = 'Új edzésalkalom létrehozása'

        this.coaches = coaches
        this.locations = locations
        this.subscriptionTypes = subscriptionTypes

        this.submit = () => {
            delete this.error

            var subscriptionTypeIds = []

            for (var property in this.training.selectedSubscriptionTypes) {
                if (this.training.selectedSubscriptionTypes.hasOwnProperty(property)) {
                    subscriptionTypeIds.push(property)
                }
            }

            const newTraining = {
                name: this.training.name,
                from: this.training.from,
                to: this.training.to,
                max: this.training.max,
                coach_id: this.training.coach.id,
                location_id: this.training.location.id,
                subscription_type_ids: subscriptionTypeIds,
                interval: this.training.interval && $moment(this.training.interval).isAfter(this.training.to) ? this.training.interval : null
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