const express = require('express')
const R = require('ramda')
const fs = require('fs')
const jwt = require('express-jwt')
const morgan = require('morgan')
const Promise = require('bluebird')

const version = require('../package.json').version
const logger = require('./common/logger')
const roles = require('./common/roles')
const config = require('./common/config')
const rules = require('./common/rules')
const securityService = require('./service/security-service')
const userService = require('./service/user-service')
const subscriptionService = require('./service/subscription-service')
const locationService = require('./service/location-service')
const trainingService = require('./service/training-service')
const attendeeService = require('./service/attendee-service')
const statsService = require('./service/stats-service')

const cert = fs.readFileSync(config.certs.public)

const router = express()

router.get('/', (req, res) => { res.json({ Result: 'kotei API', Version: version }) })

router.use(jwt({ secret: cert, credentialsRequired: false }))

morgan.token('userId', (req) => req.user ? req.user.id : '')
morgan.token('userName', (req) => req.user ? req.user.name : '')
morgan.token('urlDecoded', (req) => req.url ? decodeURI(req.url) : '')

router.use(morgan(':userName (:userId) :remote-addr :method :urlDecoded HTTP/:http-version :status :res[content-length] - :response-time ms ":user-agent"', { 'stream': logger.stream }))

const parseProps = (props, values) => {

    if (!props) {
        return []
    }

    if (R.isArrayLike(props)) {
        return R.map((name) => values[name], props)
    }

    return [values]
}


const handler = R.curry((fn, props, req, res, next) => {

    const urlArgs = parseProps(props.url, req.params)
    const bodyArgs = parseProps(props.body, req.body)
    const queryArgs = parseProps(props.query, req.query)

    userService.findMe({ id: req.user && req.user.id, isAuth: true}).then(user => {

        const args = R.concat(R.concat(R.concat(urlArgs, queryArgs), bodyArgs), roles.decorate(user))

        const result = R.apply(fn, args)

        result.done((result) => res.json(result), (error) => {
            if (error.isPublic) {
                res.status(error.status).json({ Error: error.message })
            } else {
                res.status(500).json({ Error: error })
            }
        })
    })
})

router.post('/login', handler(securityService.login, { body: ['userName', 'password'] }))

router.post('/password/forgot', handler(securityService.forgot, { body: ['email'] }))
router.post('/password/reset', handler(securityService.reset, { body: ['token', 'password'] }))

router.get('/user', handler(userService.find, { query: 'query' }))
router.get('/user/me', handler(userService.findMe, {}))
router.post('/user', handler(userService.add, { body: 'newUser' }))
router.put('/user', handler(userService.update, { body: 'user' }))
router.post('/user/resend', handler(userService.resendRegistration, { body: 'user' }))


router.get('/subscription/type', handler(subscriptionService.findSubscriptionType, { query: 'query' }))
router.get('/subscription/template', handler(subscriptionService.findSubscriptionTemplate, { query: 'query' }))
router.get('/subscription', handler(subscriptionService.find, { query: 'query' }))
router.post('/subscription', handler(subscriptionService.add, { body: 'newSubscription' }))
router.put('/subscription', handler(subscriptionService.update, { body: 'subscription' }))
router.delete('/subscription/:subscriptionId', handler(subscriptionService.remove, { url: 'subscriptionId' }))

router.get('/training', handler(trainingService.find, { query: 'query' }))
router.get('/training/type', handler(trainingService.findTrainingType, { query: 'query' }))
router.get('/training/category', handler(trainingService.findTrainingCategory, { query: 'query' }))
router.post('/training', handler(trainingService.add, { body: 'newTraining' }))
router.post('/training/bulk', handler(trainingService.bulkEdit, { query: 'query', body: 'newValues' }))
router.delete('/training/:trainingId', handler(trainingService.remove, { url: 'trainingId' }))
router.delete('/training', handler(trainingService.removeAll, { query: 'query' }))

router.post('/attendee', handler(attendeeService.add, { query: ['training_id', 'client_id'] }))
router.delete('/attendee', handler(attendeeService.remove, { query: ['training_id', 'client_id'] }))
router.put('/attendee', handler(attendeeService.update, { query: ['training_id', 'client_id'], body: ['checkIn'] }))

router.get('/location', handler(locationService.find, { query: 'query' }))

router.get('/stats/overview', handler(statsService.overview, { query: 'query' }))
router.get('/stats/payoffs', handler(statsService.payoffs, { query: 'query' }))
router.get('/stats/subscriptions/active', handler(statsService.activeSubscriptions, {}))
router.get('/stats/subscriptions/sold', handler(statsService.soldSubscriptions, { query: 'query' }))
router.get('/stats/clients', handler(statsService.clients, { query: 'query' }))
router.get('/stats/trainings', handler(statsService.trainings, { query: 'query' }))

router.get('/rule/allow/free/credit', handler(() => Promise.resolve(rules.allowFreeCreditsOnCreateSubcription()), {}))

module.exports = router