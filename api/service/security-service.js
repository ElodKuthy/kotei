const Promise = require('bluebird')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const model = require('../model/model')
const User = model.User
const Password = model.Password
const mailerService = require('./mailer-service')
const localization = require('../localization/name')
const errors = require('../common/errors')

const cert = fs.readFileSync('certs/jwt-test-private.pem')

const userInfo = (user) => {
    return {
        id: user.id,
        name: user.fullName,
        nickname: user.nickname,
        email: user.email,
        role: user.role,
        qr: user.qr
    }
}

const login = (credential, userPassword) => {

    return User.findAll({
        where: {
            $or: {
                normalizedName: localization.normalizedName(credential),
                email: credential,
                normalizedNickName: localization.normalizedName(credential)
            }
        },
        include: [ Password ]
    }).then((results) => {
        if (!results || results.length === 0) {
            return Promise.reject(errors.invalidUserNameOrPassword)
        }
        if (results.length > 1) {
            return Promise.reject(errors.nonUniqueUserName)
        }

        const user = results[0]

        if (!user.Password.checkPassword(userPassword)) {
            return Promise.reject(errors.invalidUserNameOrPassword)
        }

        return { jwt: jwt.sign(userInfo(user), cert, { algorithm: 'RS512' }) }
    })
}

const forgot = (email) => {

    const user = User.findOne({ where: { email: email }, include: [ Password ]})

    return user.then((result) => (result ? result.Password.resetPassword() : Promise.reject(errors.invalidUserNameOrPassword)))
        .then((token) => mailerService.sendResetPasswordToken(user.value(), token))
        .then(() => 'OK')
        .catch(() => 'OK')
}

const reset = (token, newPassword) => {

    if (!newPassword)
        return Promise.reject(errors.missingOrInvalidParameters)

    return Password.findOne({ where: { token: token } })
        .then((password) => password ? password.setPassword(newPassword) : Promise.reject(errors.invalidOrExpiredToken))
        .then(() => 'OK')
}

module.exports = {
    login: login,
    forgot: forgot,
    reset: reset
}