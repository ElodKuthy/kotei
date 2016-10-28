angular.module('kotei')

    .config(($stateProvider) => {

        $stateProvider
            .state('schedule-list', {
                url: '/schedule-list',
                views: {
                    'navbar@': {
                        templateUrl: 'navbar/navbar.html',
                        controller: 'NavbarController as navbar'
                    },
                    'content@': {
                        templateUrl: 'schedule/schedule-list.html',
                        controller: 'ScheduleListController as vm'
                    }
                },
                roles: ['client', 'coach', 'admin']
        })
    })

    .controller('ScheduleListController', function ($state, infoService, globals) {
        this.trainingCategories = globals.trainingCategories
        
        if (globals.trainingCategories === null) {
            infoService.getAllTrainingCategories().then(result => {
                this.trainingCategories = globals.trainingCategories = result
            })
        }

        this.schedule =(id) => {
            $state.go('schedule', { categoryId: id })
        }
    })