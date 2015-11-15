const removeDiacritics =require('diacritics').remove
const compose = require('ramda').compose
const toLower = require('ramda').toLower
const replace = require('ramda').replace

const fullName = (familyName, givenName) => {
    return `${familyName} ${givenName}`
}

const removeSpace = replace(' ', '')

const normalizedName = compose(toLower, removeSpace, removeDiacritics)

const normalizedFullName = compose(normalizedName, fullName)


module.exports = {
    fullName: fullName,
    normalizedName: normalizedName,
    normalizedFullName: normalizedFullName
}