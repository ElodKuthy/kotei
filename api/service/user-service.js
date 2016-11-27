const uuid = require('node-uuid').v4

const roles  = require('../common/roles')
const errors = require('../common/errors')
const localization = require('../localization/name')
const texts = require('../localization/texts')
const parser = require('../common/parser')
const rules = require('../common/rules')

const model = require('../model/model')()
const User = model.User
const Password = model.Password

const mailerService = require('./mailer-service')

const Promise = require('bluebird')

const find = (query, auth) => {
    if (!auth.isCoach && !auth.isAdmin) {
        return Promise.reject(errors.unauthorized())
    }

    return User.findAll(parser.parseQuery({
        attributes: [
            'id',
            'familyName',
            'givenName',
            'nickname',
            'email',
            'role',
            'address',
            'phone',
            'active',
            'coach_id',
            'created_at'
        ],
        include: [{
            model: User,
            as: 'Coach'
        }]
    }, query))
    .then(users => auth.isAdmin || rules.coachSeeAllClients() ? users : users.filter(user => user.id === auth.id
        || (user.role === roles.client && (!user.coach_id || user.coach_id === auth.id))))
    .catch((error) => Promise.reject(errors.missingOrInvalidParameters()))
}

const add = (newUser, auth) => {
    if (!auth.isAuth
        || auth.isClient
        || (auth.isCoach && newUser.role !== roles.client)) {

        return Promise.reject(errors.unauthorized())
    }

    if (!newUser.familyName
        || !newUser.givenName
        || !newUser.email
        || !newUser.role) {

        return Promise.reject(errors.missingOrInvalidParameters())
    }

    if (!newUser.nickname) {
        newUser.nickname = localization.fullName(newUser.familyName, newUser.givenName)
    }

    return User.create({
            familyName: newUser.familyName,
            givenName: newUser.givenName,
            nickname: newUser.nickname,
            email: newUser.email.toLowerCase(),
            role: newUser.role,
            address: newUser.address,
            phone: newUser.phone,
            active: newUser.active,
            coach_id: newUser.coach_id,
            Password: {
                token: uuid()
            }
        }, { include: [ Password ] })
        .then((user) => mailerService.sendRegistration(user, user.Password.token).then(() => user))
        .catch((error) => {
            if (error.name === 'SequelizeUniqueConstraintError') {
                if (error.fields.normalizedNickname) {
                    return Promise.reject(errors.nameAlreadyUsed())
                }

                if (error.fields.email) {
                    return Promise.reject(errors.emailAlreadyUsed())
                }
            }

            return Promise.reject(error)
        })
}

const findMe = (auth) => {
    if (!auth.isAuth) {
        return Promise.reject(errors.unauthorized())
    }

    return User.findById(auth.id, {
        attributes: [
            'id',
            'familyName',
            'givenName',
            'nickname',
            'email',
            'role',
            'address',
            'phone',
            'active',
            'coach_id',
            'created_at'
        ]
    })
}

const resendRegistration = (user, auth) => {
    if (!auth.isAdmin && !auth.isCoach) {
        return Promise.reject(errors.unauthorized())
    }

    return User.findById(user.id, {
        include: [ Password ]
    })
    .then((user) => {
        user.Password.resetPassword()
        return user
    })
    .then((user) => mailerService.sendRegistration(user, user.Password.token))
}

const update = (updatedUser, auth) => {
    if (!auth.isAdmin && !auth.isCoach) {
        return Promise.reject(errors.unauthorized())
    }

    return User.findById(updatedUser.id)
        .then((user) => {
            user.familyName = updatedUser.familyName
            user.givenName = updatedUser.givenName
            user.nickname = updatedUser.nickname
            user.email = updatedUser.email
            user.address = updatedUser.address
            user.phone = updatedUser.phone,
            user.active = updatedUser.active,
            user.coach_id = updatedUser.coach_id
            return user.save()
        })
        .catch((error) => {
            if (error.name === 'SequelizeUniqueConstraintError') {
                if (error.fields.normalizedNickname) {
                    return Promise.reject(errors.nameAlreadyUsed())
                }

                if (error.fields.email) {
                    return Promise.reject(errors.emailAlreadyUsed())
                }
            }

            return Promise.reject(error)
        })
}

module.exports = {
    add: add,
    find: find,
    findMe: findMe,
    resendRegistration: resendRegistration,
    update: update
}