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
                //Fehler wird abgefangen
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

app.post("/patient_anlegen_per_daten", function(req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017/Ourdb', async function (error, db) {
        try {
            if (req.body.nachname && req.body.vorname && req.body.email
                && req.body.alter && req.body.geschlecht && req.body.krankheit) {
                var uName = req.body.vname[0].toLowerCase() + req.body.nname;
                var patient_id = uniqid(),
                    patientNew = {
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
                ourdb = db.db('Ourdb');
                await ourdb.patient.insertOne(patientNew);
                req.session.currPatient = patient_id;
                console.log('PATIENT ANLEGEN TEIL 1');
                await res.render('arzt_page', req.session.daten);
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

app.post("/patient_anlegen_vitalparameter", function(req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017/Ourdb', async function (error, db) {
        try {
            if (req.body.gehirndaten && req.body.herzdaten && req.body.lungendaten && req.body.nierendaten) {
                var patient_id = req.session.currPatient;
                ourdb = db.db('Ourdb');
                var pd_update = await {
                    'EEG' : req.body.gehirndaten,
                    'EKG' : req.body.herzdaten,
                    'LVolumen' : req.body.lungendaten,
                    'GGT' : req.body.nierendaten
                };
                await ourdb.patient.update({'patientID': patient_id}, pd_update);
                console.log('PATIENT ANLEGEN TEIL 2');
                await res.render('arzt_page', req.session.daten);
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

 */

app.post("/nutzer_anlegen", function(req, res) {
    MongoClient.connect('mongodb://127.0.0.1:27017/Ourdb', async function (error, db) {
        try {
            ourdb = await db.db('Ourdb');
            if (req.body.nachname && req.body.vorname && req.body.email
                && req.body.alter && req.body.geschlecht && req.body.user) {
                if (req.body.user === 'Admin') {
                    var uName = req.body.vname[0].toLowerCase() + req.body.nname;
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
                    console.log('METI ANGELEGT');
                    await res.render('meti_page', req.session.daten);
                }
                else if (req.body.user === 'Arzt' && req.body.fachbereich) {
                    var uName = req.body.vname[0].toLowerCase() + req.body.nname;
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
                }
            }
            else {
                await res.render('meti_page', req.session.daten);
            }
            await db.close();
        }
        catch (error) {
            throw error;
        }
    });
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

//Handler fuer die login_page
app.get("/login_page", function(req, res) {
    res.sendFile(__dirname + '/secure/login_page.html');
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

app.get("/patient_anlegen_per_daten", function(req, res) {
    res.sendFile(__dirname + '/secure/patient_anlegen_per_daten.html');
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
