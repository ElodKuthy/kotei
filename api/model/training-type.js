const Sequelize = require('sequelize')

module.exports = database =>
database.define('TrainingType', {
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    }
})
