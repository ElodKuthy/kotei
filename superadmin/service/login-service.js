angular.module('superadmin')
    .service('loginService', ($http, $q) => {
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
                    return $q.reject(error.data.Error)
                })
            },
            logout: () => {
                localStorage.removeItem('jwt')
            }
        }
    })