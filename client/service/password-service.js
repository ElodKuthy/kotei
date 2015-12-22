angular.module('kotei')
    .service('passwordService', ($http) => {
        return {
            forgot: (email) => {
                return $http({
                    method: 'POST',
                    url: '/api/password/forgot',
                    skipAuthorization: true,
                    data: {
                        email: email
                    }
                }).then((result) => {
                    return result.data
                })
            },
            reset: (token, password) => {
                return $http({
                    method: 'POST',
                    url: '/api/password/reset',
                    skipAuthorization: true,
                    data: {
                        token: token,
                        password: password
                    }
                }).then((result) => {
                    return result.data
                }).catch((error) => {
                    throw error.data.Error
                })
            }
        }
    })