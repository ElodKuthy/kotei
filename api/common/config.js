const config = {
    database: {
        name: process.env.KOTEI_DB_NAME || 'kotei',
        user: process.env.KOTEI_DB_USER || 'root',
        password: process.env.KOTEI_DB_PASSWORD
    },
    
    certs: {
        public: process.env.KOTEI_CERT_PUBLIC || 'certs/jwt-test-public.pem',
        private: process.env.KOTEI_CERT_PRIVATE || 'certs/jwt-test-private.pem'
    },
    
    mode: process.env.KOTEI_MODE || 'debug'
}

module.exports = config