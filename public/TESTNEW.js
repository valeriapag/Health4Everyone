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

MongoClient.connect('mongodb://127.0.0.1:27017/Ourdb', {useNewUrlParser: true}, async function(error, db) {
    //Fehler wird abgefangen
    if (error) {
        throw error;
    }
    //Erstelle Variable zum Zugriff auf Db für spätere Operationen
    ourdb = db.db("Ourdb");
    console.log('POSTED');
    var checkHASH = await String(crypto.createHash('md5').update('1234').digest('hex'));
    var meti = await ourdb.collection('meti').find({'pwHash': checkHASH, 'uname': String(req.body.uname)}).toArray()[0];
    console.log(meti);
    db.close();
});