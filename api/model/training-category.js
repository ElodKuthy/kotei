const Sequelize = require('sequelize')

module.exports = database =>
database.define('TrainingCategory', {
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    }
})
