/*
    - praktikum2c_teil2.js nur nach praktikum_teil1.js ausführen->sonst keine Datenbank/collection in Mongodb vorhanden
    - Ausserdem muss der Mongodb Server laufen
    - Die Daten aus der Datenbank (Collection patienten) werden als Json in der Response message versendet
 */

//Modul Express wird eingebunden
var express = require("express");
//app wird für Konfiguration des Servers verwendet
var app = express();
//Modul mongodb wird eingebunden
var MongoClient = require('mongodb').MongoClient;

//Variable zum Speichern der Daten aus der Datenbank
var patienten = [];
0
/*
	- Funktion für Requests/Responses.
	- In diesem Fall wird sie aufgerufen, wenn das "patienten" Dokument angefordert wird.
	- Sendet Daten aus der patienten Collection als response
 */
app.get("/patienten", function(req, res) {
    //Verbinden mit Datenbank
    MongoClient.connect('mongodb://127.0.0.1:27017/', function(error, db) {
        if (error) throw error;
        let ourdb = db.db("Ourdb");
        //Finde alle Elemente in der Collection patienten und gebe diese als Array aus
        ourdb.collection("patienten").find({}).toArray(function(err, result) {
            if (err) throw err;
            //Speichere Daten aus Datenbank in patienten Variable
            else if (patienten.length === 0) {
                patienten = result.slice(0);
            }
            //Sende Patienten Array als Json Objekt
            res.json(patienten);
            //Schliesse Datenbank
            db.close();
        });
    });
});

/*
	Server beantwortet Anfragen auf Port 8080 und mit der Konsole wird ""Listening on port 8080" ausgegeben.
 */
app.listen(8080, function() {
    console.log("Listening on port 8080");
});

