const errors = require('../common/errors')

const SubscriptionType = require('../model/Subscription-type')

const Promise = require('bluebird')

const findSubscriptionType = (query, auth) => {
    if (!auth.isCoach && !auth.isAdmin) {
        return Promise.reject(errors.unauthorized)
    }

    return SubscriptionType.findAll({
        attributes: ['id', 'name'],
        where: query
    }).catch((error) => Promise.reject(errors.missingOrInvalidParameters))
}

module.exports = {
    findSubscriptionType: findSubscriptionType
}