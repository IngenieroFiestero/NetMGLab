var fs = require('fs');
/**
 * The code from PrimeEuler is so caotic. So i write my own library. 
 * I use OOP dividing all the text in fragments: MODULE-IDENTITY, OBJECT IDENTIFIER ... each in charge of a section.
 * Divide and conquer
 */

var lineReader = require('readline');
var ASN1BER = {
    2: 'INTEGER',
    4: 'OctetString',
    5: 'Null',
    6: 'ObjectIdentifier',
    48: 'Sequence',
    64: 'IpAddress',
    65: 'Counter',
    66: 'Gauge',
    67: 'TimeTicks',
    68: 'Opaque',
    69: 'NsapAddress',
    70: 'Counter64',
    128: 'NoSuchObject',
    129: 'NoSuchInstance',
    130: 'EndOfMibView',
    160: 'PDUBase',
    INTEGER: 2,
    OctetString: 4,
    Null: 5,
    ObjectIdentifier: 6,
    Sequence: 48,
    IpAddress: 64,
    Counter: 65,
    Gauge: 66,
    TimeTicks: 67,
    Opaque: 68,
    NsapAddress: 69,
    Counter64: 70,
    NoSuchObject: 128,
    NoSuchInstance: 129,
    EndOfMibView: 130,
    PDUBase: 160
}

/**
 * For parsing and create MIBs
 */
function objectDefinition(name, datatype, access, status, description, oid) {
    this.name = name;
    this.syntax = datatype;
    this.access = access;
    this.status = status;
    this.description = description;
    this.oid = oid;
}
/**
 * Transforms a objectDefinition in JavaScript into SMI format:
 * <name> OBJECT-TYPE
 *   SYNTAX <datatype>
 *   ACCESS <either read-only, read-write, write-only, or not-accessible>
 *   STATUS <either mandatory, optional, or obsolete>
 *   DESCRIPTION 
 *       "Textual description describing this particular managed object."
 *   ::= { <Unique OID that defines this object> }  
 */
objectDefinition.prototype._toString = function toString() {
    return (this.name + " OBJECT-TYPE\n\tSYNTAX " + this.datatype + "\n\tACCESS " + this.access + "\n\STATUS " + this.status + "\n\tDESCRIPTION\n\t\t\"" + this.description + "\"\n\t::= { " + this.oid + "}");
}

function mibModule(name, moduleImports, moduleInfo, oid, moduleObjects, textualConventions) {
    this.name = name;
    /**
     * Array of objects:
     * {
     *      from : String,
     *      imports : [String]
     * }
     */
    this.imports = moduleImports || [];
    /**
     * {
     *      lastUpdated : Date,
     *      organization : String,
     *      contactInfo : String,
     *      description : String,
     *      revisions : [
     *          {
     *              revision : String,
     *              description : String
     *          }
     *      ]
     * }
     */
    this.moduleIdentity = moduleInfo || new ModuleIdentity();
    this.textualConventions = textualConventions || [];

}

//------------------------------------------------------------------------------------- MODULE IDENTITY -------------------------------------------------------------------------------------

function ModuleIdentity(name, lastUpdated, organization, contactInfo, description, revisions, oid) {
    if (name && name != "") {
        this.name = name;
    } else {
        throw new Error("No valid name");
    }
    this.lastUpdated = lastUpdated || new Date();
    this.organization = organization || "";
    this.contactInfo = contactInfo || "";
    this.description = description || "";
    this.revisions = revisions || [];
    this.oid = oid;
}
/**
 * Module Identity to String
 */
ModuleIdentity.prototype._toString = function toString() {
    var ret = this.name + " MODULE-IDENTITY\n\tLAST-UPDATED \"" + this.lastUpdated + "\"\n\tORGANIZATION \"" + this.organization + "\"\n\tCONTACT-INFO \n\t\t\"" + this.contactInfo + "\"\n\tDESCRIPTION \"" + this.description + "\"\n";
    for (var i = 0; i < this.revisions.length; i++) {
        ret += "\tREVISION \"" + this.revisions[i].revision + "\"\n\tDESCRIPTION\n\t\t\"" + this.revisions[i].description + "\"\n";
    }
    ret += "\t\t::={" + this.oid.name + this.oid.number + " }\n";
    return ret;
}
/**
 * For parsing a sequence of charactes into a ModuleIdentity
 * @param {String} sequence 
 * @return {{returned : "ModuleIdentity", lastChar : Number}}
 */
