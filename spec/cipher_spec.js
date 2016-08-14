var jstest = require('jstest').Test,
    Cipher = require('../'),
    Buffer = Cipher.Buffer

jstest.describe('vault-cipher', function() { with(this) {
  sharedExamplesFor('cipher algorithm', function() { with(this) {
    before(function() { with(this) {
      this.cipher = new Cipher('the-key', {format: format, work: 1})
    }})

    describe('encryption', function() { with(this) {
      it('generates a different string every time', function() { with(this) {
        var p1 = cipher.encrypt('hello'),
            p2 = cipher.encrypt('hello')

        assertNotEqual( p1, p2 )
      }})

      it('is reversible', function() { with(this) {
        var message = cipher.decrypt(cipher.encrypt('some content'))
        assertEqual( 'some content', message )
      }})
    }})

    describe('decryption', function() { with(this) {
      before(function() { with(this) {
        this.message = 'the secret message'
        this.text = cipher.encrypt(message)
      }})

      it('decrypts the ciphertext', function() { with(this) {
        var result = cipher.decrypt(text)
        assertEqual( message, result )
      }})

      it('throws an error if the text is altered', function() { with(this) {
        text = text.replace(/^..../, '0000')
        assertThrows(Error, function() { cipher.decrypt(text) })
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

  it('decrypts a known ciphertext', function() { with(this) {
    var cipher = new Cipher('give us the room', {salt: 'whats next', work: 1}),
        ciphertext = 'uSiYZkAyNQgO7rDYTeYG6f20lhCscaQCxWzTqwqJUQekBDNzYfEbbXa4T6suNQK/5MuX0GZ3TIXdksu4OFhycg=='

    var text = cipher.decrypt(ciphertext)
    assertEqual( 'answer me this', text )
  }})

  it('decrypts a known ciphertext as a buffer', function() { with(this) {
    var cipher = new Cipher('give us the room', {salt: 'whats next', work: 1}),
        ciphertext = 'uSiYZkAyNQgO7rDYTeYG6f20lhCscaQCxWzTqwqJUQekBDNzYfEbbXa4T6suNQK/5MuX0GZ3TIXdksu4OFhycg=='

    var text = cipher.decrypt(new Buffer(ciphertext, 'base64'))
    assertEqual( 'answer me this', text )
  }})
}})
