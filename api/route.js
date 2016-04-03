const express = require('express')
const R = require('ramda')
const fs = require('fs')
const jwt = require('express-jwt')

const roles = require('./common/roles.js')
const securityService = require('./service/security-service')
const userService = require('./service/user-service')
const subscriptionService = require('./service/subscription-service')
const locationService = require('./service/location-service')
const trainingService = require('./service/training-service')
const attendeeService = require('./service/attendee-service')

const cert = fs.readFileSync('certs/jwt-test-public.pem')

const router = express()

router.get('/', (req, res) => { res.json({ 'Result': 'kotei API' }) })

router.use(jwt({ secret: cert, credentialsRequired: false }))

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

    const args = R.concat(R.concat(R.concat(urlArgs, queryArgs), bodyArgs), roles.decorate(req.user))

    const result = R.apply(fn, args)

    result.done((result) => res.json(result), (error) => {
        if (error.isPublic) {
            res.status(error.status).json({ Error: error.message })
        } else {
            res.status(500).json({ Error: error })
        }
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
router.post('/training', handler(trainingService.add, { body: 'newTraining' }))

router.post('/attendee', handler(attendeeService.add, { query: ['training_id', 'client_id'] }))
router.delete('/attendee', handler(attendeeService.remove, { query: ['training_id', 'client_id'] }))
router.put('/attendee', handler(attendeeService.update, { query: ['training_id', 'client_id'], body: ['checkIn'] }))

router.get('/location', handler(locationService.find, { query: 'query' }))

module.exports = router