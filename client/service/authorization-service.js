angular.module('kotei')
    .service('authorizationService', (userInfoService) => {
        return {
            isAuthenticated: () => {
                const userInfo = userInfoService.getUserInfo()
                return !!userInfo
            }
        }
    })