const sendResetPasswordToken = (user, token) => {
    console.log(`to: ${user.email}\nname: ${user.fullName}\ntoken: ${token}`)
}
const sendRegistration = (user) => {
    console.log(`to: ${user.email}\nname: ${user.fullName}\ntoken: ${user.Password.token}`)
}

module.exports = {
    sendResetPasswordToken: sendResetPasswordToken,
    sendRegistration: sendRegistration
}