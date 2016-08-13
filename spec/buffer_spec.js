var JS      = require('jstest'),
    Cipher  = require('../'),
    Buffer  = Cipher.Buffer,
    VERSION

if (process.version)
  VERSION = process.version.match(/[0-9]+/g).map(function(v) { return parseInt(v, 10) })

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

    if (VERSION && VERSION[0] < 1) return

    it('converts encodings of high surrogates to replacement characters', function() { with(this) {
      // db99 = 1101101110011001 -> 11101101 10101110 10011001 = ed ae 99
      assertEqual( '\ufffd\ufffd\ufffd', new Buffer([0xed, 0xae, 0x99]).toString('utf8') )
    }})

    it('converts encodings of low surrogates to replacement characters', function() { with(this) {
      // df00 = 1101111100000000 -> 11101101 10111100 10000000 = ed bc 80
      assertEqual( '\ufffd\ufffd\ufffd', new Buffer([0xed, 0xbc, 0x80]).toString('utf8') )
    }})
  }})

  describe('{read,write}{U,}Int{8,16,32}{BE,LE}', function() { with(this) {
    before(function() { with(this) {
      this.buffer = new Buffer('5e885b27bcf209bf', 'hex')
    }})

    if (!VERSION || VERSION[0] > 0 || VERSION[1] >= 12) {
      it('reads from offset 0 by default', function() { with(this) {
        assertEqual( 0x5e,       buffer.readUInt8() )
        assertEqual( 0x5e88,     buffer.readUInt16BE() )
        assertEqual( 0x5e885b27, buffer.readUInt32BE() )
      }})
    }

    it('reads from a given offset', function() { with(this) {
      assertEqual( 0x88,       buffer.readUInt8(1) )
      assertEqual( 0x885b,     buffer.readUInt16BE(1) )
      assertEqual( 0x885b27bc, buffer.readUInt32BE(1) )
    }})

    it('reads little-endian values', function() { with(this) {
      assertEqual( 0x885e,     buffer.readUInt16LE(0) )
      assertEqual( 0x275b885e, buffer.readUInt32LE(0) )
    }})

    it('reads signed values', function() { with(this) {
      assertEqual(  0x5e,           buffer.readInt8(0) )
      assertEqual( -0x78,           buffer.readInt8(1) )
      assertEqual(  0x5e885b27,     buffer.readInt32BE(0) )
      assertEqual( -0x430df641,     buffer.readInt32BE(4) )
    }})

    it('throws an error for out-of-bounds reads', function() { with(this) {
      assertThrows(Error, function() { buffer.readUInt8(8) })
      assertThrows(Error, function() { buffer.readUInt16BE(7) })
      assertThrows(Error, function() { buffer.readUInt32BE(5) })
    }})

    if (!VERSION || VERSION[0] > 0 || VERSION[1] >= 12) {
      it('writes to offset 0 by default', function() { with(this) {
        buffer.writeUInt8(0xff)
        assertEqual( 'ff885b27bcf209bf', buffer.toString('hex') )

        buffer.writeUInt16BE(0xfefd)
        assertEqual( 'fefd5b27bcf209bf', buffer.toString('hex') )

        buffer.writeUInt32BE(0xfcfbfaf9)
        assertEqual( 'fcfbfaf9bcf209bf', buffer.toString('hex') )
      }})
    }

    it('writes to a given offset', function() { with(this) {
      buffer.writeUInt8(0xff, 1)
      assertEqual( '5eff5b27bcf209bf', buffer.toString('hex') )

      buffer.writeUInt16BE(0xfefd, 2)
      assertEqual( '5efffefdbcf209bf', buffer.toString('hex') )

      buffer.writeUInt32BE(0xfcfbfaf9, 4)
      assertEqual( '5efffefdfcfbfaf9', buffer.toString('hex') )
    }})

    it('writes little-endian values', function() { with(this) {
      buffer.writeUInt16LE(0xfefd, 0)
      assertEqual( 'fdfe5b27bcf209bf', buffer.toString('hex') )

      buffer.writeUInt32LE(0xfcfbfaf9, 0)
      assertEqual( 'f9fafbfcbcf209bf', buffer.toString('hex') )
    }})

    it('writes signed values', function() { with(this) {
      buffer.writeInt8(-99, 0)
      assertEqual( '9d885b27bcf209bf', buffer.toString('hex') )

      buffer.writeInt16BE(-16384, 0)
      assertEqual( 'c0005b27bcf209bf', buffer.toString('hex') )

      buffer.writeInt32BE(-268435456, 0)
      assertEqual( 'f0000000bcf209bf', buffer.toString('hex') )
    }})

    it('throws an error for out-of-bounds writes', function() { with(this) {
      assertThrows(Error, function() { buffer.writeUInt8(0, 8) })
      assertThrows(Error, function() { buffer.writeUInt16BE(0, 7) })
      assertThrows(Error, function() { buffer.writeUInt32BE(0, 5) })
    }})

    it('throws an error for out-of-range writes', function() { with(this) {
      assertThrows(Error, function() { buffer.writeInt8(  Math.pow(2, 7) ) })
      assertThrows(Error, function() { buffer.writeInt8(  -1 - Math.pow(2, 7) ) })
      assertThrows(Error, function() { buffer.writeUInt8( Math.pow(2, 8) ) })
      assertThrows(Error, function() { buffer.writeUInt8( -1 ) })

      assertThrows(Error, function() { buffer.writeInt32BE(  Math.pow(2, 31) ) })
      assertThrows(Error, function() { buffer.writeInt32BE(  -1 - Math.pow(2, 31) ) })
      assertThrows(Error, function() { buffer.writeUInt32BE( Math.pow(2, 32) ) })
      assertThrows(Error, function() { buffer.writeUInt32BE( -1 ) })
    }})
  }})

  describe('concat()', function() { with(this) {
    before(function() { with(this) {
      this.bufs = [
        new Buffer('01', 'hex'),
        new Buffer('0203', 'hex'),
        new Buffer('04050607', 'hex')
      ]
    }})

    it('concatenates a list of buffers', function() { with(this) {
      assertEqual( '01020304050607', Buffer.concat(bufs).toString('hex') )
    }})

    it('returns an empty buffer for zero length', function() { with(this) {
      assertEqual( '', Buffer.concat(bufs, 0).toString('hex') )
    }})


    if (!VERSION || VERSION[0] > 0 || VERSION[1] >= 12) {
      it('returns a truncated buffer', function() { with(this) {
        assertEqual( '010203', Buffer.concat(bufs, 3).toString('hex') )
      }})
    }

    it('returns an extended buffer', function() { with(this) {
      assertMatch( /^01020304050607..$/, Buffer.concat(bufs, 8).toString('hex') )
    }})
  }})

  describe('copy()', function() { with(this) {
    before(function() { with(this) {
      this.source = new Buffer('0102030405', 'hex')
      this.target = new Buffer('0000000000000000', 'hex')
    }})

    it('copies the whole source to the beginning of the target', function() { with(this) {
      assertEqual( 5, source.copy(target) )
      assertEqual( '0102030405000000', target.toString('hex') )
    }})

    it('copies the whole source to an offset in the target', function() { with(this) {
      assertEqual( 5, source.copy(target, 2) )
      assertEqual( '0000010203040500', target.toString('hex') )
    }})

    it('drops source material that escapes the target size', function() { with(this) {
      assertEqual( 4, source.copy(target, 4) )
      assertEqual( '0000000001020304', target.toString('hex') )
    }})

    if (!VERSION || VERSION[0] > 0 || VERSION[1] >= 12) {
      it('does not modify the target if the offset is too high', function() { with(this) {
        assertEqual( 0, source.copy(target, 8) )
        assertEqual( '0000000000000000', target.toString('hex') )
      }})
    }

    it('copies a portion of the source', function() { with(this) {
      assertEqual( 3, source.copy(target, 0, 2) )
      assertEqual( '0304050000000000', target.toString('hex') )
    }})

    it('copies none of the source if the offset is too high', function() { with(this) {
      assertEqual( 0, source.copy(target, 0, 5) )
      assertEqual( '0000000000000000', target.toString('hex') )
    }})

    it('copies a portion of the source with an end offset', function() { with(this) {
      assertEqual( 2, source.copy(target, 0, 3, 5) )
      assertEqual( '0405000000000000', target.toString('hex') )
    }})

    it('copies a portion of the source if the end offset is too high', function() { with(this) {
      assertEqual( 2, source.copy(target, 0, 3, 6) )
      assertEqual( '0405000000000000', target.toString('hex') )
    }})
  }})

  describe('slice()', function() { with(this) {
    before(function() { with(this) {
      this.source = new Buffer('0102030405', 'hex')
    }})

    it('returns the whole of the source', function() { with(this) {
      assertEqual( '0102030405', source.slice().toString('hex') )
    }})

    it('returns a portion of the source to the end', function() { with(this) {
      assertEqual( '030405', source.slice(2).toString('hex') )
    }})

    it('returns a portion of the source', function() { with(this) {
      assertEqual( '0304', source.slice(2, 4).toString('hex') )
    }})

    it('returns a portion of the source with negative offsets', function() { with(this) {
      assertEqual( '0304', source.slice(-3, -1).toString('hex') )
    }})
  }})
}})
