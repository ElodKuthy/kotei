const texts = require('../localization/texts')

const envelope = (message, status) => {
    return {
        message: message,
        status: status || 500,
        isPublic: true
    }
}

const errors = {
    invalidUserNameOrPassword: envelope(texts.invalidUserNameOrPassword, 401),
    nonUniqueUserName: envelope(texts.nonUniqueUserName, 401),
    missingOrInvalidParameters: envelope(texts.invalidRequest, 400),
    invalidOrExpiredToken: envelope(texts.invalidOrExpiredToken, 401),
    unauthorized: envelope(texts.unauthorized, 401),
    nameAlreadyUsed: envelope(texts.nameAlreadyUsed, 409),
    emailAlreadyUsed: envelope(texts.emailAlreadyUsed, 409)
}

module.exports = errors