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
            getMyProfile: () => get('api/user/me'),
            getUser: (id) => get(`/api/user?where={"id":${id}}`).then((results) => results[0]),
            getAllClients: () => get('/api/user?where={"role":"client"}&order=nickname%20ASC'),
            getAllCoaches: () => get('/api/user?where={"role":"coach"}&order=nickname%20ASC'),
            getAllLocations: () => get('/api/location?order=name%20ASC'),
            getAllTrainingTypes: () => get('/api/training/type?order=name%20ASC'),
            getAllSubscriptionTypes: () => get('/api/subscription/type?order=name%20ASC'),
            getSubscriptionTemplates: (id) => get(`/api/subscription/template?where={"subscription_type_id":${id}}&order=valid%20ASC`),
            getTrainingById: (id) => get(`/api/training?where={"id":${id}}`).then((results) => results[0]),
            getTrainingsByDate: (from, to) => get(`/api/training?where={"$and":[{"from":{"$gte":"${from}"}},{"to":{"$lte":"${to}"}}]}&order=\`from\`%20ASC`),
            getTrainingsByDateAndType: (from, to, training_type_id) => get(`/api/training?where={"$and":[{"from":{"$gte":"${from}"}},{"to":{"$lte":"${to}"}},{"training_type_id":${training_type_id}}]}&order=\`from\`%20ASC`),
            getSubscriptionsByClient: (clientId) => get(`/api/subscription?where={"client_id":${clientId}}&order=\`from\`%20ASC`)
        }
    })