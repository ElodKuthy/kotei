angular.module('superadmin')
    .controller('NavbarController', function (userInfoService, loginService, $state) {
        this.userInfo = userInfoService.getUserInfo()

        this.logout = () => {
            loginService.logout()
            $state.reload()
        }
    })