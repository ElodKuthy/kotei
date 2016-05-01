const schedule = require('node-schedule')
const moment = require('moment')
const R = require('ramda')
const trainingService = require('../service/training-service')
const subscriptionService = require('../service/subscription-service')
const mailerService = require('../service/mailer-service')
const auth = { isAuth: true, isAdmin: true }
const Promise = require('bluebird')

const findTodaysTrainings = () => {
    return trainingService.find({ 
        where: {
            $and: [{
                from: {
                    $gte: moment().startOf('day')
                }   
            },{
                to: {
                    $lte: moment().endOf('day')
                }
            }]
        }
    }, auth)
}

const findSubscriptions = (trainings) => {
    return subscriptionService.find({
        where: {
            $or: R.flatten(R.map(training => R.map(subscription => {
                return { id: subscription.id }
            }, training.Subscriptions), trainings))
        }
    }, auth)
}

const findAlmostDepletedSubscritions = (subscriptions) => {
    return R.filter(subscription => {
        const notificationLevel = moment.duration(moment(subscription.to).diff(subscription.from)).asWeeks() >= 12 ? 2 : 1 
        const expired = moment().add({ day: 1 }).startOf('day').isAfter(subscription.to)
        return !expired && (subscription.remaining > 0) && (subscription.remaining <= notificationLevel)
    }, R.map(subscription => {
        subscription.all = R.reduce((acc, credit) => acc + credit.amount, 0, subscription.Credits)
        subscription.used = R.reduce((acc, training) => moment().isAfter(training.to) ? acc + 1 : acc, 0, subscription.Trainings)
        subscription.remaining = subscription.all - subscription.used
        return subscription
    }, subscriptions))
}

const sendMail = (subscriptions) => {
    const mailInfo = R.map(subscription => {
        return {
            user: subscription.Client,
            coach: subscription.Coach,
            remaining: subscription.remaining
        }
    }, subscriptions)
    
    return mailInfo
}

const init = () => {
    var rule = new schedule.RecurrenceRule()
    rule.hour = 22
    rule.minute = 0

    return schedule.scheduleJob(rule, () => {        
        return findTodaysTrainings()
            .then(findSubscriptions)
            .then(findAlmostDepletedSubscritions)
            .then(subscriptions => Promise.all(R.map(mailerService.sendSubscriptionAlmostDepletedNotification, subscriptions)))
    })
}

module.exports = {
    init: init
}