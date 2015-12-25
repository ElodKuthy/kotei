angular.module('kotei')
    .service('userAdministrationService', ($http, $q) => {
        return {
            addNewUser: (user) => {
                return $http({
                    method: 'POST',
                    url: '/api/user',
                    data: user
                }).then((result) => {
                    return result.data
                }, (error) => {
                    return $q.reject(error.data.Error)
                })
            }
        }
    })