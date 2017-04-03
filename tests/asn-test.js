// Node.js specific:
var prettybnf = require('../lib/ASN1/prettybnf'), fs = require('fs');
var g = fs.readFileSync(__dirname + '/g.bnf', 'utf8');

// The grammar is stored in the string g
var ast = prettybnf.parse(g);
console.log(ast);