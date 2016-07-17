const Rule = require('../model/model').Rule
const Promise = require('bluebird')

var _minHoursToLeaveTraining

const minHoursToLeaveTraining = () => {
    if (!isNaN(_minHoursToLeaveTraining)) {
        return Promise.resolve(_minHoursToLeaveTraining)
    }

    return Rule.findById('MinHoursToLeaveTraining').then((rule) => {
        if (rule && rule.value && !isNaN(rule.value)) {
            _minHoursToLeaveTraining = parseInt(rule.value)
        } else {
            _minHoursToLeaveTraining = 3
        }

        return _minHoursToLeaveTraining
    })
}

module.exports = {
    minHoursToLeaveTraining: minHoursToLeaveTraining
}