var JS      = require('jstest'),
    Cipher  = require('../'),
    crypto  = Cipher.crypto,
    Buffer  = Cipher.Buffer,
    VERSION

JS.Test.describe('crypto', function() { with(this) {
  before(function() { with(this) {
    this.key = new Buffer('5AbFdjdUpIhx5hVeFrEpWYLucIogiXH9bOvFiOHLrBI=', 'base64')
    this.iv  = new Buffer('JQLZwyFW8v1lz7Cm/ino5w==', 'base64')

    this.message = 'The quick brown fox jumps over the lazy dog'
  }})

  describe('createCipheriv', function() { with(this) {
    it('encrypts a message', function() { with(this) {
      var cipher = crypto.createCipheriv('aes-256-cbc', key, iv),
          result = cipher.update(message, 'utf8', 'hex') + cipher.final('hex')

      assertEqual( 'c193f4b1efe65e090b7df27a437ae8a69d969d959c42568e' +
                   'a3bd9c47cc457f17419d746a8aace44e36a1a308e1e9f46a', result )
    }})
  }})

  describe('createDecipheriv', function() { with(this) {
    before(function() { with(this) {
      this.ciphertext = 'c193f4b1efe65e090b7df27a437ae8a69d969d959c42568e' +
                        'a3bd9c47cc457f17419d746a8aace44e36a1a308e1e9f46a'
    }})

    it('decrypts a message', function() { with(this) {
      var decipher = crypto.createDecipheriv('aes-256-cbc', key, iv),
          result   = decipher.update(ciphertext, 'hex', 'utf8') + decipher.final('utf8')

      assertEqual( message, result )
    }})

    it('throws an error when the wrong key is used', function() { with(this) {
      var decipher = crypto.createDecipheriv('aes-256-cbc', crypto.randomBytes(32), iv)
      assertThrows(Error, function() {
        decipher.update(ciphertext, 'hex', 'utf8') + decipher.final('utf8')
      })
    }})
  }})

  describe('createHmac', function() { with(this) {
    it('performs HMAC-SHA1', function() { with(this) {
      var hmac = crypto.createHmac('sha1', key).update(message)
      assertEqual( 'aVBO+z7CTL5kNdSD9LUX6JNUFDk=', hmac.digest('base64') )
    }})

    it('performs HMAC-SHA256', function() { with(this) {
      var hmac = crypto.createHmac('sha256', key).update(message)
      assertEqual( '80tl+yvF2l6qLlj+j8SwyRZefTnZQ90Yeg9vtuZADwU=', hmac.digest('base64') )
    }})
  }})

  describe('pbkdf2Sync', function() { with(this) {
    it('generates a buffer of the requested length', function() { with(this) {
      var buffer = crypto.pbkdf2Sync(key, iv, 10, 23, 'sha1')
      assertEqual( '67ENoV83EXwElicrnnRBVmatHHvAEaM=', buffer.toString('base64') )
    }})
  }})

  describe('randomBytes', function() { with(this) {
    it('returns a buffer', function() { with(this) {
      assertKindOf( Buffer, crypto.randomBytes(8) )
    }})

    it('returns a buffer of the given length', function() { with(this) {
      assertEqual( 23, crypto.randomBytes(23).length )
    }})
  }})
}})
