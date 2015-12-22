angular.module('kotei')
    .config(($stateProvider) => {

        $stateProvider
            .state('reset-password', {
                url: '/reset-password/:token',
                views: {
                    'navbar': {
                        templateUrl: 'navbar/navbar.html',
                        controller: 'NavbarController as navbar'
                    },
                    'content': {
                        templateUrl: 'reset-password/reset-password.html',
                        controller: 'ResetPasswordController as resetPassword'
                    }
                }
        })
    })
    .controller('ResetPasswordController', function ($state, passwordService, modalService) {
        this.token = $state.params.token
        this.submit = () => {
            delete this.error
            if (this.password !== this.passwordAgain) {
                this.error = 'A két jelszó nem egyezik meg!'
                return
            }
            passwordService.reset(this.token, this.password)
                .then((result) => {
                    modalService.info(
                            'Jelszó változtatás',
                            'Sikeresen megváltoztattad a jelszavadat, kérlek a biztonság kedvéért add meg a belépési adataidat újra!'
                        ).then(() => $state.go('login'))
                })
                .catch((error) => {
                    this.error = error
                })
        }
    })