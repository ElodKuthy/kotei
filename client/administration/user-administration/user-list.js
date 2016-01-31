angular.module('kotei')
    .config(($stateProvider) => {

        $stateProvider
            .state('administration.user-list', {
                url: '/user-list',
                views: {
                    'navbar@': {
                        templateUrl: 'navbar/navbar.html',
                        controller: 'NavbarController as navbar'
                    },
                    'content@': {
                        templateUrl: 'administration/user-administration/user-list.html',
                        controller: 'UserListController as userList'
                    }
                },
                resolve: {
                    clients: (infoService) => {
                        return infoService.getAllClients()
                    },
                    coaches: (userInfoService, infoService) => {
                        return userInfoService.getUserInfo().isAdmin ? infoService.getAllCoaches() : []
                    }
                },
                roles: ['coach', 'admin']
        })
    })
    .controller('UserListController', function ($state, userInfoService, clients, coaches) {
        this.isAdmin = userInfoService.getUserInfo().isAdmin
        this.clients = clients
        this.coaches = coaches
        this.newUserButtonTitle = this.isAdmin ? 'Új felhasználó létrehozása' : 'Új tanítvány regisztrálása'

        this.newUser = () => $state.go('administration.new-user')
    })