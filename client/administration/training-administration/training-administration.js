angular.module('kotei')
    .config(($stateProvider) => {

        $stateProvider
            .state('administration.new-training', {
                url: '/new-training',
                views: {
                    'navbar@': {
                        templateUrl: 'navbar/navbar.html',
                        controller: 'NavbarController as navbar'
                    },
                    'content@': {
                        templateUrl: 'administration/training-administration/training-administration.html',
                        controller: 'TrainingAdministrationController as trainingAdministration'
                    }
                },
                resolve: {
                    coaches: infoService => infoService.getAllCoaches(),
                    locations: infoService => infoService.getAllLocations(),
                    trainingTypes: infoService => infoService.getAllTrainingTypes(),
                    trainingCategories: infoService => infoService.getAllTrainingCategories()
                },
                roles: ['admin']
        })
    })
    .controller('TrainingAdministrationController', function ($state, $moment, coaches, locations, trainingTypes, modalService, administrationService, nameService, trainingCategories) {

        this.title = 'Új edzésalkalom létrehozása'

        this.coaches = nameService.addDisplayName(coaches)
        this.locations = locations
        this.trainingTypes = trainingTypes
        this.trainingCategories = trainingCategories

        this.submit = () => {
            delete this.error

            const newTraining = {
                name: this.training.name,
                from: this.training.from,
                to: this.training.to,
                max: this.training.max,
                coach_id: this.training.coach.id,
                location_id: this.training.location.id,
                training_type_id: this.training.type.id,
                training_category_id: this.training.category && this.training.category.id,
                interval: this.training.interval && $moment(this.training.interval).isAfter(this.training.to) ? this.training.interval : null
            }

            administrationService.addNewTraining(newTraining)
                    .then((result) => {
                        modalService.info(this.title, 'Sikeresen léterejöttek az új edzés(ek)').then($state.reload())
                    })
                    .catch((error) => {
                        this.error = error
                    })
        }
    })