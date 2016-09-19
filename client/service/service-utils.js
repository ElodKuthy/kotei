angular.module('kotei')
    .service('serviceUtils', ($moment) => {

        const convertTrainingsFilterToQuery = filter => {
            const query = {
                $and: []
            }

            if (filter.fromDate) {
                query.$and.push({
                    from: { $gte: $moment(filter.fromDate).format('YYYY-MM-DD')}
                })
            }

            if (filter.toDate) {
                query.$and.push({
                    to: { $lte: $moment(filter.toDate).add({ day: 1 }).format('YYYY-MM-DD')}
                })
            }

            if (filter.trainingTypeId) {
                query.$and.push({
                    training_type_id: filter.trainingTypeId
                })
            }

            if (filter.coachId) {
                query.$and.push({
                    coach_id: filter.coachId
                })
            }

            if (filter.locationId) {
                query.$and.push({
                    location_id: filter.locationId
                })
            }

            return JSON.stringify(query)
        }

        return {
            convertTrainingsFilterToQuery
        }
    })

