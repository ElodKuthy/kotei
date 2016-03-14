const Sequelize = require('sequelize')
const database = require('./database')
const localization = require('../localization/name')

const User = database.define('User', {
    familyName: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        },
        set: function(val) {
            this.setDataValue('familyName', val)
            this.setDataValue('normalizedName', localization.normalizedFullName(this.familyName, this.givenName))
        }
    },
    givenName: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        },
        set: function(val) {
            this.setDataValue('givenName', val)
            this.setDataValue('normalizedName', localization.normalizedFullName(this.familyName, this.givenName))
        }
    },
    fullName: {
        type: Sequelize.VIRTUAL,
        get: function () {
            return localization.fullName(this.familyName, this.givenName)
        }
    },
    normalizedName: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            isAlphanumeric: true,
            shouldBeConsistentWithFamilyAndGivenNames: function (value) {
                if (localization.normalizedFullName(this.familyName, this.givenName) != value) {
                    throw Error('Normalized name should be consistent with family and given names')
                }
            }
        }
    },
    nickname: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
        validate: {
            notEmpty: true
        },
        set: function(val) {
            this.setDataValue('nickname', val)
            this.setDataValue('normalizedNickname', localization.normalizedName(this.nickname))
        }
    },
    normalizedNickname: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true,
            isAlphanumeric: true,
            shouldBeConsistentWithNickname: function (value) {
                if (localization.normalizedName(this.nickname) != value) {
                    throw Error('Normalized nickname should be consistent with nickname')
                }
            }
        }
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        },
    },
    role: {
        type: Sequelize.ENUM('client', 'coach', 'admin'),
        allowNull: false
    },
    qr: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        defaultValue: Sequelize.UUIDV4
    },
    address: {
        type: Sequelize.STRING,
        allowNull: true
    },
    phone: {
        type: Sequelize.STRING,
        allowNull: true
    }
})

module.exports = User