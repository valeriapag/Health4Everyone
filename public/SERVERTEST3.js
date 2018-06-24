//Modul Express wird eingebunden
var express = require("express");
//Modul Handlebars für Express wird eingebunden
var hbs = require("express-handlebars");
//app wird für Konfiguration des Servers verwendet
var app = express();
//Modul mongodb wird eingebunden
var MongoClient = require('mongodb').MongoClient;
//Modul crypto wird eingebunden
var crypto = require('crypto');
//Modul Bodyparser wird eingebunden
var bodyparser = require('body-parser');
//Modul Express-session wird eingebunden
var session = require('express-session');
//Modul uuid wird eingebunden
var uuid = require('uuid');
//Modul uniqid wird eingebunden
var uniqid = require('uniqid');

//Benutze Bodyparser zum Zugriff auf gepostete Daten
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));

/*
	- View Engine wird angelegt, mit ihr wird festgelegt, was vom Client angefordert werden kann/sichtbar ist
	- "hbs" steht für Handlebars bzw. die Datei-Endung "hbs".
 */
//Views Pfad für die View Engine
app.set("views", __dirname + "/views");
//Kofigurieren der View Engine, Datei-Endung 'hbs'
app.engine('.hbs', hbs({extname: '.hbs'}));
//"hbs" wird als View Engine festgelegt
app.set("view engine", "hbs");

/*
    Session wird konfiguriert, mit genid wird eine ID für die jeweilige Session erstellt
    uuid wird fuer einzigartige IDs verwendet
 */
app.use(session({
    genid: function(req) {
        return uuid.v1()
    },
    secret: 'blue sky',
    name : 'sessID',
    resave: false,
    saveUninitialized: false
}));

/*
    Callback Funktion fuer Post Anfragen (login_page) des Clients.
    - Je nach eingegebenem Username und Passwort wird zu "/meti_page" "/patient_page" oder "arzt_page"
    weitergeleitet.
    - Überprüfen des Passworts durch Umwandlung in md5 Hashwert und Vergleichen mit Pw Hashwerten in der Datenbank.
    - Bereits eingeloggte Benutzer werden auf ihre Seite weitergeleitet
 */
app.post("/login_page", function(req, res) {
    //Pruefe ob alle Felder eingegeben
    /*
        Pruefe ob bereits angemeldet -> wenn ja : leite zu entsprechender Seite weiter
        wenn nein : Starte Login-Vorgang
     */
    if (req.body.uname && req.body.psw) {
        if (req.session.UID != null) {
            console.log("Bereits eingeloggt als " + req.session.status);
            res.render(req.session.status + "_page", req.session.daten);
        }
        else {
            MongoClient.connect('mongodb://127.0.0.1:27017/Ourdb', async function (error, db) {
                //Fehler wird abgefangen (z.B.: Rejected Promise)
                try {
                    //Erstelle Variable zum Zugriff auf Db für spätere Operationen
                    ourdb = await db.db("Ourdb");
                    //Erstelle Hashwert von eingegebenem Passwort
                    var checkHASH = await String(crypto.createHash('md5').update(req.body.psw).digest('hex'));
                    //Pruefe ob Passwort und Username in Datenbank
                    var meti_count = await ourdb.collection('meti').find({
                        'pwHash': checkHASH,
                        'uname': String(req.body.uname)
                    }).count();
                    var patient_count = await ourdb.collection('patient').find({
                        'pwHash': checkHASH,
                        'uname': String(req.body.uname)
                    }).count();
                    var arzt_count = await ourdb.collection('arzt').find({
                        'pwHash': checkHASH,
                        'uname': String(req.body.uname)
                    }).count();
                    //Logge ein als Meti
                    if (await meti_count >= 1) {
                        var meti_ID = await ourdb.collection('meti').find({
                            'pwHash': checkHASH,
                            'uname': String(req.body.uname)
                        }).toArray();
                        //Hole Daten fuer Handlebars Template
                        var meti_daten = await {
                            'vname' : meti_ID[0].vname,
                            'nname' : meti_ID[0].nname
                        };
                        meti_ID = await meti_ID[0].metiID;
                        //Schreibe Status 'meti' und User ID in session des Users
                        req.session.status = 'meti';
                        req.session.UID = meti_ID;
                        req.session.daten = meti_daten;
                        await console.log("FUNZT meti");
                        await console.log(req.session);
                        //Rendere spezifische Seite fuer den Meti
                        await res.render('meti_page', meti_daten);
                    }
                    /*
                        Logge als Patient ein
                        Selbe Art wie bei Meti (allerdings wird noch zusaetzlich patientID
                        fuer das Template aus der Datenbank geholt).
                    */
                    else if (await patient_count >= 1) {
                        var patient_ID = await ourdb.collection('patient').find({
                            'pwHash': checkHASH,
                            'uname': String(req.body.uname)
                        }).toArray();
                        var patient_daten = await {
                            'vname' : patient_ID[0].vname,
                            'nname' : patient_ID[0].nname,
                            'patientID' : patient_ID[0].patientID
                        };
                        patient_ID = await patient_ID[0].patientID;
                        req.session.status = 'patient';
                        req.session.UID = patient_ID;
                        req.session.daten = patient_daten;
                        await console.log('FUNZT patient');
                        await console.log(req.session);
                        await res.render('patient_page', patient_daten);
                    }
                    /*
                        Logge als Arzt ein
                        Selbe Art wie bei Meti (Es wird noch zusaetzlich fachbereich
                        aus der Datenbank geholt).
                    */
                    else if (await arzt_count >= 1) {
                        var arzt_ID = await ourdb.collection('arzt').find({
                            'pwHash': checkHASH,
                            'uname': String(req.body.uname)
                        }).toArray();
                        var arzt_daten = await {
                            'vname' : arzt_ID[0].vname,
                            'nname' : arzt_ID[0].nname,
                            'fachbereich' : arzt_ID[0].fachbereich
                        };
                        arzt_ID = await arzt_ID[0].arztID;
                        req.session.status = 'arzt';
                        req.session.UID = arzt_ID;
                        req.session.daten = arzt_daten;
                        await console.log('FUNZT patient');
                        await console.log(req.session);
                        res.render('arzt_page', arzt_daten);
                    }
                    else {
                        await res.redirect('/');
                    }
                    await db.close();
                }
                catch (error) {
                    throw await error;
                }
            });
        }
    }
});