function parseModuleIdentity(sequence) {
    var lastSymbol = "";
    var symbol = "";
    var cleared = false;
    var isString = false;
    var isCurly = false;
    var isRevision = false;
    var revisionObject = {};
    var name = "";
    var lastUpdated = "";
    var organization = "";
    var contactInfo = "";
    var description = "";
    var revisions = [];
    var oid = { 'name': "", 'number': 0 };
    var isComment = false;
    var i;
    for (i = 0; i < sequence.length; i++) {
        var char = sequence.charAt(i);
        if (isString) {
            //Reading a String: "my string"
            //all characters
            if (char == '"') {
                //Exit String
                isString = false;
                cleared = false;
            } else {
                symbol += char;
            }
        } else if (isComment == true) {
            if (char == '\n') {
                isComment = false;
            }
        } else {
            if (cleared == false && (char == ' ' || char == '\n' || char == '\t')) {
                if (symbol == 'MODULE-IDENTITY') {
                    name = lastSymbol;
                } else {
                    if (isCurly == true) {
                        if (lastSymbol == "{" && symbol == "}") {
                            throw new Error("No OID");
                        } else if (lastSymbol == "{") {
                            oid.name = symbol;
                        } else if (symbol == "}") {
                            oid.number = Number(lastSymbol);
                            return {
                                returned: new ModuleIdentity(name, lastUpdated, organization, contactInfo, description, revisions, oid),
                                lastChar: i//Last position of the pointer
                            };
                        }
                    } else {
                        switch (lastSymbol) {
                            case 'LAST-UPDATED':
                                lastUpdated = symbol;
                                break;
                            case 'ORGANIZATION':
                                organization = symbol;
                                break;
                            case 'CONTACT-INFO':
                                contactInfo = symbol;
                                break;
                            case 'DESCRIPTION':
                                if (isRevision == true) {
                                    revisionObject.description = symbol;
                                    revisions.push(revisionObject);
                                    revisionObject = {};
                                    isRevision = false;
                                } else {
                                    description = symbol;
                                }
                                break;
                            case 'REVISION':
                                isRevision = true;
                                revisionObject.revision = symbol;
                                break;
                        }
                    }
                }
                lastSymbol = symbol;
                symbol = "";
                cleared = true;
            } else {
                if (char != ' ' && char != '\n' && char != '\t') {
                    if (char == '"') {
                        isString = true;
                    } else if (char == "{") {
                        isCurly = true;
                        symbol += char;
                        cleared = false;
                    } else {
                        symbol += char;
                        cleared = false;
                        if (symbol == '--') {//Check if the line is a comment
                            isComment = true;
                        }
                    }
                }
            }
        }

    }
    if (sequence.charAt(i - 1) == "}") {
        oid.number = Number(lastSymbol);
        return {
            returned: new ModuleIdentity(name, lastUpdated, organization, contactInfo, description, revisions, oid),
            lastChar: i - 1//Last position of the pointer
        };
    }
    throw new Error("Cant parse MODULE IDENTITY: " + name);
}

//----------------------------------------------------------------------------------- OBJECT IDENTIFIER -----------------------------------------------------------------------------------

/**
 * Create OBJECT IDENTIFIER Example:
 * 
 * ciscoConfigManMIBObjects  OBJECT IDENTIFIER
 * 
 *       ::= { ciscoConfigManMIB 1 }
 * @param {String} name 
 * @param {{name : String,number : Number}} oid
 */
function ObjectIdentifier(name, oid) {
    this.name = name;
    this.oid = oid;
}
/**
 * OBJECT IDENTIFIER in javascript to MIB:
 * 
 * ciscoConfigManMIBObjects  OBJECT IDENTIFIER
 * 
 *       ::= { ciscoConfigManMIB 1 }
 */
ObjectIdentifier.prototype._toString = function toString() {
    return this.name + " OBJECT IDENTIFIER\n\t::= {" + this.oid.name + " " + this.oid.number + " }\n";
}
/**
 * Converts a OBJECT IDENTIFIER from a MIB String to javascript Object.
 * @param {String} sequence - Sequence of characteres
 * @return {{returned : "ObjectIdentifier",lastChar : Number}}
 * @throws {Error}
 */
function parseObjectIdentifier(sequence) {
    var words = sequence.replace(/[\r\n]+/g, ' ').split(' ');
    var name = "";
    var oid = { 'name': "", 'number': 0 };
    var iniCurly = 0;
    var finCurly = 0;
    for (var i = 1; i < words.length; i++) {
        if (words[i] == '') {
            words.splice(i, 1);
        }
        if (name == "" && words[i] === 'OBJECT' && words[i + 1] === 'IDENTIFIER') {
            name = words[i - 1];
        }
        if (words[i] === '::=') {
            for (var j = i; j < words.length; j++) {
                if (words[j] == '{') {
                    iniCurly = j;
                } else if (words[j] == '}') {
                    finCurly = j;
                }
                if (iniCurly != 0 && finCurly != 0) {
                    break;
                }
            }
            if ((finCurly - iniCurly) >= 2) {
                oid.name = words[iniCurly + 1];
                oid.number = Number(words[iniCurly + 2]);
                return {
                    returned: new ObjectIdentifier(name, oid),
                    lastChar: j
                };
            }
        }
    }
    throw new Error("Cant parse OBJECT IDENTIFIER: " + name);
}


