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
                }
            })
    })

    .controller('ScheduleListController', function ($state, infoService, globals, userInfoService) {
        
        this.trainingCategories = globals.trainingCategories
        
        if (globals.trainingCategories === null) {
            infoService.getAllTrainingCategories().then(result => {
                this.trainingCategories = globals.trainingCategories = result
            })
        }

        this.publicSchedule = globals.publicSchedule
        this.userInfo = userInfoService.getUserInfo()
        
        if (globals.publicSchedule == null) {
            infoService.getPublicSchedule().then(result => {
                this.publicSchedule = globals.publicSchedule = result
            })
        }

        if (!this.publicSchedule && !this.userInfo) {
            $state.go('welcome')
        }

        this.schedule = (id) => {
            $state.go('schedule', { categoryId: id })
        }
    })