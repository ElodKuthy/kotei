angular.module('kotei')
    .config(($stateProvider) => {

        $stateProvider
            .state('login', {
                url: '/login',
                views: {
                    'navbar': {
                        templateUrl: 'navbar/navbar.html',
                        controller: 'NavbarController as navbar'
                    },
                    'content': {
                        templateUrl: 'login/login.html',
                        controller: 'LoginController as login'
                    }
                }
        })
    })
    .controller('LoginController', function (loginService, $state, $rootScope) {
        this.submit = () => {
            delete this.error
            loginService.login(this.credential, this.password)
                .then((result) => {
                    $state.go('schedule')
                })
                .catch((error) => {
                    this.error = error
                })
        }
    })