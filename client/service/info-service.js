angular.module('kotei')
    .service('infoService', (jwtHelper, $http, $q) => {

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
            getAllClients: () => get('/api/user?where={"role":"client"}&order=nickname%20ASC'),
            getAllCoaches: () => get('/api/user?where={"role":"coach"}&order=nickname%20ASC'),
            getAllLocations: () => get('/api/location?order=name%20ASC'),
            getAllSubscriptionTypes: () => get('/api/subscription/type?order=name%20ASC'),
            getSubscriptionVariants: (id) => get(`/api/subscription/variant?where={"subscription_type_id":${id}}&order=valid%20ASC`),
            getTrainingsByDateAndAllowedType: (from, to, subscription_type_id) => get(`/api/training?where={"$and":[{"from":{"$gte":"${from}"}},{"to":{"$lte":"${to}"}}]}&subscription_type_id=${subscription_type_id}&order=\`from\`%20ASC`)
        }
    })