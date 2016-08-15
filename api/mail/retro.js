const moment = require('moment')

const from = '360Gym Retro <no-reply@kotei.hu>'

const sendResetPasswordToken = {
    subject: '360Gym Retro - Elfelejtett jelszó',
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
            <a href="https://retro.kotei.hu/reset-password/${token}">https://retro.kotei.hu/reset-password/${token}</a><br/>
        </div>
        
        <div>Amennyiben nem te kezdeményezted a jelszó változtatást, kérlek feltétlenül jelezd ezt <a href="mailto:support@kotei.hu">support@kotei.hu</a> email címen.</div>


        <div>
            Üdvözlettel,<br/>
            A 360Gym Retro Csapata
        </div>

        <div>
            P.S.: Ez egy automatikus üzenet, kérjük erre az emailre ne válaszolj.
        </div>
        </body>
        <html>`
}

const sendRegistration = {
    subject: '360Gym Retro - Üdvözlünk',
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

        <div>Nagyon örülünk, hogy a 360Gym Retro Terem tagjainak körében üdvözölhetünk!</div>

        <div>
            A 360Gym Retro Terem Kotei használatához aktiválnod kell a felhasználódat és megadnod egy jelszót, amit a következő linken tudsz megtenni:<br/>
            <a href="https://retro.kotei.hu/reset-password/${token}">https://retro.kotei.hu/reset-password/${token}</a><br/>
        </div>

        <div>
            A 360Gym Retro Terem Koteit az alábbi webcímen tudod elérni:<br/>
            <a href="https://retro.kotei.hu">https://retro.kotei.hu</a><br/>
            Itt megnézheted a terem órarendjét, illetve hogy mely órákra jelentkezél, és még sok minden mást is!
        </div>
        
        <div>Ha további kérdéseid lennének, fordulj bizalommal edződhöz személyesen, vagy írj nekünk a <a href="mailto:support@kotei.hu">support@kotei.hu</a> email címre.</div>

        <div>
            Üdvözlettel,<br/>
            A 360Gym Retro Csapata
        </div>

        <div>
            P.S.: Ez egy automatikus üzenet, kérjük erre az emailre ne válaszolj.
        </div>
        </body>
        <html>`

}

const sendSubscriptionAlmostDepletedNotification = {
    subject: '360Gym Retro - Emlékeztető bérlet lejáratáról',
    html: (subscription) =>
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
        
        <div>Ha további kérdéseid lennének, fordulj bizalommal edződhöz személyesen, vagy írj nekünk a <a href="mailto:support@kotei.hu">support@kotei.hu</a> email címre.</div>

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

const sendNewSubscriptionNotification = {
    subject: '360Gym Retro - Emlékeztető bérlet vásárlásról',
    html: (subscription) =>
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

        <div>Ez csak egy emlékeztető, hogy új bérletet vásároltál. Ezt a bérletedet ${moment(subscription.from).format('YYYY. MM. DD')}-n vásároltad, 
        ${moment(subscription.to).format('YYYY. MM. DD')}-ig érvényes, és összesen ${subscription.all} edzésalkalomra szól.</div>
        
        <div>Új bérletet akkor kell venned, ha az összes alkalmadat lejártad az aktuális bérleteden, vagy annak érvényességi ideje lejárt.</div>
        
        <div>Ha további kérdéseid lennének, fordulj bizalommal edződhöz személyesen, vagy írj nekünk a <a href="mailto:support@kotei.hu">support@kotei.hu</a> email címre.</div>

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

const sendCancelledTrainingNotification = {
    subject: '360Gym Retro - Elmarad egy óra',
    html: (training, subscription) =>
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

        <div>Sajnos az alábbi óra elmarad: ${training.TrainingType.name} / ${moment(training.from).format('YYYY. MM. DD. hh:mm')}</div>

        <div>Természetesen az elmaradó alkalom jóváírásra került a bérleteden, és a bérleted érvényességét is meghosszabítottuk egy héttel.</div>

        <div>
            Üdvözlettel,<br/>
            ${training.Coach.fullName}
        </div>

        <div>
            P.S.: Ez egy automatikus üzenet, kérjük erre az emailre ne válaszolj.
        </div>
        </body>
        <html>`
}

module.exports = {
    from,
    sendResetPasswordToken,
    sendRegistration,
    sendSubscriptionAlmostDepletedNotification, 
    sendNewSubscriptionNotification,
    sendCancelledTrainingNotification
}