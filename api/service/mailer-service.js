const sendResetPasswordToken = (user, token) => {
    console.log(`to: ${user.email}\nname: ${user.fullName}\ntoken: ${token}`)
}

module.exports = {
    sendResetPasswordToken: sendResetPasswordToken
}