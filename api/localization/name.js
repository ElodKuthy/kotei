const removeDiacritics =require('diacritics').remove
const R = require('ramda')

const fullName = (familyName, givenName) => {
    return `${familyName} ${givenName}`
}

const removeSpace = R.replace(' ', '')

const normalizedName = R.compose(R.toLower, removeSpace, removeDiacritics)

const normalizedFullName = R.compose(normalizedName, fullName)


module.exports = {
    fullName: fullName,
    normalizedName: normalizedName,
    normalizedFullName: normalizedFullName
}