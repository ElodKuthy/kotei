require('./login.html')
require('./login.scss')

angular.module('kotei')
    .config(($stateProvider) => {

        $stateProvider
            .state('login', {
                url: '/login',
                views: {
                    'navbar': {
                        templateUrl: 'navbar.html'
                    },
                    'content': {
                        templateUrl: 'login.html',
                        controller: 'LoginController as login'
                    }
                }
        })
    })
    .controller('LoginController', function (loginService, $state, $mdToast) {
        this.submit = () => {
            delete this.error
            loginService.login(this.credential, this.password)
                .then((result) => {
                    $state.current.fromState.abstract ? $state.go('welcome') : $state.go($state.current.fromState)
                })
                .catch((error) => {
                    this.error = error
                })
        }
    })