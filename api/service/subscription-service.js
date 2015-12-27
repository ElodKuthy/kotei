const errors = require('../common/errors')
const parser = require('../common/parser')

const SubscriptionType = require('../model/Subscription-type')

const Promise = require('bluebird')

const findSubscriptionType = (query, auth) => {
    if (!auth.isCoach && !auth.isAdmin) {
        return Promise.reject(errors.unauthorized)
    }

    return SubscriptionType.findAll(parser.parseQuery({
        attributes: ['id', 'name']
    }, query)).catch((error) => Promise.reject(errors.missingOrInvalidParameters))
}

module.exports = {
    findSubscriptionType: findSubscriptionType
}