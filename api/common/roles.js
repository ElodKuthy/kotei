const client = 'client'
const coach  = 'coach'
const admin  = 'admin'

const decorate = (auth) => {
    if (!auth) {
        auth = {}
    }

    auth.isAuth   = false
    auth.isClient = false
    auth.isCoach  = false
    auth.isAdmin  = false

    if (auth.role) {
        auth.isAuth   = true
        auth.isClient = auth.role === client
        auth.isCoach  = auth.role === coach
        auth.isAdmin  = auth.role === admin
    }

    return auth
}

module.exports = {
    decorate: decorate,
    client:   client,
    coach:    coach,
    admin:    admin
}