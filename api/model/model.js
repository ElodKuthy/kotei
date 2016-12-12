module.exports = db => {

    const database = db || require('./database')
    const Attendee = require('./attendee')(database)
    const Credit = require('./credit')(database)
    const CreditTemplate = require('./credit-template')(database)
    const Location = require('./location')(database)
    const Password = require('./password')(database)
    const Subscription = require('./subscription')(database)
    const SubscriptionType = require('./subscription-type')(database)
    const SubscriptionTemplate = require('./subscription-template')(database)
    const SubscriptionVariant = require('./subscription-variant')(database)
    const Training = require('./training')(database)
    const TrainingType = require('./training-type')(database)
    const User = require('./user')(database)
    const Rule = require('./rule')(database)
    const TrainingCategory = require('./training-category')(database)

    Training.belongsTo(Location, {
        foreignKey: {
            allowNull: false
        }
    })

    Training.belongsTo(TrainingCategory, {
        foreignKey: {
            allowNull: true
        }
    })

    Subscription.belongsToMany(Training, {
        through: Attendee
    })

    Subscription.hasMany(Credit, {
        foreignKey: {
            allowNull: false
        }
    })

    Subscription.belongsTo(User, {
        foreignKey: {
            allowNull: false
        },
        as: 'Client'
    })

    Subscription.belongsTo(User, {
        foreignKey: {
            allowNull: false
        },
        as: 'Coach'
    })

    SubscriptionTemplate.hasMany(CreditTemplate, {
        foreignKey: {
            allowNull: false
        }
    })

    Subscription.belongsTo(SubscriptionType, {
        foreignKey: {
            allowNull: true
        }
    })

    SubscriptionType.hasMany(Subscription, {
        foreignKey: {
            allowNull: true
        }
    })

    SubscriptionTemplate.belongsTo(SubscriptionType, {
        foreignKey: {
            allowNull: true
        }
    })
    SubscriptionType.hasMany(SubscriptionTemplate, {
        foreignKey: {
            allowNull: false
        }
    })

    SubscriptionTemplate.belongsTo(SubscriptionVariant, {
        foreignKey: {
            allowNull: false
        }
    })

    Training.belongsToMany(Subscription, {
        through: Attendee
    })

    Training.belongsTo(User, {
        foreignKey: {
            allowNull: false
        },
        as: 'Coach'
    })

    TrainingType.hasMany(Credit, {
        foreignKey: {
            allowNull: true
        }
    })

    Credit.belongsTo(TrainingType, {
        foreignKey: {
            allowNull: true
        }
    })

    Credit.belongsTo(TrainingCategory, {
        foreignKey: {
            allowNull: true
        }
    })

    CreditTemplate.belongsTo(TrainingType, {
        foreignKey: {
            allowNull: true
        }
    })

    CreditTemplate.belongsTo(TrainingCategory, {
        foreignKey: {
            allowNull: true
        }
    })

    CreditTemplate.belongsTo(User, {
        foreignKey: {
            name: 'coach_id',
            allowNull: true
        },
        as: 'Coach'
    })

    Training.belongsTo(TrainingType, {
        foreignKey: {
            allowNull: false
        }})

    User.hasMany(Credit, {
        foreignKey: {
            name: 'coach_id',
            allowNull: true
        }
    })

    User.hasMany(CreditTemplate, {
        foreignKey: {
            name: 'coach_id',
            allowNull: true
        }
    })

    User.hasOne(Password, {
        foreignKey: {
            allowNull: false
        }
    })

    User.hasMany(Training, {
        foreignKey: {
            name: 'coach_id',
            allowNull: false
        }
    })

    User.hasMany(Subscription, {
        foreignKey: {
            name: 'client_id',
            allowNull: false
        }
    })

    User.hasMany(Subscription, {
        foreignKey: {
            name: 'coach_id',
            allowNull: false
        },
        as: 'SoldSubscriptions'
    })

    User.belongsTo(User, {
        foreignKey: {
            name: 'coach_id',
            allowNull: true
        },
        as: 'Coach'
    })

    User.hasMany(User, {
        foreignKey: {
            name: 'coach_id',
            allowNull: true
        },
        as: 'Clients'
    })

    return {
        database,
        Attendee,
        Credit,
        CreditTemplate,
        Location,
        Password,
        Subscription,
        SubscriptionType,
        SubscriptionTemplate,
        SubscriptionVariant,
        Training,
        TrainingCategory,
        TrainingType,
        User,
        Rule
    }
}
