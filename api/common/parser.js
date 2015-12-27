const R = require('ramda')

const parseQuery = (attributes, query) => {
    return R.merge(attributes, R.map((value) => { try { return JSON.parse(value) } catch (e) { return value } }, query))
}

module.exports = {
    parseQuery: parseQuery
}