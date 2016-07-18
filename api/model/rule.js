const Sequelize = require('sequelize')

module.exports = database =>
database.define('Rule', {
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true
    },
    value: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    }
})