//----------------------------------------------------------------------------------- OBJECT TYPE -----------------------------------------------------------------------------------

function ObjectType(name, syntax, maxAccess, status, description, oid) {
    this.name = name || "";
    this.status = status || "current";
    this.description = description || "";
    this.syntax = syntax;
    this.maxAccess = maxAccess || '';
    this.oid = oid;
}
ObjectType.prototype._toString = function toString() {
    return this.name + " OBJECT-TYPE\n\tSYNTAX\t" + this.syntax + "\n\tMAX-ACCESS\t" + this.maxAccess + "\n\tSTATUS\t" + this.status + "\n\tMAX-ACCESS\t" + this.maxAccess + "\n\tDESCRIPTION\t" + this.description + "::= { " +this.oid.name + " " + this.oid.number + " }\n";
}
/**
 * Parses a character sequence in to a ObjectType object
 * @param {String} sequence 
 * @return {{returned : "ObjectType",lastChar : Number}}
 */
function parseObjectType(sequence) {
    var lastSymbol = "";
    var symbol = "";
    var cleared = false;
    var isString = false;
    var isCurly = false;
    var isParenth = false;
    var isSyntax = false;
    var displayHint = '';
    var name = "";
    var status = "";
    var description = "";
    var syntax = {
        'type': '',
        array: []
    };
    var isComment = false;
    var i;
    for (i = 0; i < sequence.length; i++) {
        var char = sequence.charAt(i);
        if (isString) {
            if (char == '"') {
                isString = false;
                cleared = false;
            } else {
                symbol += char;
            }
        } else if (isComment == true) {
            W
            if (char == '\n') {
                isComment = false;
            }
        } else {
            if (cleared == false && (char == ' ' || char == '\n' || char == '\t')) {
                if (symbol == '::=') {
                    name = lastSymbol;
                } else if (symbol == 'TEXTUAL-CONVENTION') {

                } else if (symbol == 'SYNTAX') {
                    isSyntax = true;
                    syntax = parseSyntax(sequence.slice(i));
                    return {
                        returned: new TextualConvention(name, status, description, syntax, displayHint),
                        lastChar: i
                    };
                } else {
                    switch (lastSymbol) {
                        case 'STATUS':
                            lastUpdated = symbol;
                            break;
                        case 'DISPLAY-HINT':
                            displayHint = symbol;
                            break;
                        case 'DESCRIPTION':
                            description = symbol;
                            break;
                    }
                }
                lastSymbol = symbol;
                symbol = "";
                cleared = true;
            } else {
                if (char != ' ' && char != '\n' && char != '\t') {
                    if (char == '"') {
                        isString = true;
                    } else {
                        symbol += char;
                        cleared = false;
                        if (symbol == '--') {//Check if the line is a comment
                            isComment = true;
                        }
                    }
                }
            }
        }

    }
    if (sequence.charAt(i - 1) == "}") {
        oid.number = Number(lastSymbol);
        return new ModuleIdentity(name, lastUpdated, organization, contactInfo, description, revisions, oid);
    }
    throw new Error("Cant parse MODULE IDENTITY: " + name);
}
//----------------------------------------------------------------------------------- TEXTUAL CONVENTION -----------------------------------------------------------------------------------

function TextualConvention(name, status, description, syntax, displayHint) {
    this.name = name || "";
    this.status = status || "current";
    this.description = description || "";
    this.syntax = syntax;
    this.displayHint = displayHint || '';
}
/**
 * Parses a character sequence in to a TextualConvention object
 * @param {String} sequence 
 * @return {{returned : "TextualConvention",lastChar : Number}}
 */
