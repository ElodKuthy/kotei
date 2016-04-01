angular.module('kotei')
    .config(($stateProvider) => {

        $stateProvider
            .state('administration', {
                url: '/administration',
                views: {
                    'navbar@': {
                        templateUrl: 'navbar/navbar.html',
                        controller: 'NavbarController as navbar'
                    },
                    'content@': {
                        templateUrl: 'administration/administration.html',
                        controller: 'AdministrationController as administration'
                    }
                },
                roles: ['coach', 'admin']
        })
    })
    
    .controller('AdministrationController', function (userInfoService) {

        const userInfo = userInfoService.getUserInfo()

        this.isAdmin = userInfo.isAdmin
    })
