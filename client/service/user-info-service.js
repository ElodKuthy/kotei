angular.module('kotei')
    .service('userInfoService', (jwtHelper) => {
        return {
            getUserInfo: () => {
                const token = localStorage.getItem('jwt')
                return token ? jwtHelper.decodeToken(token) : null
            }
        }
    })