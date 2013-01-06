require('jsclass')
JS.require('JS.Test')

var Cipher = require('../lib/vault-cipher')

JS.Test.describe('vault-cipher', function() { with(this) {
  before(function() { with(this) {
    this.cipher = new Cipher('the-key', {uuid: 'ABCD1234'})
  }})
  
  describe('encryption', function() { with(this) {
    it('generates a different string every time', function(resume) { with(this) {
      cipher.encrypt('hello', function(error, text1) {
        cipher.encrypt('hello', function(error, text2) {
          resume(function() { assertNotEqual( text1, text2 ) })
        })
      })
    }})
    
    it('is reversible', function(resume) { with(this) {
      cipher.encrypt('some content', function(error, text) {
        cipher.decrypt(text, function(error, message) {
          resume(function() { assertEqual( 'some content', message) })
        })
      })
    }})
  }})
  
  describe('decryption', function() { with(this) {
    before(function(resume) { with(this) {
      this.message = 'the secret message'
      cipher.encrypt(message, function(error, text) {
        this.text = text
        resume()
      }, this)
    }})
    
    it('decrypts the ciphertext', function(resume) { with(this) {
      cipher.decrypt(text, function(error, result) {
        resume(function() {
          assertNull( error )
          assertEqual( message, result )
        })
      })
    }})
    
    it('throws an error if the text is altered', function(resume) { with(this) {
      text = text.replace(/^./, 'x')
      cipher.decrypt(text, function(error, result) {
        resume(function() {
          assertNotNull( error )
          assertSame( undefined, result )
        })
      })
    }})
  }})
}})

JS.Test.autorun()

