const config = {
    database: {
        host: process.env.KOTEI_DB_HOST || 'localhost',
        name: process.env.KOTEI_DB_NAME || 'kotei',
        user: process.env.KOTEI_DB_USER || 'root',
        password: process.env.KOTEI_DB_PASSWORD
    },
    
    certs: {
        public: process.env.KOTEI_CERT_PUBLIC || 'certs/jwt-test-public.pem',
        private: process.env.KOTEI_CERT_PRIVATE || 'certs/jwt-test-private.pem'
    },
    
    mail: {
        auth: {
            api_key: process.env.KOTEI_MAIL_API_KEY,
            domain: process.env.KOTEI_MAIL_DOMAIN,
        }
    },
    
    theme: process.env.KOTEI_THEME || 'lomb',
    
    mode: process.env.KOTEI_MODE || 'debug'
}

module.exports = config