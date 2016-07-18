const Sequelize = require('sequelize')

module.exports = database =>
database.define('Location', {
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    }
})
