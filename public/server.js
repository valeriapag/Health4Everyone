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