angular.module('kotei')
    .config(($stateProvider) => {

        $stateProvider
            .state('administration.new-user', {
                url: '/new-user',
                views: {
                    'navbar@': {
                        templateUrl: 'navbar/navbar.html',
                        controller: 'NavbarController as navbar'
                    },
                    'content@': {
                        templateUrl: 'administration/user-administration/new-user.html',
                        controller: 'NewUserController as newUser'
                    }
                },
                roles: ['coach', 'admin']
        })
    })
    .controller('NewUserController', function ($q, $state, userInfoService, modalService, administrationService) {

        const userInfo = userInfoService.getUserInfo()

        this.isAdmin = userInfo.isAdmin

        this.title = this.isAdmin ? 'Új felhasználó létrehozása' : 'Új tanítvány regisztrálása'

        this.roles = [
            { name: "Tanítvány", value: "client" },
            { name: "Edző", value: "coach" },
            { name: "Admin", value: "admin" }
        ]

        this.role = this.roles[0]

        this.user = {
            active: true,
            coach_id: userInfo.id
        }

        const checkAdminRole = () => {
            if (this.user.role === 'admin') {
                return modalService.decision('Új admin létrehozása', 'Biztos, hogy egy új adminisztrátort akarsz létrehozni?')
            }

            return $q.resolve()
        }

        this.submit = () => {
            delete this.error
            this.user.role = this.role.value

            checkAdminRole().then(() => {
                administrationService.addNewUser(this.user)
                    .then((result) => {
                        modalService.info(this.title, result).then($state.go('administration.new-subscription'))
                    })
                    .catch((error) => {
                        this.error = error
                    })
            })
        }
    })