const uuid = require('node-uuid').v4

const roles  = require('../common/roles')
const errors = require('../common/errors')
const localization = require('../localization/name')
const texts = require('../localization/texts')

const User = require('../model/user')
const Password = require('../model/password')

const mailerService = require('./mailer-service')

const Promise = require('bluebird')

const add = (user, auth) => {
    if (!auth.isAuth
        || auth.isClient
        || (auth.isCoach && user.role !== roles.client)) {

        return Promise.reject(errors.unauthorized)
    }

    if (!user.familyName
        || !user.givenName
        || !user.email
        || !user.role) {

        return Promise.reject(errors.missingOrInvalidParameters)
    }

    if (!user.nickname) {
        user.nickname = localization.fullName(user.familyName, user.givenName)
    }

    return User.create({
            familyName: user.familyName,
            givenName: user.givenName,
            nickname: user.nickname,
            email: user.email,
            role: user.role,
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
    add: add
}