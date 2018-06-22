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

//Benutze Bodyparser zum Zugriff auf gepostete Daten
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));

/*
    Session wird konfiguriert, mit genid wird eine ID für die jeweilige Session erstellt
 */
app.use(session({
    genid: function(req) {
        return uuid.v1() // use UUIDs for session IDs
    },
    secret: 'blue sky',
    name : 'sessID',
    resave: false,
    saveUninitialized: false
}))

/*
    Callback Funktion fuer Post Anfragen (login_page) des Clients.
    Je nach eingegebenem Username und Passwort wird zu "/meti_page" "/patient_page" oder "arzt_page"
    weitergeleitet.
    Überprüfen des Passworts durch Umwandlung in md5 Hashwert und Vergleichen mit Pw Hashwerten in der Datenbank.
 */
app.post("/login_page", function(req, res) {
    //Pruefe ob alle Felder eingegeben
    //console.log(req.body.uname);
    //console.log(req.body.psw);
    if (req.body.uname && req.body.psw) {
        if (req.session.UID) {
            console.log("Bereits eingeloggt als " + req.session.status);
            res.redirect("/" + req.session.status + "_page");
        }
        else {
            MongoClient.connect('mongodb://127.0.0.1:27017/Ourdb', async function (error, db) {
                //Fehler wird abgefangen
                try {
                    //Erstelle Variable zum Zugriff auf Db für spätere Operationen
                    ourdb = await db.db("Ourdb");
                    //console.log('POSTED');
                    var checkHASH = await String(crypto.createHash('md5').update(req.body.psw).digest('hex'));
                    //console.log(checkHASH);
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
                    //console.log(await ourdb.collection('meti').find({'pwHASH': checkHASH, 'uname': req.body.uname}));
                    if (await meti_count >= 1) {
                        var meti_ID = await ourdb.collection('meti').find({
                            'pwHash': checkHASH,
                            'uname': String(req.body.uname)
                        }).toArray();
                        meti_ID = await meti_ID[0].metiID;
                        req.session.status = 'meti';
                        req.session.UID = meti_ID;
                        await console.log("FUNZT meti");
                        await console.log(req.session);
                        res.redirect('/meti_page');
                    }
                    else if (await patient_count >= 1) {
                        var patient_ID = await ourdb.collection('patient').find({
                            'pwHash': checkHASH,
                            'uname': String(req.body.uname)
                        }).toArray();
                        patient_ID = await patient_ID[0].patientID;
                        req.session.status = 'patient';
                        req.session.UID = patient_ID;
                        await console.log('FUNZT patient');
                        await console.log(req.session);
                        res.redirect('/patient_page');
                    }
                    else if (await arzt_count >= 1) {
                        var arzt_ID = await ourdb.collection('arzt').find({
                            'pwHash': checkHASH,
                            'uname': String(req.body.uname)
                        }).toArray();
                        arzt_ID = await arzt_ID[0].arztID;
                        req.session.status = 'arzt';
                        req.session.UID = arzt_ID;
                        await console.log('FUNZT patient');
                        await console.log(req.session);
                        res.redirect('/arzt_page');
                    }
                    else {
                        await res.redirect('back');
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
app.all("/secure/*", function(req, res, next) {

});
*/

app.get("/", function(req, res) {
    if (req.session.views) {
        req.session.views++
    } else {
        req.session.views = 1
    }
    res.sendFile(__dirname + '/index.html');
    console.log('Verbunden');
});

app.get("/login_page", function(req, res) {
    res.sendFile(__dirname + '/secure/login_page.html');
    console.log('Verbunden');
});

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

app.get("/ausloggen", function(req, res) {
    res.sendFile(__dirname + '/secure/ausloggen.html');
    console.log('Verbunden');
});

app.get("/beschwerde", function(req, res) {
    res.sendFile(__dirname + '/secure/beschwerde.html');
    console.log('Verbunden');
});

app.get("/konto_aktivieren", function(req, res) {
    res.sendFile(__dirname + '/secure/arzt_page.html');
    console.log('Verbunden');
});

//Statische Dateien bei Aufrufen von patienten übergeben.
app.use(express.static(__dirname));

/*
	Server beantwortet Anfragen auf Port 8080 und mit der Konsole wird ""Listening on port 8080" ausgegeben.
 */
app.listen(8080, function() {
    console.log("Listening on port 8080");
});
