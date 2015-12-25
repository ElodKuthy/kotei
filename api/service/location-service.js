const errors = require('../common/errors')

const Location = require('../model/location')

const Promise = require('bluebird')

const find = (query, auth) => {
    if (!auth.isCoach && !auth.isAdmin) {
        return Promise.reject(errors.unauthorized)
    }

    return Location.findAll({
        attributes: ['id', 'name'],
        where: query
    }).catch((error) => Promise.reject(errors.missingOrInvalidParameters))
}

module.exports = {
    find: find
}