const express = require('express')
const R = require('ramda')
const fs = require('fs')
const jwt = require('express-jwt')
const morgan = require('morgan')

const version = require('../package.json').version
const logger = require('./common/logger')
const roles = require('./common/roles')
const config = require('./common/config')
const securityService = require('./service/security-service')
const superAdminService = require('./service/superadmin-service')

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

router.get('/stats/coaches', handler(superAdminService.getCoachesStats, {}))
router.get('/stats/trainings', handler(superAdminService.getTrainingsStats, {}))

module.exports = router