/*
    Handler fuer Post Anfrage beim Anlegen eines Patienten
    - Wenn alle Felder angegeben -> Lege Patient mit den Werten an, leite zu /patient_anlegen_vitalparameter weiter
    und speichere die patientID in der Session des Arztes
    - Wenn nicht alle Felder angegeben -> Leite zur arzt_page zurueck
 */
app.post("/patient_anlegen_per_daten", function(req, res) {
    //Stelle Verbindung mit Mongodb her
    MongoClient.connect('mongodb://127.0.0.1:27017/Ourdb', async function (error, db) {
        try {
            ourdb = await db.db("Ourdb");
            if (req.body.nachname && req.body.vorname && req.body.email
                && req.body.alter && req.body.geschlecht && req.body.krankheit) {
                var uName = await req.body.vorname.charAt(0).toLowerCase() + req.body.nachname;
                var patient_id = await uniqid(),
                    patientNew = await {
                        'patientID': patient_id,
                        'vname': req.body.vorname,
                        'nname': req.body.nachname,
                        'alter': req.body.alter,
                        'geschlecht': req.body.geschlecht,
                        'email' : req.body.email,
                        'uname': uName,
                        'pwHash': null,
                        'krankheit': req.body.krankheit,
                        'EEG': null,
                        'EKG': null,
                        'GGT': null,
                        'LVolumen': null,
                        'arztID': req.session.UID,
                        'beschwerdeID': null
                    };
                await ourdb.collection('patient').insertOne(patientNew, function(err, result) {
                    console.log("Patient angelegt durch Arzt");
                });
                req.session.currPatient = patient_id;
                console.log('PATIENT ANLEGEN TEIL 1');
                await res.redirect('patient_anlegen_vitalparameter');
            }
            else {
                await res.render('arzt_page', req.session.daten);
            }
            await db.close();
        }
        catch (error) {
            throw error;
        }
    });
});

/*
    Zweiter Teil (Post Handler) beim Anlegen eines Patienten, nach /patient_anlegen_per_daten.
    - Wenn alle Vitalwerte angegeben -> speichere Patient mit patientID aus der Session und setze die gespeicherte
    patientID bei der Session auf null.
    - Wenn nicht alle Werte angegeben -> lösche Patient und setze die patientID in der Session wieder auf null. Leite
    dann zur arzt_page zurueck.
 */
