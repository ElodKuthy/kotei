const Sequelize = require('sequelize')
const database = require('./database')
const Password = require('./password')
const Trainig = require('./training')
const Subscription = require('./subscription')
const normalizedName = require('../localization/name').normalizedName
const normalizedFullName = require('../localization/name').normalizedFullName

const User = database.define('user', {
    familyName: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        },
        set: function(val) {
            this.setDataValue('familyName', val)
            this.setDataValue('normalizedName', normalizedFullName(this.familyName, this.givenName))
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
            this.setDataValue('normalizedName', normalizedFullName(this.familyName, this.givenName))
        }
    },
    normalizedName: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            isAlphanumeric: true,
            shouldBeConsistentWithFamilyAndGivenNames: function (value) {
                if (normalizedFullName(this.familyName, this.givenName) != value) {
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
            this.setDataValue('normalizedNickname', normalizedName(this.nickname))
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
                if (normalizedName(this.nickname) != value) {
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
    }
})

User.hasOne(Password, {
    foreignKey: {
        allowNull: false
    }
})

Password.belongsTo(User, {
    foreignKey: {
        allowNull: false
    }
})

User.hasMany(Trainig, {
    foreignKey: {
        name: 'coach_id',
        allowNull: false
    },
    as: 'trainings'
})

Trainig.belongsTo(User, {
    foreignKey: {
        allowNull: false
    },
    as: 'coach'
})

User.hasMany(Subscription, {
    foreignKey: {
        name: 'client_id',
        allowNull: false
    },
    as: 'subscriptions'
})

Subscription.belongsTo(User, {
    foreignKey: {
        allowNull: false
    },
    as: 'client'
})

User.hasMany(Subscription, {
    foreignKey: {
        name: 'coach_id',
        allowNull: false
    },
    as: 'soldSubscriptions'
})

Subscription.belongsTo(User, {
    foreignKey: {
        allowNull: false
    },
    as: 'coach'
})

module.exports = User