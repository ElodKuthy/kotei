const R = require('ramda')
const sequelize = require('sequelize')

const parseQuery = (attributes, query) => {
    const result = R.merge(attributes, R.map((value) => { try { return JSON.parse(value) } catch (e) { return value } }, query))

    if (result.dayOfTheWeek) {
        if (!result.where) {
            result.where = {
                $and: []
            }
        }

        if (!result.where.$and || typeof result.where.$and.push !== 'function') {
            result.where.$and = []
        }

        result.where.$and.push(sequelize.where(sequelize.fn('dayofweek', sequelize.col('Training.from')), result.dayOfTheWeek))

        delete result.dayOfTheWeek
    }    
    
    if (result.trainingFromTime) {
        if (!result.where) {
            result.where = {
                $and: []
            }
        }

        if (!result.where.$and || typeof result.where.$and.push !== 'function') {
            result.where.$and = []
        }

        result.where.$and.push(sequelize.where(sequelize.fn('time', sequelize.col('Training.from')), result.trainingFromTime))

        delete result.trainingFromTime
    }

    if (result.trainingToTime) {
        if (!result.where) {
            result.where = {
                $and: []
            }
        }

        if (!result.where.$and || typeof result.where.$and.push !== 'function') {
            result.where.$and = []
        }

        result.where.$and.push(sequelize.where(sequelize.fn('time', sequelize.col('Training.to')), result.trainingToTime))

        delete result.trainingToTime
    }

    return result
}

module.exports = {
    parseQuery: parseQuery
}