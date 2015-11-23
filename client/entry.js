import 'angular'
import 'angular-material/angular-material.css'
import angularMessages from 'angular-messages'
import angularAnimate from 'angular-animate'
import angularMaterial from 'angular-material'
import angularUIRouter from 'angular-ui-router'

require('./entry.scss')
require('./navbar/navbar.html')

angular.module('kotei', [angularAnimate, angularMessages, angularMaterial, angularUIRouter])
    .config(($stateProvider, $urlRouterProvider, $locationProvider, $mdThemingProvider) => {

        $urlRouterProvider.otherwise('/')

        $locationProvider.html5Mode(true)

        $stateProvider
            .state('welcome', {
                url: '/',
                views: {
                    'navbar': {
                        templateUrl: 'navbar.html'
                    }
              }
        })

        $mdThemingProvider.theme('default')
            .primaryPalette('blue')
            .backgroundPalette('blue-grey')
            .dark()
    })
    .run(($rootScope) => {
        $rootScope.$on('$stateChangeSuccess', (event, toState, toParams, fromState, fromParams) => {
            if (toState.name === 'login') {
                toState.fromState = fromState
            }
        })
    })

require('./login/login.js')
require('./service/login-service.js')
