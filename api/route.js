const express = require('express')
const R = require('ramda')
const fs = require('fs')
const jwt = require('express-jwt')

const roles = require('./common/roles.js')
const securityService = require('./service/security-service')
const userService = require('./service/user-service')

const cert = fs.readFileSync('certs/jwt-test-public.pem')

const router = express()

router.get('/', (req, res) => { res.json({ 'Result': 'kotei API' }) })

router.use(jwt({ secret: cert, credentialsRequired: false }))

const handler = R.curry((fn, urlProps, bodyProps, req, res, next) => {

    const urlArgs = urlProps ? R.map((name) => req.params(name), urlProps) : []
    const bodyArgs = bodyProps ? R.map((name) => req.body[name], bodyProps) : []

    const args = R.concat(R.concat(urlArgs, bodyArgs), roles.decorate(req.user))

    const result = R.apply(fn, args)

    result.done((result) => res.json(result), (error) => {
        if (error.isPublic) {
            res.status(error.status).json({ Error: error.message })
        } else {
            res.status(500).json({ Error: error })
        }
    })
})

router.post('/login', handler(securityService.login, null, ['userName', 'password']))

router.post('/password/forgot', handler(securityService.forgot, null, ['email']))

router.post('/password/reset', handler(securityService.reset, null, ['token', 'password']))

router.post('/user', handler(userService.add, null, ['user']))

module.exports = router