JS = require('jstest')
JS.ENV.Cipher = require('../lib/vault-cipher')

require('./cipher_spec')

JS.Test.autorun()