app.post("/patient_anlegen_vitalparameter", function(req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017/Ourdb', async function (error, db) {
        //Fange Fehler (z.B.: Rejected Promise) ab
        try {
            ourdb = await db.db('Ourdb');
            var patient_id = req.session.currPatient;
            if (req.body.gehirndaten && req.body.herzdaten && req.body.lungendaten && req.body.nierendaten) {
                var pd_update = await {
                    'EEG' : req.body.gehirndaten,
                    'EKG' : req.body.herzdaten,
                    'LVolumen' : req.body.lungendaten,
                    'GGT' : req.body.nierendaten
                };
                await ourdb.collection('patient').update({'patientID': patient_id}, {$set: pd_update});
                req.session.currPatient = await null;
                console.log('PATIENT ANLEGEN TEIL 2');
                await res.render('arzt_page', req.session.daten);
            }
            else {
                await ourdb.collection('patient').deleteOne({'patientID' : patient_id}, function(err, result) {

                });
                req.session.currPatient = await null;
                console.log('Patient wieder gelöscht');
                await res.render('arzt_page', req.session.daten);
            }
            //Schliesse Verbindung zur Datenbank
            await db.close();
        }
        catch (error) {
            throw error;
        }
    });
});

/*
    Handler fuer die Post Anfrage zum Nutzer anlegen (vom Meti ausgefuehrt)
    - Wenn alle Felder ausgefuellt (fachbereich muss nur bei Anlegen eines Arztes ausgefuellt sein)
    -> Pruefe ob Admin oder Arzt als Usertyp ausgewaehlt wurde und speichere die Werte dann in der Datenbank
    - Wenn nicht alle Felder ausgefuellt -> Redirect zurueck zur meti_page ohne Speichern des Nutzers
 */
app.post("/nutzer_anlegen", function(req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017/Ourdb', async function (error, db) {
        try {
            ourdb = await db.db('Ourdb');
            if (req.body.nname && req.body.vname && req.body.email
                && req.body.alter && req.body.geschlecht && req.body.user) {
                var uName = req.body.vname.charAt(0).toLowerCase() + req.body.nname;
                if (req.body.user === 'Admin') {
                    var meti_id = uniqid(),
                        metiNew = {
                            'metiID': meti_id,
                            'vname': req.body.vname,
                            'nname': req.body.nname,
                            'alter': req.body.alter,
                            'geschlecht': req.body.geschlecht,
                            'email': req.body.email,
                            'uname': uName,
                            'pwHash': null
                        };
                    ourdb.collection('meti').insertOne(metiNew);
                    console.log('METI ANGELEGT');
                    await res.render('meti_page', req.session.daten);
                }
                else if (req.body.user === 'Arzt' && req.body.fachbereich) {
                    var arzt = uniqid(),
                        arztNew = {
                            'arztID': arzt_id,
                            'vname': req.body.vname,
                            'nname': req.body.nname,
                            'alter': req.body.alter,
                            'geschlecht': req.body.geschlecht,
                            'email' : req.body.email,
                            'fachbereich': req.body.fachbereich,
                            'uname': uName,
                            'pwHash': null
                        };
                    ourdb.collection('arzt').insertOne(arztNew);
                    console.log('ARZT ANGELEGT');
                    await res.render('meti_page', req.session.daten);
                }
            }
            else {
                await res.render('meti_page', req.session.daten);
            }
            //Schliesse Verbindung zur Datenbank
            await db.close();
        }
        catch (error) {
            throw error;
        }
    });
});

/*
    Post Handler fuer Anfragen zum Suchen eines Patienten (durch den Meti)
    - Wenn alle Werte angegeben -> leite weiter zur Patientenakte
    - Wenn nicht -> leite zurueck zur arzt_page
 */
app.post("/patientenakte_suchen", function(req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017/Ourdb', async function (error, db) {
        //Fange Fehler (z.B.: Rejected Promise) ab
        try {
            ourdb = await db.db('Ourdb');
            if (req.body.vname && req.body.nname && req.body.alter) {
                var search = await {
                    'vname' : req.body.vname,
                    'nname' : req.body.nname,
                    'alter' : req.body.alter
                };
                var patientFound = await ourdb.collection('patient').find(search).toArray();
                patientFound = patientFound[0];
                console.log(patientFound);
                console.log('PATIENT GESUCHT');
                await res.render('patientenakte', patientFound);
            }
            else {
                console.log('PATIENT NICHT GESUCHT');
                await res.render('arzt_page', req.session.daten);
            }
            //Schliesse Verbindung zur Datenbank
            await db.close();
        }
        catch (error) {
            throw error;
        }
    });
});

