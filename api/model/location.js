const Sequelize = require('sequelize')
const database = require('./database')
const Training = require('./training')

const Location = database.define('Location', {
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
    },
    as: 'Trainings'
})

Training.belongsTo(Location, {
    foreignKey: {
        allowNull: false
    },
    as: 'Location'
})

module.exports = Location