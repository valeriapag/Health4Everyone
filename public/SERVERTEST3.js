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
//Modul Bodyparser
var bodyparser = require('body-parser');

//Benutze Bodyparser zum Zugriff auf gepostete Daten
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));

/*
    Callback Funktion fuer Post Anfragen (login_page) des Clients.
    Je nach eingegebenem Username und Passwort wird zu "/informatiker_page" "/patient_page" oder "arzt_page"
    weitergeleitet.
    Überprüfen des Passworts durch Umwandlung in md5 Hashwert und Vergleichen mit Hashwerten in der Datenbank.
 */
app.post("/login_page", function(req, res) {
    //Pruefe ob alle Felder eingegeben
    //console.log(req.body.uname);
    //console.log(req.body.psw);
    var logged_in = 0;
    if (req.body.uname && req.body.psw) {
        MongoClient.connect('mongodb://127.0.0.1:27017/Ourdb', {useNewUrlParser: true}, async function (error, db) {
            //Fehler wird abgefangen
            try {
                //Erstelle Variable zum Zugriff auf Db für spätere Operationen
                ourdb = await db.db("Ourdb");
                //console.log('POSTED');
                var checkHASH = await String(crypto.createHash('md5').update(req.body.psw).digest('hex'));
                //console.log(checkHASH);
                var meti_count = await ourdb.collection('meti').find({'pwHash': checkHASH, 'uname': String(req.body.uname)}).count();
                var patient_count = await ourdb.collection('patient').find({'pwHash': checkHASH, 'uname': String(req.body.uname)}).count();
                var arzt_count = await ourdb.collection('arzt').find({'pwHash': checkHASH, 'uname': String(req.body.uname)}).count();
                //console.log(await ourdb.collection('meti').find({'pwHASH': checkHASH, 'uname': req.body.uname}));
                if (await meti_count >= 1) {
                    await console.log('FUNZT meti');
                    res.redirect('/informatiker_page');
                }
                else if (await patient_count >= 1) {
                    await console.log('FUNZT patient');
                    res.redirect('/patient_page');
                }
                else if (await arzt_count >= 1) {
                    await console.log('FUNZT arzt');
                    res.redirect('/arzt_page');
                }
                else {
                    await res.redirect('back');
                }
                await db.close();
            }
            catch (error) {
                throw error;
            }
        });
    }
});

app.get("/", function(req, res) {
    res.sendFile(__dirname + '/index.html');
    console.log('Verbunden');
});

app.get("/login_page", function(req, res) {
    res.sendFile(__dirname + '/login_page.html');
    console.log('Verbunden');
});

app.get("/informatiker_page", function(req, res) {
    res.sendFile(__dirname + '/informatiker_page.html');
    console.log('Verbunden');
});

app.get("/patient_page", function(req, res) {
    res.sendFile(__dirname + '/patient_page.html');
    console.log('Verbunden');
});

app.get("/arzt_page", function(req, res) {
    res.sendFile(__dirname + '/arzt_page.html');
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
