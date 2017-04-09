module.exports = {
    http : {

    },
    ws : {
        port : 8080
    },
    db : {
        uri : "mongodb://localhost/netmglab",
        options : {
            db: { native_parser: true },
            server: { 
                poolSize: 5,
                reconnectTries: 5
            },
            replset: { rs_name: 'myReplicaSetName' },
            user: 'myUserName',
            pass: 'myPassword'
        }
    }
}