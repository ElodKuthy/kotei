import 'angular'
import 'angular-material/angular-material.css'
import angularMessages from 'angular-messages'
import angularAnimate from 'angular-animate'
import angularMaterial from 'angular-material'
import angularUIRouter from 'angular-ui-router'
import angularJwt from 'angular-jwt'

require('./entry.scss')

angular.module('kotei', [angularAnimate, angularMessages, angularMaterial, angularUIRouter, angularJwt])
    .config(($stateProvider, $urlRouterProvider, $locationProvider, $mdThemingProvider, $httpProvider, jwtInterceptorProvider) => {

        $urlRouterProvider.otherwise('/')

        $locationProvider.html5Mode(true)

        $stateProvider
            .state('welcome', {
                url: '/',
                views: {
                    'navbar': {
                        templateUrl: 'navbar.html',
                        controller: 'NavbarController as navbar'
                    }
              }
        })

        $mdThemingProvider.theme('default')
            .primaryPalette('blue')
            .backgroundPalette('blue-grey')
            .dark()

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

require('./service/login-service.js')
require('./service/user-info-service.js')
require('./service/authorization-service.js')

require('./navbar/navbar.js')
require('./login/login.js')
require('./profile/profile.js')