/*
    Post Handler fuer Anfragen zur Kontoaktivierung
    - Wenn alle Werte angegeben -> leite weiter zur Patientenakte
    - Wenn nicht -> leite zurueck zur arzt_page
 */
app.post("/konto_aktivieren", function(req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017/Ourdb', async function (error, db) {
        //Fange Fehler (z.B.: Rejected Promise) ab
        try {
            ourdb = await db.db('Ourdb');
            if (req.body.name && req.body.pass) {
                console.log(req.body.name + ' ' + req.body.pass);
                var search = {
                    'uname' : String(req.body.name),
                    'aktPW' : String(req.body.pass)
                };
                var aktivierungDoc = await ourdb.collection('aktivierung').find({
                    'uname' : String(req.body.name),
                    'aktPW' : String(req.body.pass)
                }).toArray();
                aktivierungDoc = aktivierungDoc.length;
                if (await aktivierungDoc >= 1) {
                    console.log('Starte Aktivierungsvorgang');
                    var countPatient = await ourdb.collection('patient').find(
                        { 'uname' : req.body.name }).count();
                    //var countPatient = patient.count();
                    var countMeti = await ourdb.collection('meti').find(
                        { 'uname' : req.body.name }).count();
                    //var countMeti = meti.count();
                    var countArzt = await ourdb.collection('arzt').find(
                        { 'uname' : req.body.name }).count();
                    //var countArzt = arzt.count();
                    if (countPatient >= 1) {
                        var patient = await ourdb.collection('patient').find(
                            { 'uname' : req.body.name }).toArray();
                        patient = patient[0];
                        req.session.currAkt = patient.patientID;
                        req.session.statusAkt = 'patient';
                        await res.redirect('/passwort_anlegen');
                    }
                    else if (countMeti >= 1) {
                        var meti = await ourdb.collection('meti').find(
                            { 'uname' : req.body.name }).toArray();
                        console.log('Aktiviere als meti');
                        meti = meti[0];
                        req.session.currAkt = meti.metiID;
                        req.session.statusAkt = 'meti';
                        await res.redirect('/passwort_anlegen');
                    }
                    else if (countArzt >= 1) {
                        var arzt = await ourdb.collection('arzt').find(
                            { 'uname' : req.body.name }).toArray();
                        arzt = arzt[0];
                        req.session.currAkt = arzt.arztID;
                        req.session.statusAkt = 'arzt';
                        await res.redirect('/passwort_anlegen');
                    }
                }
                else {
                    console.log('AKTIVIERUNG NICHT GEFUNDEN')
                    await res.redirect('/');
                }
            }
            else {
                console.log('NICHT GENUG DATEN FUER AKTIVIERUNG');
                await res.redirect('/');
            }
            //Schliesse Verbindung zur Datenbank
            await db.close();
        }
        catch (error) {
            throw error;
        }
    });
});

/*
    Post Handler fuer Anfragen zum Suchen eines Patienten (durch den Meti)
    - Wenn alle Werte angegeben -> leite weiter zur Patientenakte
    - Wenn nicht -> leite zurueck zur arzt_page
 */
app.post("/passwort_anlegen", function(req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017/Ourdb', async function (error, db) {
        //Fange Fehler (z.B.: Rejected Promise) ab
        try {
            ourdb = await db.db('Ourdb');
            if (req.body.pass_vergeben && req.body.repeat_pass) {
                if (req.body.pass_vergeben == req.body.repeat_pass) {
                    var idType = await String(req.session.statusAkt) + 'ID';
                    var id = String(req.session.currAkt);
                    var query;
                    switch(idType) {
                        case 'metiID':
                            query = {
                                'metiID' : id
                            };
                            break;
                        case 'arztID':
                            query = {
                                'metiID' : id
                            };
                            break;
                        case 'patientID':
                            query = {
                                'patientID' : id
                            };
                            break;
                    }

                    var pwHASH = await String(crypto.createHash('md5').update(String(req.body.pass_vergeben)).digest('hex'));
                    await ourdb.collection(String(req.session.statusAkt)).update(query,
                        {$set : {'pwHash' : pwHASH}}, function(err, result) {
                            console.log(pwHASH);
                        });
                    req.session.statusAkt = await null;
                    req.session.currAkt = await null;
                    await res.redirect('/login_page');
                }
                else {
                    console.log('PASSWOERTER STIMMEN NICHT UEBEREIN');
                    await res.redirect('/');
                }
            }
            else {
                console.log('PASSWORTFELDER NICHT AUSGEFUELLT');
                await res.redirect('/');
            }
            //Schliesse Verbindung zur Datenbank
            await db.close();
        }
        catch (error) {
            throw error;
        }
    });
});

