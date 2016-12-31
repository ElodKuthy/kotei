const nodemailer = require('nodemailer')
const stub = require('nodemailer-stub-transport')
const mailgun = require('nodemailer-mailgun-transport')
const config = require('../common/config')
const moment = require('moment')
const Promise = require('bluebird')
const mails = require('../mail/' + config.theme)

const dummyTransporter = {
    sendMail: (mailOptions, callback) => {
        console.log(mailOptions)
        callback(null, mailOptions)
    }
}

const transporter = (config.mode === 'debug') ? dummyTransporter : nodemailer.createTransport(mailgun(config.mail))

const from = mails.from

const sendMail = Promise.promisify(transporter.sendMail, { context: transporter })

const sendResetPasswordToken = (user, token) => {

    return sendMail({
        from: from,
        to: user.email,
        subject: mails.sendResetPasswordToken.subject,
        html: mails.sendResetPasswordToken.html(user, token)
    })
}

const sendRegistration = (user, token) => {

    return sendMail({
        from: from,
        to: user.email,
        subject: mails.sendRegistration.subject,
        html: mails.sendRegistration.html(user, token)
    })
}

const sendSubscriptionAlmostDepletedNotification = (subscription) => {

    return sendMail({
        from: from,
        to: subscription.Client.email,
        bcc: subscription.Coach.email,
        subject: mails.sendSubscriptionAlmostDepletedNotification.subject,
        html: mails.sendSubscriptionAlmostDepletedNotification.html(subscription)
    })
}

const sendNewSubscriptionNotification = (subscription) => {

    return sendMail({
        from: from,
        to: subscription.Client.email,
        subject: mails.sendNewSubscriptionNotification.subject,
        html: mails.sendNewSubscriptionNotification.html(subscription)
    })
}

const sendCancelledTrainingNotification = (training, subscription, extend) => {

    return sendMail({
        from: from,
        to: subscription.Client.email,
        subject: mails.sendCancelledTrainingNotification.subject,
        html: mails.sendCancelledTrainingNotification.html(training, subscription, extend)
    })
}

module.exports = {
    sendResetPasswordToken,
    sendRegistration,
    sendSubscriptionAlmostDepletedNotification,
    sendNewSubscriptionNotification,
    sendCancelledTrainingNotification
}