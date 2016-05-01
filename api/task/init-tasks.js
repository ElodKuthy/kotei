const notifyAlmostDepletedSubscriptionTask = require('./notify-almost-depleted-subscription-task')

const init = () => {
    notifyAlmostDepletedSubscriptionTask.init()
}

module.exports = {
    init: init
}