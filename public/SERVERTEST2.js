//Modul mongodb wird eingebunden
var MongoClient = require('mongodb').MongoClient;
//Modul crypto wird eingebunden
var crypto = require('crypto');

//Verbinden mit mongodb (Mongodb Server muss laufen!) mittels MongoClient.connect() Callback
//Name der Db = Ourdb
MongoClient.connect('mongodb://127.0.0.1:27017/Ourdb', {useNewUrlParser: true}, function(error, db) {
    //Fehler wird abgefangen
    if (error) {
        throw error;
    }
    //Ausgabe falls Db erstellt
    console.log("Database Ourdb created!");
    //Erstelle Variable zum Zugriff auf Db für spätere Operationen
    var ourdb = db.db("Ourdb");
    //Erstelle Collection "patienten", "arzt" und "meti"
    ourdb.createCollection("patient", function(err, db) {
        console.log("Collection patient erstellt");

        ourdb.createCollection("arzt", function(err, db){
            console.log("Collection arzt erstellt");

            ourdb.createCollection("meti", function(err, db) {
                console.log("Collection meti erstellt");


                var pw = '1234';
                var HASH = crypto.createHash('md5').update(pw).digest('hex');
                var metiNew = {
                    'vname' : 'Gustav',
                    'nname' : 'Peterson',
                    'alter' : 25,
                    'geschlecht' : 'm',
                    'uname' : 'gPeterson',
                    'pwHash' : HASH,
                };
                ourdb.collection('meti').insertOne(metiNew, function (err, db) {
                    db.close();
                    console.log("The end");
                });
            });


        });



    });



    /*
    var patientNeu = {
        'vname' : 'Gustav',
        'nname' : 'Peterson',
        'alter' : 82,
        'geschlecht' : 'm',
        'uname' : 'gPeterson',
        'pwHash' : HASH,
        'krankheit' : null,
        'EEG' : null,
        'EKG' : null,
        'GGT' : null,
        'LVolumen' : null,
        'arztID' : null
    };
    */

});