/*
    Handler fuer ein GET request auf die konto_aktivieren Seite
 */
app.get("/konto_aktivieren", function(req, res) {
    res.sendFile(__dirname + '/secure/konto_aktivieren.html');
    console.log('Verbunden');
});

/*
    Handler fuer ein GET request auf die passwort_anlegen Seite
 */
app.get("/passwort_anlegen", function(req, res) {
    res.sendFile(__dirname + '/secure/passwort_anlegen.html');
    console.log('Verbunden');
});

/*
    Handler fuer ein GET request auf die Homepage '/'
    -> Sende index.html und zaehle views der session
*/
app.get("/", function(req, res) {
    if (req.session.views) {
        req.session.views++;
    } else {
        req.session.views = 1;
    }
    res.sendFile(__dirname + '/index.html');
    console.log('Verbunden');
});

//Handler fuer GET Anfrage der login_page
app.get("/login_page", function(req, res) {
    res.sendFile(__dirname + '/secure/login_page.html');
    console.log('Verbunden');
});

//Handler fuer GET Anfrage der Seite zum Suchen von Patientenakten (durch den Arzt)
app.get("/patientenakte_suchen", function(req, res) {
    res.sendFile(__dirname + '/secure/patientenakte_suchen.html');
    console.log('Verbunden');
});

//Handler fuer GET Anfrage der Seite zum Suchen von Patientenakten (durch den Arzt)
app.get("/arzt_page", function(req, res) {
    res.render('arzt_page', req.session.daten);
    console.log('Verbunden');
});

/*
app.get("/meti_page", function(req, res) {
    res.sendFile(__dirname + '/secure/meti_page.html');
    console.log('Verbunden');
});

app.get("/patient_page", function(req, res) {
    res.sendFile(__dirname + '/secure/patient_page.html');
    console.log('Verbunden');
});

app.get("/arzt_page", function(req, res) {
    res.sendFile(__dirname + '/secure/arzt_page.html');
    console.log('Verbunden');
});
*/

//Handler fuer die ausloggen Seite
//-> Setzt status und User ID der Session auf null und sendet ausloggen.html
app.get("/ausloggen", function(req, res) {
    req.session.status = null;
    req.session.UID = null;
    res.sendFile(__dirname + '/secure/ausloggen.html');
    console.log('Verbunden');
});

//Handler fuer die Seiten zum Anlegen von Nutzern

app.get("/patient_anlegen_per_daten", function(req, res) {
    res.sendFile(__dirname + '/secure/patient_anlegen_per_daten.html');
    console.log('Verbunden');
});

app.get("/patient_anlegen_vitalparameter", function(req, res) {
    res.sendFile(__dirname + '/secure/patient_anlegen_vitalparameter.html');
    console.log('Verbunden');
});

app.get("/nutzer_anlegen", function(req, res) {
    res.sendFile(__dirname + '/secure/nutzer_anlegen.html');
    console.log('Verbunden');
});

/*
app.get("/beschwerde", function(req, res) {
    res.sendFile(__dirname + '/secure/beschwerde.html');
    console.log('Verbunden');
});

app.get("/konto_aktivieren", function(req, res) {
    res.sendFile(__dirname + '/secure/arzt_page.html');
    console.log('Verbunden');
});
*/

//Statische Dateien bei Aufrufen von patienten übergeben.
app.use(express.static(__dirname));

/*
	Server beantwortet Anfragen auf Port 8080 und mit der Konsole wird ""Listening on port 8080" ausgegeben.
 */
app.listen(8080, function() {
    console.log("Listening on port 8080");
});
