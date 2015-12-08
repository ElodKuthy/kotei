angular.module('kotei')
    .controller('NavbarController', function (userInfoService, loginService, $state) {
        const userInfo = userInfoService.getUserInfo()
        this.isLoggedIn = !!userInfo

        this.logout = () => {
            loginService.logout()
            $state.reload()
        }
    })