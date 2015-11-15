const Sequelize = require('sequelize')
const database = require('./database')
const Training = require('./training')

const Location = database.define('location', {
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    }
})

Location.hasMany(Training, {
    foreignKey: {
        allowNull: false
    }
})

Training.belongsTo(Location, {
    foreignKey: {
        allowNull: false
    }
})

module.exports = Location