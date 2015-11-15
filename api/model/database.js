const Sequelize = require('sequelize')

const database = new Sequelize('kotei', 'root', null, {
    define: {
        paranoid: true,
        underscored: true
    }
})

module.exports = database