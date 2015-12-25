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

    const args = R.concat(R.concat(R.concat(urlArgs, bodyArgs), queryArgs), roles.decorate(req.user))

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

router.post('/password/forgot', handler(securityService.forgot, { body: ['email']}))

router.post('/password/reset', handler(securityService.reset, { body: ['token', 'password'] }))

router.post('/user', handler(userService.add, { body: 'newUser' }))

router.get('/user', handler(userService.find, { query: 'query'}))

module.exports = router