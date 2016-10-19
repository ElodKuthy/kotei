angular.module('templates', [])

angular.module('kotei', [
        'ngMessages',
        'ui.router',
        'angular.filter',
        'angular-jwt',
        'ui.bootstrap',
        'ui.bootstrap.datetimepicker',
        'angular-momentjs',
        'templates',
        'ngSanitize',
        'ngCsv'
    ])
    .constant('R', R)
    .constant('Chartist', Chartist)
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

        //initialize get if not there
        if (!$httpProvider.defaults.headers.get) {
            $httpProvider.defaults.headers.get = {}  
        }    

        // Answer edited to include suggestions from comments
        // because previous version of code introduced browser-related errors

        //disable IE ajax request caching
        $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT'
        // extra
        $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache'
        $httpProvider.defaults.headers.get['Pragma'] = 'no-cache'

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