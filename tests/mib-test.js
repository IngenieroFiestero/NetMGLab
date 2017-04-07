const assert = require('assert');
var fs = require("fs");
var smi = require("../lib/smi");
/*
var sequence = 'ciscoConfigManMIBObjects  OBJECT IDENTIFIER ::= { ciscoConfigManMIB 1 }';
console.log(smi.parseObjectIdentifier(sequence));
var sequence2 = `ciscoConfigManMIB MODULE-IDENTITY
    LAST-UPDATED    "200704270000Z"
    ORGANIZATION    "Cisco Systems, Inc."
    CONTACT-INFO
            "Cisco Systems
            Customer Service


            Postal: 170 W Tasman Drive
            San Jose, CA  95134
            USA

            Tel: +1 800 553-NETS

            E-mail: cs-snmp@cisco.com"
    DESCRIPTION
            "Configuration management MIB.

            The MIB represents a model of configuration data that
            exists in various locations:

            running       in use by the running system
            terminal      saved to whatever is attached as the terminal        
            local         saved locally in NVRAM or flash
            remote        saved to some server on the network

            Although some of the system functions that relate here
            can be used for general file storage and transfer, this
            MIB intends to include only such operations as clearly
            relate to configuration.  Its primary emphasis is to
            track changes and saves of the running configuration.

            As saved data moves further from startup use, such as
            into different local flash files or onto the network,
            tracking becomes difficult to impossible, so the MIB's
            interest and functions are confined in that area.

            Information from ccmCLIHistoryCommandTable can be used
            to track the exact configuration changes that took
            place within a particular Configuration History
            event. NMS' can use this information to update 
            the related components. 
            For example:
                If commands related only to MPLS are entered
                then the NMS need to update only the MPLS related
                management information rather than updating
                all of its management information.
                Acronyms and terms:

                CLI   Command Line Interface."
                
    REVISION        "200704270000Z"
    DESCRIPTION
        "Changes to definition of terminal as an output
        location."
                
    REVISION        "200608170000Z"
    DESCRIPTION
            "Added a new group of objects to store the information
            related to the Config Change Tracking ID (CTID) feature. 

            CTID will provide a version number that is unique for 
            version-incrementing changes to the IOS
            running-configuration. It will also provide information
            about when CTID last changed.

            Added scalars: 
            * ccmCTID
            * ccmCTIDLastChangeTime
            * ccmCTIDWhoChanged
            * ccmCTIDRolledOverNotifEnable

            Added Notification:
            * ccmCTIDRolledOver

            Added Object Group:
            * ciscoConfigManCTIDObjectGroup

            Added Notification Group:
            * ciscoConfigManCTIDNotifyGroup

            Added Compliance:
            ciscoConfigManMIBComplianceRev4"
    REVISION        "200406180000Z"
    DESCRIPTION
            "The Objects ccmHistoryEventCommandSourceAddress and
            ccmHistoryEventServerAddress are deprecated since
            they support only IPv4 address. These objects have
            been replaced by two new objects 
            ccmHistoryEventCommandSourceAddrRev1 and 
            ccmHistoryEventServerAddrRev1. In addition to these
            objects two more new objects are defined
            ccmHistoryEventCommandSourceAddrType and
            ccmHistoryEventServerAddrType"
    REVISION        "200206070000Z"
    DESCRIPTION
            "Added new enumerations networkFtp(8) and
            networkScp(9) to HistoryEventMedium."
    REVISION        "200203120000Z"
    DESCRIPTION
            "Added ccmCLIHistoryCommandTable for
            storing the CLI commands that took effect during
            a configuration event.

            Added scalars ccmCLIHistoryMaxCmdEntries
            ccmCLIHistoryCmdEntries and 
            ccmCLIHistoryCmdEntriesAllowed.

            Added ccmHistoryCLICmdEntriesBumped to 
            ccmHistoryEventTable to store the number of
            corresponding bumped entries in the 
            ccmCLIHistoryCommandTable.

            Added the ccmCLIRunningConfigChanged notification.
            Added ccmCLICfgRunConfNotifEnable to control the
            ccmCLIRunningConfigChanged notification.

            Added notification group 
            ciscoConfigManHistNotifyGroup.

            Updated the MIB description to indicate the use of
            the above additions."
    REVISION        "9511280000Z"
    DESCRIPTION
            "Initial version of this MIB module."
          ::= { ciscoMgmt 43 }`;
var myJson = smi.parseModuleIdentity(sequence2);
console.log(myJson);
fs.writeFile( "filename.json", JSON.stringify( myJson.returned ), "utf8", ()=>{
} );

var sequence3 = `InterfaceIndex ::= TEXTUAL-CONVENTION
    DISPLAY-HINT "d"
    STATUS       current
    DESCRIPTION
            "A unique value, greater than zero, for each interface or
            interface sub-layer in the managed system.  It is
            recommended that values are assigned contiguously starting
            from 1.  The value for each interface sub-layer must remain
            constant at least from one re-initialization of the entity's
            network management system to the next re-initialization."
    SYNTAX       Integer32 (1..2147483647)`;
var textualConvention = smi.parseTextualConvention(sequence3);
console.log(textualConvention);
fs.writeFile( "textualConvention.json", JSON.stringify( textualConvention.returned ), "utf8", ()=>{

} );

console.log(smi.parseSyntax(' HistoryEventMedium\n'));
*/
//-------------------------------- SYNTAX TEST ---------------------------------------
var syntaxResults = require('./syntax-test.json');
for(var i = 0;i < syntaxResults.textSequence.length; i++){
    assert.deepEqual(smi.parseSyntax(syntaxResults.textSequence[i]).returned, syntaxResults.results[i].returned,'Error in SYNTAX test: ' + syntaxResults.textSequence[i]);
}

//-------------------------------- OBJECT TYPE TEST ---------------------------------------
syntaxResults = require('./object-type-test.json');
for(var i = 0;i < syntaxResults.textSequence.length; i++){
    assert.deepEqual(smi.parseObjectType(syntaxResults.textSequence[i]).returned, syntaxResults.results[i].returned,'Error in OBJECT TYPE test: ' + syntaxResults.textSequence[i]);
}