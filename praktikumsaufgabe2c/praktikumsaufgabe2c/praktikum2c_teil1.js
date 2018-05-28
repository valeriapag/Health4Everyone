/*
    - Zuerst ausführen vor praktikum_teil2.js -> Mongodb Datenbank/Collection/Daten müssen erstellt werden
    - Bei mehrmaligem Ausführen von praktikum_teil1.js mehrfaches Einfügen der Daten in die Collection!
 */

//Modul Express wird eingebunden
var express = require("express");
//Modul Handlebars für Express wird eingebunden
var hbs = require("express-handlebars");
//app wird für Konfiguration des Servers verwendet
var app = express();
//Modul mongodb wird eingebunden
var MongoClient = require('mongodb').MongoClient;

//Verbinden mit mongodb (Mongodb Server muss laufen!) mittels MongoClient.connect() Callback
//Name der Db = Ourdb
MongoClient.connect('mongodb://127.0.0.1:27017/Ourdb', function(error, db) {
    //Fehler wird abgefangen
    if (error) throw error;
    //Ausgabe falls Db erstellt
    console.log("Database created!");
    //Erstelle Variable zum Zugriff auf Db für spätere Operationen
    ourdb = db.db("Ourdb");
    //Erstelle Collection "patienten" und gebe "Collection created!" aus, falls erfolgreich
    ourdb.createCollection("patienten", function(err, res) {
        if (err) throw err;
        console.log("Collection created!");
    })
    //Daten die eingelesen werden sollen
    var patients = [{ id: "1234", vorname: "Hans", nachname: "Peter",alter: "45",geschlecht: "m",krankheit:"Schnupfen"},
        { id: "1574", vorname: "Gerda", nachname: "Peter",alter: "31",geschlecht: "w",krankheit:"Husten"},
        { id: "2345", vorname: "Frank", nachname: "Obstbaum",alter: "43",geschlecht: "m",krankheit:"Beinbruch"},
        { id: "9812", vorname: "Gerd", nachname: "Müller",alter: "65",geschlecht: "m",krankheit:"Lungenentzündung"},
        { id: "5427", vorname: "Markus", nachname: "Bauer",alter: "21",geschlecht: "m",krankheit:"Angina"}];
    //Benutze insertMany Funktion zum Einfügen der obigen Daten in die Collection
    //Vorsich: Bei mehrmaligem Ausführen der js Datei werden die Daten mehrmals eingefügt
    ourdb.collection("patienten").insertMany(patients, function(err, res) {
        if (err) throw err;
        //Gebe Inserted + Anzahl der eingefügten Elemente + items! aus
        console.log("Inserted " + res.insertedCount + " items!");
        //Schliesse Verbindung mit Datenbank
        db.close();
    })
});

//Variable zum Speichern der Daten aus der Datenbank
var patienten = [];
/*
	- Funktion für Requests/Responses.
	- In diesem Fall wird sie aufgerufen, wenn das "patienten" Dokument angefordert wird.
	- Mit res.render() wird dem Template das patienten Array übergeben.
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
            //Bilde Daten aus patienten im Template ab
            res.render("patienten", {
                patienten: patienten
            });
            //Schliesse Datenbank
            db.close();
        });
    });
});

//Statische Dateien bei Aufrufen von patienten übergeben.
app.use(express.static(__dirname));

/*
	Server beantwortet Anfragen auf Port 8080 und mit der Konsole wird ""Listening on port 8080" ausgegeben.
 */
app.listen(8080, function() {
	console.log("Listening on port 8080");
});

/*
	- View Engine wird angelegt, mit ihr wird festgelegt, was vom Client angefordert werden kann/sichtbar ist
	- "hbs" steht für Handlebars bzw. die Datei-Endung "hbs".
 */
app.set("views", __dirname + "/views"); //Views Pfad für die View Engine
//Definiert die Engine und setzt Layouts Pfad/Datei-Endung
app.engine("hbs", hbs({extname : "hbs", defaultLayout: "layout", layoutsDir: __dirname + "/views/layouts"}));
//"hbs" wird als View Engine festgelegt
app.set("view engine", "hbs");