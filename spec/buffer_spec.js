var JS     = require('jstest'),
    Cipher = require('../'),
    Buffer = Cipher.Buffer

JS.Test.describe('Buffer', function() { with(this) {
  this.define('getBytes', function(buffer) {
    var array = [], i = buffer.length
    while (i--) array[i] = buffer.readUInt8(i)
    return array
  })

  describe('encodings', function() { with(this) {
    this.define('assertConvert', function(encoding, examples) {
      var buffer, bytes

      for (var key in examples) {
        bytes = (key.match(/[0-9a-f]{2}/ig) || []).map(function(s) { return parseInt(s, 16) })

        buffer = new Buffer(bytes)
        this.assertEqual(examples[key], buffer.toString(encoding))

        buffer = new Buffer(examples[key], encoding)
        this.assertEqual(bytes, this.getBytes(buffer))
      }
    })

    it('converts to base64', function() { with(this) {
      assertConvert('base64', {
        ''            : '',
        '00'          : 'AA==',
        '01'          : 'AQ==',
        '04'          : 'BA==',
        '7f'          : 'fw==',
        'ff'          : '/w==',
        '00 00'       : 'AAA=',
        '00 80'       : 'AIA=',
        'ff ff'       : '//8=',
        '1a 5a 37'    : 'Glo3',
        'ff ff ff'    : '////',
        'c6 ea 26 9e' : 'xuomng=='
      })
    }})

    it('accepts malformed base64', function() { with(this) {
      assertEqual( [0x92], getBytes(new Buffer('kk==', 'base64')) )
      assertEqual( 'kg==', new Buffer([0x92]).toString('base64') )
    }})

    it('converts to hex', function() { with(this) {
      assertConvert('hex', {
        ''            : '',
        '00'          : '00',
        '01'          : '01',
        '04'          : '04',
        '7f'          : '7f',
        'ff'          : 'ff',
        '00 00'       : '0000',
        '00 80'       : '0080',
        'ff ff'       : 'ffff',
        '1a 5a 37'    : '1a5a37',
        'ff ff ff'    : 'ffffff',
        'c6 ea 26 9e' : 'c6ea269e'
      })
    }})

    it('rejects invalid hex strings', function() { with(this) {
      assertThrows(TypeError, function() { new Buffer('0', 'hex') })
      assertThrows(TypeError, function() { new Buffer('z', 'hex') })
    }})

    it('converts to utf8', function() { with(this) {
      assertConvert('utf8', {
        '00'             : '\0',
        '09'             : '\t',
        '20'             : ' ',
        '21'             : '!',
        '36'             : '6',
        '41'             : 'A',
        '5b'             : '[',
        '7a'             : 'z',
        '7b'             : '{',
        '7e'             : '~',
        '68 65 6c 6c 6f' : 'hello',
        'c2 a3'          : '£',
        'c6 93'          : 'Ɠ',
        'd0 8b'          : 'Ћ',
        'd1 b9'          : 'ѹ',
        'dc a3'          : 'ܣ',
        'e1 92 81'       : 'ᒁ',
        'e6 b5 86'       : '浆',
        'e8 93 9a'       : '蓚',
        'f0 92 80 ab'    : '𒀫',
        'f0 9f 93 88'    : '📈',
        'f0 9f 98 b1'    : '😱'
      })
    }})

    it('converts unpaired high surrogates to the replacement character', function() { with(this) {
      assertEqual( [0xef, 0xbf, 0xbd, 0x61], getBytes(new Buffer('\udb99a', 'utf8')) )
    }})

    it('converts unpaired low surrogates to the replacement character', function() { with(this) {
      assertEqual( [0xef, 0xbf, 0xbd, 0x61], getBytes(new Buffer('\udf00a', 'utf8')) )
    }})

    it('converts illegal encodings of valid codepoints to replacement characters', function() { with(this) {
      // 'a' = 01100001 -> 11000001 10100001 = c1 a1
      assertEqual( '\ufffd\ufffd', new Buffer([0xc1, 0xa1]).toString('utf8') )
      // 'a' = 01100001 -> 11100000 10000001 10100001 = e0 81 a1
      assertEqual( '\ufffd\ufffd\ufffd', new Buffer([0xe0, 0x81, 0xa1]).toString('utf8') )
    }})

    it('converts encodings of high surrogates to literal surrogates', function() { with(this) {
      // db99 = 1101101110011001 -> 11101101 10101110 10011001 = ed ae 99
      assertEqual( '\udb99', new Buffer([0xed, 0xae, 0x99]).toString('utf8') )
    }})

    it('converts encodings of low surrogates to literal surrogates', function() { with(this) {
      // df00 = 1101111100000000 -> 11101101 10111100 10000000
      assertEqual( '\udf00', new Buffer([0xed, 0xbc, 0x80]).toString('utf8') )
    }})
  }})
}})
