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
    Callback Funktion fuer Post Anfragen des Clients
 */
/*
app.post("/login_page", function(req, res) {
    //Pruefe ob alle Felder eingegeben
    //console.log(req.body.uname);
    //console.log(req.body.psw);
    if (req.body.uname && req.body.psw) {
        (MongoClient.connect('mongodb://127.0.0.1:27017/Ourdb', {useNewUrlParser: true}, function(error, db) {
            //Fehler wird abgefangen
            if (error) {
                throw error;
            }
            //Erstelle Variable zum Zugriff auf Db für spätere Operationen
            ourdb = db.db("Ourdb");
            console.log('POSTED');
            var checkHASH = crypto.createHash('md5').update(req.body.psw).digest('hex');
            console.log(ourdb.collection('meti').find({'pwHASH' : checkHASH, 'uname' : req.body.uname}).count());
            if (ourdb.collection('meti').find({'pwHASH' : checkHASH, 'uname' : req.body.uname}).count() > 1) {
                console.log('FUNZT');
                res.redirect('back');
            }
            db.close();
        });
    }
    res.redirect('back');
});
*/
app.get("/login_page", function(req, res) {
    res.sendFile(__dirname + '/login_page.html');
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
