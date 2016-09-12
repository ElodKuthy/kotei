angular.module('kotei')
    .service('loginService', ($http, $q) => {
        return {
            login: (credential, password) => $http({
                    method: 'POST',
                    url: '/api/login',
                    skipAuthorization: true,
                    data: {
                        userName: credential,
                        password: password
                    }   
                }).then(result => {
                    try {
                        return localStorage.setItem('jwt', result.data.jwt)
                    } catch (err) {
                        return $q.reject(err.code === 22 ? 'A Safari böngésző privát módjában nem lehet bejelentkezni. Használj normál módot, vagy egy másik fajta böngészőt!' : err)
                    }
                }, error => $q.reject(error.data.Error)),
            logout: () => localStorage.removeItem('jwt')
        }
    })