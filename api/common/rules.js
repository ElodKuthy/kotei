const Rule = require('../model/model')().Rule
const Promise = require('bluebird')

const getRule = args => {
    if (args.validator(args.value)) {
        return args.value
    }
    return Rule.findById(args.name).then((rule) => {
        if (rule && rule.value && args.validator(rule.value)) {
            return args.parser(rule.value)
        } else {
            return args.default
        }
    })    
}

var _allowFreeCreditsOnCreateSubcription
const allowFreeCreditsOnCreateSubcription = () => _allowFreeCreditsOnCreateSubcription = getRule({
    value: _allowFreeCreditsOnCreateSubcription,
    name: 'AllowFreeCreditsOnCreateSubcription',
    default: false,
    validator: value => typeof(value) !== 'undefined',
    parser: value => value === 'true'
})

var _minHoursToLeaveTraining
const minHoursToLeaveTraining = () => _minHoursToLeaveTraining = getRule({
    value: _minHoursToLeaveTraining,
    name: 'MinHoursToLeaveTraining',
    default: 3,
    validator: value => !isNaN(value),
    parser: value => parseInt(value)
})

module.exports = {
    allowFreeCreditsOnCreateSubcription,
    minHoursToLeaveTraining
}