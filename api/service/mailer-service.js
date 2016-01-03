const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport()

const from = '360Gym Lomb <no-reply@kotei.hu>'

const sendResetPasswordToken = (user, token) => {

    const mailOptions = {
        from: from,
        to: user.email,
        subject: '360Gym Lomb - Elfelejtett jelszó',
        html:
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
                <a href="https://lomb.kotei.hu/reset-password/${token}">https://lomb.kotei.hu/reset-password/${token}</a><br/>
            </div>

            <div>
                Üdvözlettel,<br/>
                A 360Gym Lomb Csapata
            </div>

            <div>
                P.S.: Ez egy automatikus üzenet, kérjük erre az emailre ne válaszolj.
            </div>
            </body>
            <html>`
        }

    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            return Promise.reject(error);
        } else {
            return Promise.resolve(info);
        };
    });
}

const sendRegistration = (user, token) => {

    const mailOptions = {
        from: from,
        to: user.email,
        subject: '360Gym Lomb - Üdvözlünk',
        html:
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

            <div>Nagyon örülünk, hogy a 360Gym Lomb Terem tagjainak körében üdvözölhetünk!</div>

            <div>
                A 360Gym Lomb Terem Kotei használatához aktiválnod kell a felhasználódat és megadnod egy jelszót, amit a következő linken tudsz megtenni:<br/>
                <a href="https://lomb.kotei.hu/reset-password/${token}">https://lomb.kotei.hu/reset-password/${token}</a><br/>
            </div>

            <div>
                A 360Gym Lomb Terem Koteit az alábbi webcímen tudod elérni:<br/>
                <a href="https://lomb.kotei.hu">https://lomb.kotei.hu</a><br/>
                Itt megnézheted a terem órarendjét, illetve hogy mely órákra jelentkezél, és még sok minden mást is!
            </div>

            <div>
                Üdvözlettel,<br/>
                A 360Gym Lomb Csapata
            </div>

            <div>
                P.S.: Ez egy automatikus üzenet, kérjük erre az emailre ne válaszolj.
            </div>
            </body>
            <html>`
        }

    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            return Promise.reject(error);
        } else {
            return Promise.resolve(info);
        };
    });
}

module.exports = {
    sendResetPasswordToken: sendResetPasswordToken,
    sendRegistration: sendRegistration
}