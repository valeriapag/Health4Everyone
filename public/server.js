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
    if (error) {
        throw error;
    }
    //Ausgabe falls Db erstellt
    console.log("Database Ourdb created!");
    //Erstelle Variable zum Zugriff auf Db für spätere Operationen
    ourdb = db.db("Ourdb");
    //Erstelle Collection "patienten" und gebe "Collection created!" aus, falls erfolgreich
    ourdb.createCollection("patient", function(err, res) {
        if (err) {
            throw err;
        }
        console.log("Collection patient created!");
    })
    ourdb.createCollection("arzt", function(err, res) {
        if (err) {
            throw err;
        }
        console.log("Collection arzt created!");
    })
    ourdb.createCollection("meti", function(err, res) {
        if (err) {
            throw err;
        }
        console.log("Collection meti created!");
    })
});