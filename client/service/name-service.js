angular.module('kotei')
    .service('nameService', (R) => {

        const displayName = (user) => {
            return user.fullName == user.nickname
                ? user.fullName
                : `${user.fullName} "${user.nickname}"`
        }

        const addDisplayName = (users) => R.map((user) => {
            user.displayName = displayName(user)
            return user
        }, users)

        return {
            addDisplayName: addDisplayName
        }
    })