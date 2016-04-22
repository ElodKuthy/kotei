const winston = require('winston')
const dailyRotate = require('winston-daily-rotate-file')

const logger = new (winston.Logger)({
    transports: [
        new (dailyRotate)({
            name: 'verbose-file',
            filename: './logs/verbose',
            level: 'verbose'
        }),
        new (dailyRotate)({
            name: 'info-file',
            filename: './logs/info',
            level: 'info'
        }),
        new (dailyRotate)({
            name: 'error-file',
            filename: './logs/error',
            level: 'error'
        })
    ],
    exitOnError: false
})

module.exports = logger
module.exports.stream = {
    write: (message, encoding) => {
        logger.info(message)
    }
}