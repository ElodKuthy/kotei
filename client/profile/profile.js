angular.module('kotei')
    .config(($stateProvider) => {

        $stateProvider
            .state('profile', {
                url: '/profile',
                views: {
                    'navbar': {
                        templateUrl: 'navbar/navbar.html',
                        controller: 'NavbarController as navbar'
                    },
                    'content': {
                        templateUrl: 'profile/profile.html',
                        controller: 'ProfileController as profile'
                    }
                },
                roles: ['client', 'coach', 'admin']
        })
    })
    .controller('ProfileController', function (userInfoService) {
        this.userInfo = userInfoService.getUserInfo()
    })