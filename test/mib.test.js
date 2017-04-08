const assert = require('assert');
var fs = require("fs");
var mib = require("../lib/mib");
//-------------------------------- SYNTAX TEST ---------------------------------------
var syntaxResults = require('./syntax-test.json');
/*
for (var i = 0; i < syntaxResults.textSequence.length; i++) {
        assert.deepEqual(mib.parseSyntax(syntaxResults.textSequence[i]).returned, syntaxResults.results[i].returned, 'Error in SYNTAX test: ' + syntaxResults.textSequence[i]);
}*/

//-------------------------------- OBJECT TYPE TEST ---------------------------------------

var objectTypeResults = require('./object-type-test.json');
/*
for (var i = 0; i < objectTypeResults.textSequence.length; i++) {
        assert.deepEqual(mib.parseObjectType(objectTypeResults.textSequence[i]).returned, objectTypeResults.results[i].returned, 'Error in OBJECT TYPE test: ' + objectTypeResults.textSequence[i]);
}*/
describe('MIB TEST', function () {
        describe('#SYNTAX', function () {
                it('Checking syntax', function () {
                        for (var i = 0; i < syntaxResults.textSequence.length; i++) {
                                assert.deepEqual(mib.parseSyntax(syntaxResults.textSequence[i]).returned, syntaxResults.results[i].returned,'Error in SYNTAX test: ' + syntaxResults.textSequence[i]);
                        }
                });
        });
        describe('#OBJECT TYPE', function () {
                it('Checking Object Type', function () {
                        for (var i = 0; i < objectTypeResults.textSequence.length; i++) {
                                assert.deepEqual(mib.parseObjectType(objectTypeResults.textSequence[i]).returned, objectTypeResults.results[i].returned,'Error in OBJECT TYPE test: ' + objectTypeResults.textSequence[i]);

                        }
                });
        });
});