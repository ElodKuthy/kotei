const errors = require('../common/errors')
const parser = require('../common/parser')

const Location = require('../model/model').Location

const Promise = require('bluebird')

const find = (query, auth) => {
    if (!auth.isCoach && !auth.isAdmin) {
        return Promise.reject(errors.unauthorized)
    }

    return Location.findAll(parser.parseQuery({
            attributes: ['id', 'name']
        }, query)).catch((error) => Promise.reject(errors.missingOrInvalidParameters))
}

module.exports = {
    find: find
}