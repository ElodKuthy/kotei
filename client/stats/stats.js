angular.module('kotei')
    .config(($stateProvider) => {

        $stateProvider
            .state('stats', {
                url: '/stats',
                views: {
                    'navbar@': {
                        templateUrl: 'navbar/navbar.html',
                        controller: 'NavbarController as navbar'
                    },
                    'content@': {
                        templateUrl: 'stats/stats.html',
                        controller: 'StatsController as stats'
                    }
                },
                roles: ['coach', 'admin']
        })
    })
    
    .controller('StatsController', function (userInfoService) {

        const userInfo = userInfoService.getUserInfo()

        this.isAdmin = userInfo.isAdmin
    })
