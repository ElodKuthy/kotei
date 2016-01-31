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
                        templateUrl: 'profile/my-profile.html',
                        controller: 'MyProfileController as myProfile'
                    }
                },
                resolve: {
                    profileInfo: (infoService) => {
                        return infoService.getMyProfile()
                    }
                },
                roles: ['client', 'coach', 'admin']
        })
    })
    .controller('MyProfileController', function (profileInfo) {
        this.profileInfo = profileInfo
    })