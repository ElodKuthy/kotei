angular.module('superadmin')
    .service('infoService', (jwtHelper, $http, $q, $moment) => {

        const get = (url) => {
                return $http({
                    method: 'GET',
                    url: url
                }).then((result) => {
                    return result.data
                }, (error) => {
                    return $q.reject(error.data.Error)
                })
        }

        return {
        }
    })