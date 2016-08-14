var jstest = require('jstest').Test

require('./buffer_spec')
require('./crypto_spec')
require('./cipher_spec')

jstest.autorun()
