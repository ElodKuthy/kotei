const texts = require('../localization/texts')

const envelope = (message, status) => {
    return {
        message: message,
        status: status || 500
    }
}

const errors = {
    invalidUserNameOrPassword: envelope(texts.invalidUserNameOrPassword, 401),
    nonUniqueUserName: envelope(texts.nonUniqueUserName, 401),
    missingOrInvalidParameters: envelope(texts.invalidRequest, 400),
    invalidOrExpiredToken: envelope(texts.invalidOrExpiredToken, 401)
}

module.exports = errors