const Sequelize = require('sequelize')

const database = new Sequelize('kotei', 'root', null, {
    define: {
        paranoid: true,
        underscored: true
    },
    timezone: 'Europe/Budapest'
})

module.exports = database