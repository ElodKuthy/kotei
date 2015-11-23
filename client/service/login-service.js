import Promise from 'bluebird'

angular.module('kotei')
    .service('loginService', ($http) => {
        return {
            login: (credential, password) => {
                return $http.post('/api/login', {
                    userName: credential,
                    password: password
                }).then((result) => {
                    return result.data
                }, (error) => {
                    return Promise.reject(error.data.Error)
                })
            }
        }
    })