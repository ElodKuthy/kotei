import Promise from 'bluebird'

angular.module('kotei')
    .service('loginService', ($http) => {
        return {
            login: (credential, password) => {
                return $http({
                    method: 'POST',
                    url: '/api/login',
                    skipAuthorization: true,
                    data: {
                        userName: credential,
                        password: password
                    }
                }).then((result) => {
                    return localStorage.setItem('jwt', result.data.jwt)
                }, (error) => {
                    return Promise.reject(error.data.Error)
                })
            },
            logout: () => {
                localStorage.removeItem('jwt')
            }
        }
    })