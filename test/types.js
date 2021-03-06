/*global describe, it, TextEncoder */
'use strict';

var assert = require('assert');
var types = require('../lib/types');
var Context = require('../lib/context');
var sources = require('../lib/sources');
var utils = require('./utils');
var async_test = utils.async_test;

var TextEncoderImpl = null;

if (typeof(TextEncoder) !== 'undefined') {
  TextEncoderImpl = TextEncoder;
} else {
  TextEncoderImpl = require('text-encoding').TextEncoder;
}

var tests = function (type, done, bytes, expected) {
  async_test(new Context(sources(bytes)).read_array(type, expected.length), done, function (value) {
    for (var idx = 0; idx < expected.length; idx++) {
      assert.equal(value[idx], expected[idx]);
    }
  });
};

describe('binr', function () {
  describe('.types', function () {
    it('int8', function (done) {
      tests(types.int8, done,
        [0x00, 0x7F, 0xFF],
        [   0,  127,   -1]);
    });
    it('uint8', function (done) {
      tests(types.uint8, done,
        [0x00, 0x7F, 0xFF],
        [   0,  127,  255]);
    });

    it('leint16', function (done) {
      tests(types.leint16, done,
        [0x00, 0x00, 0xFF, 0x7F, 0xFF, 0xFF],
        [         0,      32767,         -1]);
    });
    it('beint16', function (done) {
      tests(types.beint16, done,
        [0x00, 0x00, 0x7F, 0xFF, 0xFF, 0xFF],
        [         0,      32767,         -1]);
    });
    it('leuint16', function (done) {
      tests(types.leuint16, done,
        [0x00, 0x00, 0xFF, 0x7F, 0xFF, 0xFF],
        [         0,      32767,      65535]);
    });
    it('beuint16', function (done) {
      tests(types.beuint16, done,
        [0x00, 0x00, 0x7F, 0xFF, 0xFF, 0xFF],
        [         0,      32767,      65535]);
    });

    it('leint32', function (done) {
      tests(types.leint32, done,
        [0x00, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0xFF, 0x7F, 0xFF, 0xFF, 0xFF, 0xFF],
        [                     0,             2147483647,                     -1]);
    });
    it('beint32', function (done) {
      tests(types.beint32, done,
        [0x00, 0x00, 0x00, 0x00, 0x7F, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF],
        [                     0,             2147483647,                     -1]);
    });
    it('leuint32', function (done) {
      tests(types.leuint32, done,
        [0x00, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0xFF, 0x7F, 0xFF, 0xFF, 0xFF, 0xFF],
        [                     0,             2147483647,             4294967295]);
    });
    it('beuint32', function (done) {
      tests(types.beuint32, done,
        [0x00, 0x00, 0x00, 0x00, 0x7F, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF],
        [                     0,             2147483647,             4294967295]);
    });

    it('lefloat16', function (done) {
      tests(types.lefloat16, done,
        [0x00, 0x00, 0x00, 0xC0, 0x00, 0x7C, 0x00, 0xFC, 0xFF, 0x7B,             0xFF, 0x03],
        [       0.0,       -2.0,   Infinity,  -Infinity,      65504, 0.00006097555160522461]);
    });
    it('befloat16', function (done) {
      tests(types.befloat16, done,
        [0x00, 0x00, 0xC0, 0x00, 0x7C, 0x00, 0xFC, 0x00, 0x7B, 0xFF,             0x03, 0xFF],
        [       0.0,       -2.0,   Infinity,  -Infinity,      65504, 0.00006097555160522461]);
    });
    it('handles NaN for float16', function (done) {
      async_test(new Context(sources([0x01, 0x7C, 0x01, 0xFC])).read_array(types.lefloat16, 2), done, function (value) {
          assert.ok(isNaN(value[0]));
          assert.ok(isNaN(value[1]));
      });
    });

    it('lefloat32', function (done) {
      tests(types.lefloat32, done,
        [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x80, 0xBF, 0x00, 0x00, 0x80, 0x7F, 0x00, 0x00, 0x80, 0xFF],
        [                   0.0,                   -1.0,               Infinity,              -Infinity]);
    });
    it('befloat32', function (done) {
      tests(types.befloat32, done,
        [0x00, 0x00, 0x00, 0x00, 0xBF, 0x80, 0x00, 0x00, 0x7F, 0x80, 0x00, 0x00, 0xFF, 0x80, 0x00, 0x00],
        [                   0.0,                   -1.0,               Infinity,              -Infinity]);
    });

    it('lefloat64', function (done) {
      tests(types.lefloat64, done,
        [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xF0, 0xBF, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xF0, 0x7F, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xF0, 0xFF],
        [                                           0.0,                                           -1.0,                                       Infinity,                                      -Infinity]);
    });
    it('befloat64', function (done) {
      tests(types.befloat64, done,
        [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xBF, 0xF0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x7F, 0xF0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xF0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
        [                                           0.0,                                           -1.0,                                       Infinity,                                      -Infinity]);
    });

    it('bytes', function (done) {
      async_test(new Context(sources([0x01, 0xF0, 0xFF])).read_with_args(types.bytes)(3), done, function (value) {
        assert.equal(value[0], 0x01);
        assert.equal(value[1], 0xF0);
        assert.equal(value[2], 0xFF);
      });
    });

    var test_string = "てすと!";
    it('string8', function (done) {
      var test_string_array = Array.apply([], new TextEncoderImpl('utf-8').encode(test_string));
      var test_string_array_with_null = test_string_array.concat(0x00);

      async_test(new Context(sources(test_string_array)).read_with_args(types.string8)(test_string_array.length), done, function (value) {
        assert.equal(value, test_string);
        async_test(new Context(sources(test_string_array_with_null)).read_with_args(types.string8)(test_string_array_with_null.length), done, function (value) {
          assert.equal(value, test_string);
          async_test(new Context(sources(test_string_array_with_null)).read(types.string8), done, function (value) {
            assert.equal(value, test_string);
          });
        }, true);
      }, true);
    });

    it('lestring16', function (done) {
      var test_string_array = Array.apply([], new TextEncoderImpl('utf-16le').encode(test_string));
      var test_string_array_with_null = test_string_array.concat(0x00, 0x00);

      async_test(new Context(sources(test_string_array)).read_with_args(types.lestring16)(test_string_array.length / 2), done, function (value) {
        assert.equal(value, test_string);
        async_test(new Context(sources(test_string_array_with_null)).read_with_args(types.lestring16)(test_string_array_with_null.length / 2), done, function (value) {
          assert.equal(value, test_string);
          async_test(new Context(sources(test_string_array_with_null)).read(types.lestring16), done, function (value) {
            assert.equal(value, test_string);
          });
        }, true);
      }, true);
    });

    it('bestring16', function (done) {
      var test_string_array = Array.apply([], new TextEncoderImpl('utf-16be').encode(test_string));
      var test_string_array_with_null = test_string_array.concat(0x00, 0x00);

      async_test(new Context(sources(test_string_array)).read_with_args(types.bestring16)(test_string_array.length / 2), done, function (value) {
        assert.equal(value, test_string);
        async_test(new Context(sources(test_string_array_with_null)).read_with_args(types.bestring16)(test_string_array_with_null.length / 2), done, function (value) {
          assert.equal(value, test_string);
          async_test(new Context(sources(test_string_array_with_null)).read(types.bestring16), done, function (value) {
            assert.equal(value, test_string);
          });
        }, true);
      }, true);
    });
  });
});