function parseTextualConvention(sequence) {
    var lastSymbol = "";
    var symbol = "";
    var cleared = false;
    var isString = false;
    var isCurly = false;
    var isParenth = false;
    var isSyntax = false;
    var displayHint = '';
    var name = "";
    var status = "";
    var description = "";
    var syntax = {
        'type': '',
        array: []
    };
    var isComment = false;
    var i;
    for (i = 0; i < sequence.length; i++) {
        var char = sequence.charAt(i);
        if (isString) {
            if (char == '"') {
                isString = false;
                cleared = false;
            } else {
                symbol += char;
            }
        } else if (isComment == true) {
            W
            if (char == '\n') {
                isComment = false;
            }
        } else {
            if (cleared == false && (char == ' ' || char == '\n' || char == '\t')) {
                if (symbol == '::=') {
                    name = lastSymbol;
                } else if (symbol == 'TEXTUAL-CONVENTION') {

                } else if (symbol == 'SYNTAX') {
                    isSyntax = true;
                    syntax = parseSyntax(sequence.slice(i));
                    return {
                        returned: new TextualConvention(name, status, description, syntax, displayHint),
                        lastChar: i
                    };
                } else {
                    switch (lastSymbol) {
                        case 'STATUS':
                            lastUpdated = symbol;
                            break;
                        case 'DISPLAY-HINT':
                            displayHint = symbol;
                            break;
                        case 'DESCRIPTION':
                            description = symbol;
                            break;
                    }
                }
                lastSymbol = symbol;
                symbol = "";
                cleared = true;
            } else {
                if (char != ' ' && char != '\n' && char != '\t') {
                    if (char == '"') {
                        isString = true;
                    } else {
                        symbol += char;
                        cleared = false;
                        if (symbol == '--') {//Check if the line is a comment
                            isComment = true;
                        }
                    }
                }
            }
        }

    }
    if (sequence.charAt(i - 1) == "}") {
        oid.number = Number(lastSymbol);
        return new ModuleIdentity(name, lastUpdated, organization, contactInfo, description, revisions, oid);
    }
    throw new Error("Cant parse MODULE IDENTITY: " + name);
}

//--------------------------------------------------- EXTRAS -----------------------------------------------------

/**
 * For parsing SYNTAX like:
 * 
 * SYNTAX   INTEGER  {
 * 
 *                 erase(1),
 * 
 *                 commandSource(2),
 * 
 *                 running(3),
 * 
 *                 startup(4),
 * 
 *                 local(5),
 * 
 *                 networkTftp(6),
 * 
 *                 networkRcp(7),
 * 
 *                 networkFtp(8),
 * 
 *                 networkScp(9)
 *
 *             }
 * 
 * @param {String} sequence 
 * @return {{returned : {'type' : String, limit : {min : Number, max : Number}, array : [{'name' : String,'position' : Number}]},lastChar : Number}}
 */
function parseSyntax(sequence) {
    var char = '';
    var symbol = '';
    var name = '';
    var hasArray = false;
    var hasLimit = false;
    var checked = false;
    var isComment = false;
    var syntax = {
        'type': ''
    }
    var arrayObject = {};
    for (var i = 0; i < sequence.length; i++) {
        char = sequence.charAt(i);
        //Search for type of Integer Textual Convention
        if (!checked && !hasLimit && char == '{') {
            var name = symbol.replace(/(\t| )/g, '');//Remove \t and spaces
            syntax.type = name;
            hasArray = true;
            syntax.array = [];
            checked = true;
            symbol = '';
        } else if (!checked && !hasArray && char == '(') {
            var name = symbol.replace(/(\t| )/g, '');//Remove \t and spaces
            syntax.type = name;
            hasLimit = true;
            syntax.limit = { 'min': 0, 'max': 65535 };
            checked = true;
            symbol = '';
        } else {
            if (hasLimit) {//Integer with limits
                if (char == '(') {
                    symbol = '';//For removin SIZE
                } else if (char == ')') {
                    var minMax = symbol.split('..');
                    syntax.limit.min = Number(minMax[0]);
                    syntax.limit.max = Number(minMax[1]);
                    return { returned: syntax, 'lastChar': i };
                } else {
                    if (char != ' ' && char != '\n' && char != '\t') {
                        symbol += char;
                    }
                }
            } else if (hasArray) {//Integer Enumeration
                if (char == '(') {
                    arrayObject.name = symbol;
                    symbol = '';
                } else if (char == ')') {
                    arrayObject.position = Number(symbol);
                    syntax.array.push(arrayObject);
                    arrayObject = {};
                    symbol = '';
                } else if (char == ',') {
                    symbol = '';
                } else if (char == '}') {
                    return { returned: syntax, 'lastChar': i };
                } else {
                    if (isComment && char == '\n') {
                        isComment == false;
                        symbol == '';
                    }
                    if (char != ' ' && char != '\n' && char != '\t') {
                        symbol += char;
                        if (symbol == '--') {
                            isComment == true;
                        }
                    }
                }
            } else {
                if (char == '\n' && !checked) {//SYNTAX INTEGER\n
                    return { returned: { type: symbol }, 'lastChar': i };
                }
                if (char != ' ' && char != '\t' && char != '\n') {
                    symbol += char;
                }

            }
        }
    }
}

//----------------------------------------------------------------------------------------- EXPORTS -----------------------------------------------------------------------------------------
exports.parseObjectIdentifier = parseObjectIdentifier;
exports.ObjectIdentifier = ObjectIdentifier;
exports.parseModuleIdentity = parseModuleIdentity;
exports.parseTextualConvention = parseTextualConvention;
exports.parseSyntax = parseSyntax;