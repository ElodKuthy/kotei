const Sequelize = require('sequelize')
const bcrypt = require('bcrypt')
const uuid = require('node-uuid').v4

module.exports = database =>
database.define('Password', {
    hash: {
        type: Sequelize.STRING
    },
    token: {
        type: Sequelize.UUID
    }
}, {
    validate: {
        hashXorToken: function () {
            if (!!this.hash === !!this.token) {
                throw new Error('Hash or Token should be defined, but not both')
            }
        }
    },
    instanceMethods: {
        setPassword: function (password) {
            if (password) {
                const salt = bcrypt.genSaltSync(10);
                const hash = bcrypt.hashSync(password, salt);
                this.setDataValue('hash', hash)
                this.setDataValue('token', null)
                return this.save()
            }
        },
        resetPassword: function () {
            this.setDataValue('hash', null)
            this.setDataValue('token', uuid())
            return this.save().then(() => this.token)
        },
        checkPassword: function (password) {
            if (!this.hash) {
                return false
            }
            return bcrypt.compareSync(password, this.hash)
        }
    }
})
