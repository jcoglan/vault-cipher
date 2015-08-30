var JS      = require('jstest'),
    Cipher  = require('..'),
    Buffer  = require('../lib/buffer').Buffer,
    Promise = require('../lib/promise')

JS.Test.describe('vault-cipher', function() { with(this) {
  sharedExamplesFor('cipher algorithm', function() { with(this) {
    before(function() { with(this) {
      this.cipher = new Cipher('the-key', {format: format, work: 1})
    }})

    describe('encryption', function() { with(this) {
      it('generates a different string every time', function(resume) { with(this) {
        var p1 = cipher.encrypt('hello'),
            p2 = cipher.encrypt('hello')

        Promise.all([p1, p2]).then(function(texts) {
          resume(function() { assertNotEqual( texts[0], texts[1] ) })
        })
      }})

      it('is reversible', function(resume) { with(this) {
        cipher.encrypt('some content').then(function(text) {
          return cipher.decrypt(text)
        }).then(function(message) {
          resume(function() { assertEqual( 'some content', message) })
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
        cipher.decrypt(text).then(function(result) {
          resume(function() { assertEqual( message, result ) })
        })
      }})

      it('throws an error if the text is altered', function(resume) { with(this) {
        text = text.replace(/^..../, '0000')
        cipher.decrypt(text).catch(function(error) {
          resume(function() { assertNotNull( error ) })
        })
      }})
    }})
  }})

  describe('with base64 output', function() { with(this) {
    before(function() { this.format = 'base64' })
    itShouldBehaveLike('cipher algorithm')
  }})

  describe('with hex output', function() { with(this) {
    before(function() { this.format = 'hex' })
    itShouldBehaveLike('cipher algorithm')
  }})

  it('decrypts a known ciphertext', function(resume) { with(this) {
    var cipher = new Cipher('give us the room', {salt: 'whats next', work: 1}),
        ciphertext = 'uSiYZkAyNQgO7rDYTeYG6f20lhCscaQCxWzTqwqJUQekBDNzYfEbbXa4T6suNQK/5MuX0GZ3TIXdksu4OFhycg=='

    cipher.decrypt(ciphertext).then(function(text) {
      resume(function() { assertEqual( 'answer me this', text ) })
    })
  }})

  it('decrypts a known ciphertext as a buffer', function(resume) { with(this) {
    var cipher = new Cipher('give us the room', {salt: 'whats next', work: 1}),
        ciphertext = 'uSiYZkAyNQgO7rDYTeYG6f20lhCscaQCxWzTqwqJUQekBDNzYfEbbXa4T6suNQK/5MuX0GZ3TIXdksu4OFhycg=='

    cipher.decrypt(new Buffer(ciphertext, 'base64')).then(function(text) {
      resume(function() { assertEqual( 'answer me this', text ) })
    })
  }})
}})
