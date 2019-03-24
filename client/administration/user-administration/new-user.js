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
                resolve: {
                    coaches: (infoService) => {
                        return infoService.getAllCoaches()
                    }
                },
                roles: ['coach', 'admin']
        })
    })
    .controller('NewUserController', function ($q, $state, coaches, userInfoService, modalService, administrationService, nameService) {

        const userInfo = userInfoService.getUserInfo()

        this.isAdmin = userInfo.isAdmin

        this.title = this.isAdmin ? 'Új felhasználó létrehozása' : 'Új tanítvány regisztrálása'

        this.roles = [
            { name: "Tanítvány", value: "client" },
            { name: "Oktató", value: "coach" },
            { name: "Admin", value: "admin" }
        ]

        this.role = this.roles[0]

        this.user = {
            active: true
        }

        this.coaches = nameService.addDisplayName(coaches)

        const checkAdminRole = () => {
            if (this.user.role === 'admin') {
                return modalService.decision('Új admin létrehozása', 'Biztos, hogy egy új adminisztrátort akarsz létrehozni?')
            }

            return $q.resolve()
        }

        this.submit = () => {
            delete this.error
            this.user.role = this.role.value
            this.user.coach_id = this.coach ? this.coach.id : userInfo.id

            checkAdminRole().then(() => {
                administrationService.addNewUser(this.user)
                    .then((result) => {
                        return modalService.info(this.title, 'Sikeres regisztráció').then(() => $state.go('administration.new-subscription', { clientId: result.id }))
                    })
                    .catch((error) => {
                        this.error = error
                    })
            })
        }
    })