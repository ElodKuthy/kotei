const moment = require('moment')

const errors = require('../common/errors')
const parser = require('../common/parser')

const model = require('../model/model')()
const Training = model.Training
const Subscription = model.Subscription
const User = model.User
const Credit = model.Credit
const TrainingType = model.TrainingType

const Promise = require('bluebird')

const payoffs = (query, auth) => {
    if (!auth.isCoach && !auth.isAdmin) {
        return Promise.reject(errors.unauthorized())        
    }

    const coaches = User.findAll({
        where: {
            role: 'coach'
        }
    }).then(coaches => coaches.sort((a, b) => a.fullName > b.fullName))
    
    const matrix = Training.findAll(parser.parseQuery({
        include: [{
            model: Subscription,
            include: [{
                model: User,
                as: 'Coach'
            }, {
                model: Credit,
                as: 'Credits',
                include: {
                    model: TrainingType
                }
            }]
        }, {
            model: User,
            as: 'Coach'
        }],
        order: [['from', 'ASC']]
    }, query)).then(trainings => 
        trainings.map(training =>
            training.Subscriptions
                .filter(subscription => subscription.Coach.id !== training.Coach.id)
                .map(subscription => ({
                    demand: training.Coach.id, 
                    owe: subscription.Coach.id,
                    amount: subscription.price / subscription.Credits.reduce((acc, credit) => acc + credit.amount, 0)
                }))
        ).reduce((prev, curr) => prev.concat(curr), [])
    )

    return Promise.all([coaches, matrix])
        .spread((coaches, matrix) => {
            return coaches.map(coach => {
                return {
                    coach: { id: coach.id, fullName: coach.fullName },
                    amounts: coaches.map(other => {
                        return {
                            coach: { id: other.id, fullName: other.fullName },
                            amount: coach.id === other.id ? `-` : matrix.reduce((prev, curr) => {
                                if (curr.owe === coach.id && curr.demand === other.id) {
                                    return prev - curr.amount
                                }
                                if (curr.demand === coach.id && curr.owe === other.id) {
                                    return prev + curr.amount
                                }
                                return prev
                            }, 0)
                        }
                    })
                }
            })
        })
        .then(payoffs => {
            if (auth.isCoach) {
                return payoffs.filter(payoff => payoff.coach.id === auth.id).map(payoff => {
                    payoff.amounts = payoff.amounts.filter(amount => amount.coach.id !== auth.id)
                    return payoff
                })
            }
            return payoffs
        }) 
}

module.exports = {
    payoffs: payoffs
}