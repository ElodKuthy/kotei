angular.module('kotei')
    .controller('NavbarController', function (userInfoService, loginService, $state, infoService, globals) {
        this.userInfo = userInfoService.getUserInfo()

        this.trainingCategories = globals.trainingCategories
        
        if (globals.trainingCategories === null) {
            infoService.getAllTrainingCategories().then(result => {
                this.trainingCategories = globals.trainingCategories = result
            })
        }

        this.schedule =(id) => {
            $state.go('schedule', { categoryId: id })
        }

        this.logout = () => {
            loginService.logout()
            $state.reload()
        }
    })