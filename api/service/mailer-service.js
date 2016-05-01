const nodemailer = require('nodemailer')
const stub = require('nodemailer-stub-transport')
const mailgun = require('nodemailer-mailgun-transport')
const config = require('../common/config')
const moment = require('moment')
const Promise = require('bluebird')

const dummyTransporter = {
    sendMail: (mailOptions, callback) => callback(null, mailOptions)
}

const transporter = (config.mode === 'debug') ? dummyTransporter : nodemailer.createTransport(mailgun(config.mail))

const from = '360Gym Lomb <no-reply@kotei.hu>'

const sendMail = Promise.promisify(transporter.sendMail, { context: transporter })

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
            
            <div>Amennyiben nem te kezdeményezted a jelszó változtatást, kérlek feltétlenül jelezd ezt <a href="mailto:360gymlomb@gmail.com">360gymlomb@gmail.com</a> email címen.</div>


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

    return sendMail(mailOptions)
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
            
            <div>Ha további kérdéseid lennének, szintén fordulj bizalommal edződhöz személyesen, vagy írj nekünk a <a href="mailto:360gymlomb@gmail.com">360gymlomb@gmail.com</a> email címre.</div>

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

    return sendMail(mailOptions)
}

const sendSubscriptionAlmostDepletedNotification = (subscription) => {
    const mailOptions = {
        from: from,
        to: subscription.Client.email,
        subject: '360Gym Lomb - Emlékeztető bérlet lejáratáról',
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
            <div>Kedves ${subscription.Client.fullName}!</div>

            <div>Csak szerettünk volna szólni, hogy a bérleted hamarosan le fog járni. Ezt a bérletedet ${moment(subscription.from).format('YYYY. MM. DD')}-n vásároltad, ${moment(subscription.to).format('YYYY. MM. DD')}-ig érvényes, és összesen ${subscription.all} edzésalkalomra szól. Már csak ${subscription.remaining} alkalmad van hátra.</div>
            
            <div>Új bérletet akkor kell venned, ha az összes alkalmadat lejártad az aktuális bérleteden, vagy annak érvényességi ideje lejárt.</div>
            
            <div>Ha további kérdéseid lennének, szintén fordulj bizalommal edződhöz személyesen, vagy írj nekünk a <a href="mailto:360gymlomb@gmail.com">360gymlomb@gmail.com</a> email címre.</div>

            <div>
                Üdvözlettel,<br/>
                ${subscription.Coach.fullName}
            </div>

            <div>
                P.S.: Ez egy automatikus üzenet, kérjük erre az emailre ne válaszolj.
            </div>
            </body>
            <html>`
        }

    return sendMail(mailOptions)
}

module.exports = {
    sendResetPasswordToken: sendResetPasswordToken,
    sendRegistration: sendRegistration,
    sendSubscriptionAlmostDepletedNotification: sendSubscriptionAlmostDepletedNotification 
}