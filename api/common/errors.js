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
    emailAlreadyUsed: envelope(texts.emailAlreadyUsed, 409),
    trainingTimeCollide: envelope(texts.trainingTimeCollide, 409),
    invalidCoach: envelope(texts.invalidCoach, 409),
    trainingTooShort: envelope(texts.trainingTooShort, 409),
    trainingTooLong: envelope(texts.trainingTooLong, 409),
    trainingEnded: envelope(texts.trainingEnded, 409),
    trainingFull: envelope(texts.trainingFull, 409),
    alreadySignedUp: envelope(texts.alreadySignedUp, 409)
}

module.exports = errors