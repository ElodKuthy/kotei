angular.module('kotei')
    .service('userInfoService', (jwtHelper, $http, $q) => {
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
            },
            getAllCoaches: () => {
                return $http({
                    method: 'GET',
                    url: '/api/user?where={"role":"coach"}&order=nickname%20ASC'
                }).then((result) => {
                    return result.data
                }, (error) => {
                    return $q.reject(error.data.Error)
                })
            }

        }
    })