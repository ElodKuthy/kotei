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

        const put = (url, data) => {
            return $http({
                method: 'PUT',
                url: url,
                data: data
            }).then((result) => {
                return result.data
            }, (error) => {
                return $q.reject(error.data.Error)
            })
        }

        const del = (url) => {
            return $http({
                method: 'DELETE',
                url: url
            }).then((result) => {
                return result.data
            }, (error) => {
                return $q.reject(error.data.Error)
            })
        }

        return {
            addNewUser: (user) => post('/api/user', user),
            updateUser: (user) => put('/api/user', user),
            addNewTraining: (training) => post('/api/training', training),
            addNewSubscription: (subscription) => post('/api/subscription', subscription),
            updateSubscription: (subscription) => put('/api/subscription', subscription),
            deleteSubscription: (subscriptionId) => del(`/api/subscription/${subscriptionId}`),
            addAttendee: (training_id, client_id) => post(`/api/attendee?training_id=${training_id}&client_id=${client_id}`),
            removeAttendee: (training_id, client_id) => del(`/api/attendee?training_id=${training_id}&client_id=${client_id}`),
            updateAttendee: (training_id, client_id, checkIn) => put(`/api/attendee?training_id=${training_id}&client_id=${client_id}`, { checkIn: checkIn }),
            resendRegistration: (userId) => post('/api/user/resend', { id: userId })
        }
    })