angular.module('superadmin')
    .config(($stateProvider) => {

        $stateProvider
            .state('forgotten-password', {
                url: '/forgotten-password',
                views: {
                    'navbar': {
                        templateUrl: 'navbar/navbar.html',
                        controller: 'NavbarController as navbar'
                    },
                    'content': {
                        templateUrl: 'forgotten-password/forgotten-password.html',
                        controller: 'ForgottenPasswordController as forgottenPassword'
                    }
                }
        })
    })
    .controller('ForgottenPasswordController', function (userInfoService, loginService, passwordService, modalService, $state) {

        if (userInfoService.getUserInfo()) {
            loginService.logout()
            $state.reload()
        }

        this.submit = () => {
            passwordService.forgot(this.email)
                .finally((result) => {
                    modalService.info('Elfelejtett jelszó', 'Amennyiben helyesen adtad meg az email címedet, akkor hamarosan kapsz egy emailt, amiben leírtakat követve állíthatod be az új jelszavadat.')
                        .then(() => $state.go('welcome'))
                })
        }
    })