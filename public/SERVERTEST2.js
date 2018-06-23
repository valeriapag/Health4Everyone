//Modul mongodb wird eingebunden
var MongoClient = require('mongodb').MongoClient;
//Modul crypto wird eingebunden
var crypto = require('crypto');
//Modul uniqid wird eingebunden
var uniqid = require('uniqid');

//Verbinden mit mongodb (Mongodb Server muss laufen!) mittels MongoClient.connect() Callback
//Name der Db = Ourdb
MongoClient.connect('mongodb://127.0.0.1:27017/Ourdb', function(error, db) {

    //Fehler wird abgefangen
    if (error) {
        throw error;
    }
    //Ausgabe falls Db erstellt
    console.log("Database Ourdb created!");
    //Erstelle Variable zum Zugriff auf Db für spätere Operationen
    var ourdb = db.db("Ourdb");
    //Erstelle Collection "patienten", "arzt" und "meti"
    ourdb.createCollection("patient", function(err, collection) {

        console.log("Collection patient erstellt");

        ourdb.createCollection("arzt", function (err, collection) {
            console.log("Collection arzt erstellt");

            ourdb.createCollection("meti", function (err, collection) {
                console.log("Collection meti erstellt");

                ourdb.createCollection("beschwerde", function (err, collection) {
                    console.log('Collection beschwerde erstellt');

                    ourdb.createCollection("Aktivierung", function (err, collection) {
                        console.log('Collection Aktivierung erstellt');

                        var pw = '1234', HASH = crypto.createHash('md5').update(pw).digest('hex'), meti_id = uniqid(),
                            metiNew = {
                                'metiID': meti_id,
                                'vname': 'Gustav',
                                'nname': 'Peterson',
                                'alter': 25,
                                'geschlecht': 'm',
                                'email' : null,
                                'uname': 'gPeterson',
                                'pwHash': HASH
                            };
                        ourdb.collection('meti').insertOne(metiNew, function (err, result) {

                            var patient_id = uniqid(), pw = '2345',
                                HASH = crypto.createHash('md5').update(pw).digest('hex'),
                                patientNew = {
                                    'patientID': patient_id,
                                    'vname': 'Max',
                                    'nname': 'Brot',
                                    'alter': 30,
                                    'geschlecht': 'm',
                                    'email' : null,
                                    'uname': 'mBrot',
                                    'pwHash': HASH,
                                    'krankheit': null,
                                    'EEG': null,
                                    'EKG': null,
                                    'GGT': null,
                                    'LVolumen': null,
                                    'arztID': null,
                                    'beschwerdeID' : null
                                };
                            ourdb.collection('patient').insertOne(patientNew, function (err, result) {

                                var arzt_id = uniqid(), pw = '3456',
                                    HASH = crypto.createHash('md5').update(pw).digest('hex'),
                                    arztNew = {
                                        'arztID': arzt_id,
                                        'vname': 'Boris',
                                        'nname': 'Bwah',
                                        'alter': 30,
                                        'geschlecht': 'm',
                                        'email' : null,
                                        'fachbereich': 'Neurologie',
                                        'uname': 'bBwah',
                                        'pwHash': HASH
                                    };
                                ourdb.collection('arzt').insertOne(arztNew, function (err, result) {

                                    var patient_id = uniqid(), aktivPW = uniqid(),
                                        aktNew = {
                                            'patientID' : patient_id,
                                            'arztID' : null,
                                            'aktPW' : aktivPW
                                        };
                                    console.log(aktivPW);

                                    ourdb.collection('aktivierung').insertOne(aktNew, function (err, result) {

                                        db.close();
                                        console.log('The end');
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});