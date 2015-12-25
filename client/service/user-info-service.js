angular.module('kotei')
    .service('userInfoService', (jwtHelper) => {
        const decorate = (userInfo) => {
            if (userInfo && userInfo.role) {
                userInfo.isAuth   = true
                userInfo.isClient = userInfo.role === 'client'
                userInfo.isCoach  = userInfo.role === 'coach'
                userInfo.isAdmin  = userInfo.role === 'admin'
            }

            return userInfo
        }

        return {
            getUserInfo: () => {
                const token = localStorage.getItem('jwt')
                return token ? decorate(jwtHelper.decodeToken(token)) : null
            }
        }
    })