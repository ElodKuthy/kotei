const database = require('./database')
const Attendee = require('./attendee')
const Credit = require('./credit')
const CreditTemplate = require('./credit-template')
const Location = require('./location')
const Password = require('./password')
const Subscription = require('./subscription')
const SubscriptionType = require('./subscription-type')
const SubscriptionTemplate = require('./subscription-template')
const SubscriptionVariant = require('./subscription-variant')
const Training = require('./training')
const TrainingType = require('./training-type')
const User = require('./user')
const Rule = require('./rule')

Training.belongsTo(Location, {
    foreignKey: {
        allowNull: false
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

CreditTemplate.belongsTo(TrainingType, {
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

module.exports = {
    database: database,
    Attendee: Attendee,
    Credit: Credit,
    CreditTemplate: CreditTemplate,
    Location: Location,
    Password: Password,
    Subscription: Subscription,
    SubscriptionType: SubscriptionType,
    SubscriptionTemplate: SubscriptionTemplate,
    SubscriptionVariant: SubscriptionVariant,
    Training: Training,
    TrainingType: TrainingType,
    User: User,
    Rule: Rule
}
