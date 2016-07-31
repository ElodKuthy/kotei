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
            getCoachesStats: () => get('api/stats/coaches'),
            getTrainingsStats: (date) => get(`api/stats/trainings/${$moment(date).format('YYYY-MM-DD')}`)
        }
    })