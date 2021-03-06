const uuid = require('node-uuid').v4
const all = require('bluebird').all
const model = require('./model/model')()
const database = model.database
const User = model.User
const Password = model.Password
const Location = model.Location
const Training = model.Training
const Subscription = model.Subscription
const Attendee = model.Attendee
const SubscriptionType = model.SubscriptionType
const SubscriptionVariant = model.SubscriptionVariant

database.sync({ force: true })
    .then(() => {
        const admin = User.create({
            familyName: 'Kúthy',
            givenName: 'Előd',
            nickname: 'Admin',
            email: 'admin@kotei.hu',
            role: 'admin',
            Password: {
                token: uuid()
            }
        }, { include: [ Password ] })

        const coach = User.create({
            familyName: 'Adolf',
            givenName: 'Albert',
            nickname: 'Albert',
            email: 'albert@tkmuhely.hu',
            role: 'coach',
            Password: {
                token: uuid()
            }
        }, { include: [ Password ] })

        const client = User.create({
            familyName: 'Kúthy',
            givenName: 'Előd',
            email: 'kuthy.elod@gmail.com',
            nickname: 'Előd',
            role: 'client',
            Password: {
                token: uuid()
            }
        }, { include: [ Password ] })

        // const location = Location.create({
        //     name: 'Nagyterem'
        // })

        // return all([admin, coach, client, location])
        //     .then(() => {
        //         return all([
        //             admin.value().getPassword().then((password) => password.setPassword('secret123')),
        //             coach.value().getPassword().then((password) => password.setPassword('secret123')),
        //             client.value().getPassword().then((password) => password.setPassword('secret123'))
        //         ])
        //     })
        //     .then(() => {
        //         const training = Training.create({
        //             name: 'Kettlebell',
        //             from: '2015-12-01 17:00:00',
        //             to: '2015-12-01 17:59:59',
        //             max: 14,
        //             location_id: location.value().id,
        //             coach_id: coach.value().id
        //         })
        //     })
        //     .then(() => {
        //         return SubscriptionType.create({
        //             name: 'Kettlebell'
        //         })
        //     })
        //     .then((subscriptionType) => {
        //         return Subscription.create({
        //             from: '2015-12-01 00:00:00',
        //             to: '2015-12-28 23:59:59',
        //             amount: 8,
        //             price: 12000,
        //             client_id: client.value().id,
        //             coach_id: coach.value().id,
        //             subscription_type_id: subscriptionType.id
        //         })
        //     })
    })
