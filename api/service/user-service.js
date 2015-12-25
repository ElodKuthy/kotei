const uuid = require('node-uuid').v4

const roles  = require('../common/roles')
const errors = require('../common/errors')
const localization = require('../localization/name')
const texts = require('../localization/texts')

const User = require('../model/user')
const Password = require('../model/password')

const mailerService = require('./mailer-service')

const Promise = require('bluebird')

const find = (query, auth) => {
    if (!auth.isCoach && !auth.isAdmin) {
        return Promise.reject(errors.unauthorized)
    }

    return User.findAll({
        attributes: ['id', 'familyName', 'givenName', 'nickname', 'email', 'role'],
        where: query
    }).catch((error) => Promise.reject(errors.missingOrInvalidParameters))
}

const add = (newUser, auth) => {
    if (!auth.isAuth
        || auth.isClient
        || (auth.isCoach && newUser.role !== roles.client)) {

        return Promise.reject(errors.unauthorized)
    }

    if (!newUser.familyName
        || !newUser.givenName
        || !newUser.email
        || !newUser.role) {

        return Promise.reject(errors.missingOrInvalidParameters)
    }

    if (!newUser.nickname) {
        newUser.nickname = localization.fullName(newUser.familyName, newUser.givenName)
    }

    return User.create({
            familyName: newUser.familyName,
            givenName: newUser.givenName,
            nickname: newUser.nickname,
            email: newUser.email,
            role: newUser.role,
            password: {
                token: uuid()
            }
        }, { include: [ Password ] })
        .then(mailerService.sendRegistration)
        .then(() => texts.successfulRegistration)
        .catch((error) => {
            if (error.name === 'SequelizeUniqueConstraintError') {
                if (error.fields.normalizedNickname) {
                    return Promise.reject(errors.nameAlreadyUsed)
                }

                if (error.fields.email) {
                    return Promise.reject(errors.emailAlreadyUsed)
                }
            }

            return Promise.reject(error)
        })
}

module.exports = {
    add: add,
    find: find
}