angular.module('templates', [])

angular.module('kotei', [
        'ngMessages',
        'ui.router',
        'angular-jwt',
        'ui.bootstrap',
        'templates'
    ])
    .config(($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider, jwtInterceptorProvider) => {

        $urlRouterProvider.otherwise('/')

        $locationProvider.html5Mode(true)

        $stateProvider
            .state('welcome', {
                url: '/',
                views: {
                    'navbar': {
                        templateUrl: 'navbar/navbar.html',
                        controller: 'NavbarController as navbar'
                    }
              }
        })

        jwtInterceptorProvider.tokenGetter = () => localStorage.getItem('jwt')

        $httpProvider.interceptors.push('jwtInterceptor')
    })
    .run(($rootScope, userInfoService, $state) => {
        $rootScope.$on('$stateChangeStart', (event, toState, toParams, fromState, fromParams) => {
            const roles = toState.roles
            const userInfo = userInfoService.getUserInfo()

            if (userInfo && toState.name === 'login') {
                event.preventDefault()
                if (fromState.abstract) {
                    $state.go('welcome')
                }
            }

            if (toState.roles && (!userInfo || roles.indexOf(userInfo.role) === -1)) {
                event.preventDefault()
                $state.go('login')
            }
        })

        $rootScope.$on('$stateChangeSuccess', (event, toState, toParams, fromState, fromParams) => {
            $rootScope.previousState = fromState;
        })
    })