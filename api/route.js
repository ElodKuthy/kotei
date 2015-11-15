const express = require('express')
const R = require('ramda')
const securityService = require('./service/security-service')
const jwt = require('express-jwt')
const fs = require('fs')

const router = express.Router()

router.get('/', (req, res) => { res.json({ 'Result': 'kotei API' }) })

const handler = R.curry((fn, urlProps, bodyProps, req, res, next) => {

    const urlArgs = urlProps ? R.map((name) => req.params(name), urlProps) : []
    const bodyArgs = bodyProps ? R.map((name) => req.body[name], bodyProps) : []

    const args = R.concat(urlArgs, bodyArgs)

    const result = R.apply(fn, args)

    result.done((result) => res.json(result), (error) => {
        console.log(error)
        res.status(error.status).json({ Error: error.message })
    })
})

router.post('/login', handler(securityService.login, null, ['userName', 'password']))

router.post('/password/forgot', handler(securityService.forgot, null, ['email']))

router.post('/password/reset', handler(securityService.reset, null, ['token', 'password']))

module.exports = router