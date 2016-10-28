angular.module('kotei')
    .service('infoService', (jwtHelper, $http, $q, $moment, serviceUtils) => {

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

        const concatTrainingTypeIds = (trainingTypeIds) => {
            return trainingTypeIds.reduce((acc, value) => {
                if (acc) {
                    acc += ','
                }

                return `${acc}{"training_type_id": ${value}}`
            }, '')
        }

        return {
            getMyProfile: () => get('api/user/me'),
            getUser: (id) => get(`/api/user?where={"id":${id}}`).then((results) => results[0]),
            getAllClients: () => get('/api/user?where={"role":"client"}&order=nickname%20ASC'),
            getAllCoaches: () => get('/api/user?where={"role":"coach"}&order=nickname%20ASC'),
            getAllLocations: () => get('/api/location?order=name%20ASC'),
            getAllTrainingTypes: () => get('/api/training/type?order=name%20ASC'),
            getAllTrainingCategories: () => get('/api/training/category'),
            getAllSubscriptionTypes: () => get('/api/subscription/type?order=name%20ASC'),
            getSubscriptionTemplates: (id) => get(`/api/subscription/template?where={"subscription_type_id":${id}}&order=valid%20ASC`),
            getTrainingById: (id) => get(`/api/training?where={"id":${id}}`).then((results) => results[0]),
            getTrainingsByDate: (from, to, categoryId) => get(`/api/training?where={"$and":[${categoryId ? `{"training_category_id":${categoryId}},` : ''}{"from":{"$gte":"${from}"}},{"to":{"$lte":"${to}"}}]}&order=\`from\`%20ASC`),
            getTrainingsByDateAndType: (from, to, trainingTypeIds) => get(`/api/training?where={"$and":[{"from":{"$gte":"${from}"}},{"to":{"$lte":"${to}"}},{"\$or":[${concatTrainingTypeIds(trainingTypeIds)}]}]}&order=\`from\`%20ASC`),
            getSubscriptionsByClient: (clientId) => get(`/api/subscription?where={"client_id":${clientId}}&order=\`from\`%20ASC`),
            getSubscription: (subscriptionId) => get(`/api/subscription?where={"id":${subscriptionId}}`),
            getActiveSubscriptions: () => get(`/api/stats/subscriptions/active`),
            getSoldSubscriptions: month => get(`/api/stats/subscriptions/sold?month=${month}`),
            getPayoffs: (from, to) => get(`/api/stats/payoffs?where={"from":{"$gte":"${from}"},"to":{"$lte":"${to}"}}`),
            getRuleAllowedFreeCredit: () => get('/api/rule/allow/free/credit'),
            getTrainingsByFilter: filter => get(`/api/training?where=${serviceUtils.convertTrainingsFilterToQuery(filter)}&order=\`from\`%20ASC&dayOfTheWeek="${filter.dayOfTheWeek || ''}"&trainingFromTime="${filter.fromTime || ''}"&trainingToTime="${filter.toTime || ''}"`),
            getStatsOverview: month => get(`/api/stats/overview?month=${month}`),
            getClientsStats: month => get(`/api/stats/clients?month=${month}`),
            getTrainingsStats: month => get(`/api/stats/trainings?month=${month}`)
        }
    })