const from = '360Gym Corvin <no-reply@corvin.kotei.hu>'

const sendResetPasswordToken = {
    subject: '360Gym Corvin - Elfelejtett jelszó',
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
            <a href="https://corvin.kotei.hu/reset-password/${token}">https://corvin.kotei.hu/reset-password/${token}</a><br/>
        </div>
        
        <div>Amennyiben nem te kezdeményezted a jelszó változtatást, kérlek feltétlenül jelezd ezt <a href="mailto:corvin@kotei.hu">corvin@kotei.hu</a> email címen.</div>


        <div>
            Üdvözlettel,<br/>
            A 360Gym Corvin Csapata
        </div>

        <div>
            P.S.: Ez egy automatikus üzenet, kérjük erre az emailre ne válaszolj.
        </div>
        </body>
        <html>`
}

const sendRegistration = {
    subject: '360Gym Corvin - Üdvözlünk',
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

        <div>Nagyon örülünk, hogy a 360Gym Corvin Terem tagjainak körében üdvözölhetünk!</div>

        <div>
            A 360Gym Corvin Terem Kotei használatához aktiválnod kell a felhasználódat és megadnod egy jelszót, amit a következő linken tudsz megtenni:<br/>
            <a href="https://corvin.kotei.hu/reset-password/${token}">https://corvin.kotei.hu/reset-password/${token}</a><br/>
        </div>

        <div>
            A 360Gym Corvin Terem Koteit az alábbi webcímen tudod elérni:<br/>
            <a href="https://corvin.kotei.hu">https://corvin.kotei.hu</a><br/>
            Itt megnézheted a terem órarendjét, illetve hogy mely órákra jelentkezél, és még sok minden mást is!
        </div>
        
        <div>Ha további kérdéseid lennének, fordulj bizalommal edződhöz személyesen, vagy írj nekünk a <a href="mailto:corvin@kotei.hu">corvin@kotei.hu</a> email címre.</div>

        <div>
            Üdvözlettel,<br/>
            A 360Gym Corvin Csapata
        </div>

        <div>
            P.S.: Ez egy automatikus üzenet, kérjük erre az emailre ne válaszolj.
        </div>
        </body>
        <html>`

}

const sendSubscriptionAlmostDepletedNotification = {
    subject: '360Gym Corvin - Emlékeztető bérlet lejáratáról',
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
        
        <div>Ha további kérdéseid lennének, fordulj bizalommal edződhöz személyesen, vagy írj nekünk a <a href="mailto:corvin@kotei.hu">corvin@kotei.hu</a> email címre.</div>

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
    subject: '360Gym Corvin - Emlékeztető bérlet vásárlásról',
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

        <div>Ez csak egy emlékeztető, hogy új bérletet vásároltál. Ezt a bérletedet ${moment(subscription.from).format('YYYY. MM. DD')}-n vásároltad, 
        ${moment(subscription.to).format('YYYY. MM. DD')}-ig érvényes, és összesen ${subscription.all} edzésalkalomra szól.</div>
        
        <div>Új bérletet akkor kell venned, ha az összes alkalmadat lejártad az aktuális bérleteden, vagy annak érvényességi ideje lejárt.</div>
        
        <div>Ha további kérdéseid lennének, fordulj bizalommal edződhöz személyesen, vagy írj nekünk a <a href="mailto:corvin@kotei.hu">corvin@kotei.hu</a> email címre.</div>

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


module.exports = {
    from: from,
    sendResetPasswordToken: sendResetPasswordToken,
    sendRegistration: sendRegistration.html,
    sendSubscriptionAlmostDepletedNotification: sendSubscriptionAlmostDepletedNotification, 
    sendNewSubscriptionNotification: sendNewSubscriptionNotification
}