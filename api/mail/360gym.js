const moment = require('moment')

const from = '360Gym Superadmin<no-reply@kotei.hu>'

const sendResetPasswordToken = {
    subject: '360Gym Superadmin - Elfelejtett jelszó',
    html: (user, token) =>
        `<html>
        <head>
            <style type="text/css">
                div {
                    margin-bottom: 10px;
                }
            </style>
        </head>
        <body>
        <div>Kedves ${user.fullName}!</div>

        <div>Azt jelezted felénk, hogy elfelejtetted a jelenlegi jelszavadat.</div>

        <div>
            A következő linken tudsz új jelszót megadni:<br/>
            <a href="https://360gym.kotei.hu/reset-password/${token}">https://360gym.kotei.hu/reset-password/${token}</a><br/>
        </div>
        
        <div>Amennyiben nem te kezdeményezted a jelszó változtatást, kérlek feltétlenül jelezd ezt <a href="mailto:support@kotei.hu">support@kotei.hu</a> email címen.</div>


        <div>
            Üdvözlettel,<br/>
            A 360Gym Superadmin Csapata
        </div>

        <div>
            P.S.: Ez egy automatikus üzenet, kérjük erre az emailre ne válaszolj.
        </div>
        </body>
        <html>`
}

const sendRegistration = {
    subject: '360Gym Superadmin - Üdvözlünk',
    html: (user, token) =>
        `<html>
        <head>
            <style type="text/css">
                div {
                    margin-bottom: 10px;
                }
            </style>
        </head>
        <body>
        <div>Kedves ${user.fullName}!</div>

        <div>
            A 360Gym Superadmin használatához aktiválnod kell a felhasználódat és megadnod egy jelszót, amit a következő linken tudsz megtenni:<br/>
            <a href="https://360gym.kotei.hu/reset-password/${token}">https://360gym.kotei.hu/reset-password/${token}</a><br/>
        </div>

        <div>
            A 360Gym Superadmin Koteit az alábbi webcímen tudod elérni:<br/>
            <a href="https://360gym.kotei.hu">https://360gym.kotei.hu</a><br/>
            Itt megnézheted a terem órarendjét, illetve hogy mely órákra jelentkezél, és még sok minden mást is!
        </div>
        
        <div>Ha további kérdéseid lennének, írj nekünk a <a href="mailto:support@kotei.hu">support@kotei.hu</a> email címre.</div>

        <div>
            Üdvözlettel,<br/>
            A 360Gym Superadmin Csapata
        </div>

        <div>
            P.S.: Ez egy automatikus üzenet, kérjük erre az emailre ne válaszolj.
        </div>
        </body>
        <html>`

}
module.exports = {
    from: from,
    sendResetPasswordToken: sendResetPasswordToken,
    sendRegistration: sendRegistration
}