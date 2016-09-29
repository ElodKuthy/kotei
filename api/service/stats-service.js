const moment = require('moment')

const errors = require('../common/errors')
const parser = require('../common/parser')
const roles = require('../common/roles')

const model = require('../model/model')()
const Training = model.Training
const Subscription = model.Subscription
const User = model.User
const Credit = model.Credit
const TrainingType = model.TrainingType
const SubscriptionType = model.SubscriptionType
const Location = model.Location

const Promise = require('bluebird')

const subscriptionOverview = (from, to, coach) => {
    return Subscription.findAll({
        where: {
            $and: [{ 
                coach_id: coach.id 
            }, { 
                from: { $gte: from }
            }, {
                from: { $lte: to }
            }]
        }
    })
    .then(subscriptions => subscriptions.reduce((acc, subscription) => acc + subscription.price, 0))
    .then(sold => ({ sold }))
}

const trainingOverview = (from, to, coach) => {
    return Training.findAll({
        include: [{
            as: 'Subscriptions',
            model: Subscription,
            include: [{
                as: 'Client',
                model: User
            }, {
                as: 'Credits',
                model: Credit
            }]
        }],
        where: {
            $and: [{ 
                coach_id: coach.id 
            }, { 
                from: { $gte: from }
            }, {
                to: { $lte: to }
            }]
        }
    }).then(trainings => {
        const trainingSubscriptionsReducer = (acc, subscription) => {
            acc.attendees += subscription.Attendee.checkIn ? 1 : 0
            acc.spent += subscription.price / subscription.Credits.reduce((acc, credit) => acc + credit.amount, 0)
            return acc
        }

        const trainingReducer = (acc, training) => {
            const { attendees, spent } = training.Subscriptions.reduce(trainingSubscriptionsReducer, { attendees: 0, spent: 0 })
            acc.max += training.max
            acc.subscriptions += training.Subscriptions.length
            acc.attendees += attendees
            acc.spent += spent
            return acc
        }

        const initData = { 
            max: 0,
            subscriptions: 0, 
            attendees: 0,
            spent: 0,
            trainingsCount: trainings.length 
        }

        return trainings.reduce(trainingReducer, initData)
    })
}

const coachOverview = (from, to) => coach => {
    return Promise.all([trainingOverview(from, to, coach), subscriptionOverview(from, to, coach)])
        .spread((training, subscription) => Object.assign(training, subscription, { Coach: coach }))
}

const overview = ({ month }, auth) => {
    if (!auth.isCoach && !auth.isAdmin) {
        return Promise.reject(errors.unauthorized())        
    }

    if (!moment(month, 'YYYY-MM-DD').isValid()) {
        return Promise.reject(errors.missingOrInvalidParameters())
    }

    const from = moment(month).startOf('month').format('YYYY-MM-DD')
    const to = moment(month).endOf('month').format('YYYY-MM-DD')

    return auth.isCoach
        ? (User.findById(auth.id).then(coachOverview(from, to)).then(overview => [overview]))
        : (User.findAll({
            where: {
                role: roles.coach
            }
        })
        .then(coaches => Promise.all(coaches.map(coachOverview(from, to))))
        .then(overviews => overviews.sort((a, b) => a.Coach.fullName > b.Coach.fullName ? 1 : -1)))
}

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

const filterByAuth = auth => entities => 
    auth.isAdmin ? entities : entities.filter(entity => entity.Coach && entity.Coach.id === auth.id)

const convert = subscriptions => subscriptions.map(subscription => {
        const amount = subscription.Credits.reduce((acc, credit) => acc + credit.amount, 0)
        const remaining = amount - subscription.Trainings.reduce((acc,training) => acc + !!moment().isAfter(training.to), 0)

        return {
            id: subscription.id,
            name: subscription.SubscriptionType.name,
            from: subscription.from,
            to: subscription.to,
            Client: subscription.Client,
            Coach: subscription.Coach,
            amount,
            remaining,
            price: subscription.price
        }
    })

const sortByRemaingThenDate = subscriptions => subscriptions.sort((a, b) => {
        const diff = a.remaining - b.remaining
        if (diff) {
            return diff
        }
        return moment(a.to).diff(b.to)
    })

const sortByDate = subscriptions => subscriptions.sort((a, b) => moment(a.to).diff(b.to))

const include = [{
    as: 'SubscriptionType',
    model: SubscriptionType
}, {
    as: 'Client',
    model: User
}, {
    as: 'Coach',
    model: User
}, {
    as: 'Credits',
    model: Credit,
}, {
    as: 'Trainings',
    model: Training
}]

const activeSubscriptions = auth => {
    if (!auth.isCoach && !auth.isAdmin) {
        return Promise.reject(errors.unauthorized())
    }

    return Subscription.findAll({
        include,
        where: {
            to: {
                $gte: moment().startOf('day').format('YYYY-MM-DD')
            }
        }
    })
    .then(filterByAuth(auth))
    .then(convert)
    .then(sortByRemaingThenDate) 
}

const soldSubscriptions = ({ month }, auth) => {
    if (!auth.isCoach && !auth.isAdmin) {
        return Promise.reject(errors.unauthorized())
    }

    return Subscription.findAll({
        include,
        where: {
            $and: [{
                from: {
                    $lte: moment(month).endOf('month').format('YYYY-MM-DD')
                }
            }, {
                from: {
                    $gte: moment(month).startOf('month').format('YYYY-MM-DD')
                }
            }]
        }
    })
    .then(filterByAuth(auth))
    .then(convert)
    .then(sortByDate)
}

