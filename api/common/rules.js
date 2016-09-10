const Rule = require('../model/model')().Rule
const Promise = require('bluebird')

const getRule = args => {
    return Rule.findById(args.name).then((rule) => {
        if (rule && rule.value && args.validator(rule.value)) {
            args.set(args.parser(rule.value))
        }
    })    
}

const boolValidator = value => value && (value.toLowerCase() === 'true' || value.toLowerCase() === 'false')
const boolParser = value => value.toLowerCase() === 'true'

const intValidator = value => !isNaN(value)
const intParser = value => parseInt(value)

var allowFreeCreditsOnCreateSubcription = false
getRule({
    set: value => allowFreeCreditsOnCreateSubcription = value,
    name: 'AllowFreeCreditsOnCreateSubcription',
    validator: boolValidator,
    parser: boolParser
})

var minHoursToLeaveTraining = 3
getRule({
    set: value => minHoursToLeaveTraining = value,
    name: 'MinHoursToLeaveTraining',
    validator: intValidator,
    parser: intParser
})

var coachCanModifyHistory = false
getRule({
    set: value => coachCanModifyHistory = value,
    name: 'CoachCanModifyHistory',
    validator: boolValidator,
    parser: boolParser
}) 

module.exports = {
    allowFreeCreditsOnCreateSubcription: () => allowFreeCreditsOnCreateSubcription,
    minHoursToLeaveTraining: () => minHoursToLeaveTraining,
    coachCanModifyHistory: () => coachCanModifyHistory
}