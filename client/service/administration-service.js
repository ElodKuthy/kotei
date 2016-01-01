angular.module('kotei')
    .service('administrationService', ($http, $q) => {
        const post = (url, data) => {
            return $http({
                method: 'POST',
                url: url,
                data: data
            }).then((result) => {
                return result.data
            }, (error) => {
                return $q.reject(error.data.Error)
            })
        }

        return {
            addNewUser: (user) => post('/api/user', user),
            addNewTraining: (training) => post('/api/training', training),
            addNewSubscription: (subscription) => post('/api/subscription', subscription)
        }
    })