const newClients = (month, auth) => 
    User.findAll({
        where: {
            $and: [{
                created_at: {
                    $and: [{
                        $gte: moment(month).startOf('month').format('YYYY-MM-DD')
                    }, {
                        $lte: moment(month).endOf('month').format('YYYY-MM-DD')
                    }]
                }
            }, {
                role: roles.client
            }]
        },
        include: [{
            model: User,
            as: 'Coach'
        }]
    })
    .then(filterByAuth(auth))
    
const passiveClients = (month, auth) => 
    Subscription.findAll({
        where: {
            to: {
                $and: [{
                    $gte: moment(month).startOf('month').format('YYYY-MM-DD')
                }, {
                    $lte: moment(month).endOf('month').format('YYYY-MM-DD')
                }]
            }
        },
        include: [{
            model: User,
            as: 'Client',
            include: [{
                model: Subscription,
                as: 'Subscriptions'
            }, {
                model: User,
                as: 'Coach'
            }]
        }]
    })
    .then(subscriptions => subscriptions.filter(subscription =>
        !subscription.Client.Subscriptions.some(subscription => moment(month).endOf('month').isBefore(subscription.to))
    ))
    .then(subscriptions => subscriptions.map(subscription => ({ 
        id: subscription.Client.id,
        fullName: subscription.Client.fullName,
        nickname: subscription.Client.nickname,
        created_at: subscription.Client.created_at,
        from: subscription.from,
        to: subscription.to,
        Coach: subscription.Client.Coach && {
            id: subscription.Client.Coach.id,
            fullName: subscription.Client.Coach.fullName,
            nickname: subscription.Client.Coach.nickname,
        } 
    })))
    .then(filterByAuth(auth))
    .then(clients => clients.reduce((acc, client) => {
        if (!acc.find(added => added.id === client.id)) {
            acc.push(client)
        }
        return acc
    }, []))
    .then(clients => clients.sort((a, b) => a.fullName > b.fullName))

const clients = ({ month }, auth) => {
    if (!auth.isCoach && !auth.isAdmin) {
        return Promise.reject(errors.unauthorized())
    }

    return Promise.all([newClients(month, auth), passiveClients(month, auth)])
        .spread((news, passives) => ({ news, passives })) 
}

const trainings = ({ month }, auth) => {
    if (!auth.isCoach && !auth.isAdmin) {
        return Promise.reject(errors.unauthorized())
    }

    return Training.findAll({
        where: {
            $and: [{
                from: {
                    $gte: moment(month).startOf('month').format('YYYY-MM-DD')
                }
            }, {
                to: {
                    $lte: moment(month).endOf('month').format('YYYY-MM-DD')
                }
            }]
        },
        include: [{
            as: 'TrainingType',
            model: TrainingType
        }, {
            as: 'Coach',
            model: User
        }, {
            as: 'Subscriptions',
            model: Subscription
        }, {
            as: 'Location',
            model: Location
        }]
    })
    .then(trainings => trainings.reduce((acc, training) => {
        const key = `${training.Location.id}-${moment(training.from).format('E-HH-mm')}`
        const subscibers = training.Subscriptions.length
        const attenders = training.Subscriptions.filter(subscription => subscription.Attendee.checkIn).length
        const current = acc.get(key)
        if (current) {
            const { typeName, locationName, date, count, subscriptions, attendees, Coach } = current
            const d = moment(date)
            acc.set(key, {
                typeName,
                locationName,
                date,
                dayOfWeek: d.isoWeekday(),
                hour: d.hour(),
                minute: d.minute(),
                count: count + 1,
                subscriptions: {
                    sum: subscriptions.sum + subscibers,
                    min: Math.min(subscriptions.min, subscibers),
                    max: Math.max(subscriptions.max, subscibers)
                },
                attendees: {
                    sum: attendees.sum + attenders,
                    min: Math.min(attendees.min, attenders),
                    max: Math.max(attendees.max, attenders)
                },
                Coach
            })
        } else {
            acc.set(key, {
                typeName: training.TrainingType.name,
                locationName: training.Location.name,
                date: training.from,
                count: 1,
                subscriptions: {
                    sum: subscibers,
                    min: subscibers,
                    max: subscibers
                },
                attendees: {
                    sum: attenders,
                    min: attenders,
                    max: attenders
                },
                Coach: training.Coach
            })
        }
        return acc
    }, new Map()))
    .then(trainings => Array.from(trainings, (value, key) => value[1]))
    .then(filterByAuth(auth))
    .then(trainings => trainings.sort((a, b) => {
        if (a.Coach.fullName === b.Coach.fullName) {
            if (a.locationName === b.locationName) {
                return (a.dayOfWeek - b.dayOfWeek) || (a.hour - b.hour) || (a.minute - b.minute) 
            }
            return a.locationName > b.locationName ? 1 : -1
        }
        return a.Coach.fullName > b.Coach.fullName ? 1 : -1 
    }))
}

module.exports = {
    overview,
    payoffs,
    activeSubscriptions,
    soldSubscriptions,
    clients,
    trainings
}