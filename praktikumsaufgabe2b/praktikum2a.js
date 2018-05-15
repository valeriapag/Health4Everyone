var patienten = [{ id: "1234", vorname: "Hans", nachname: "Peter",alter: "45",geschlecht: "m",krankheit:"Schnupfen"},
    { id: "1574", vorname: "Gerda", nachname: "Peter",alter: "31",geschlecht: "w",krankheit:"Husten"},
    { id: "2345", vorname: "Frank", nachname: "Obstbaum",alter: "43",geschlecht: "m",krankheit:"Beinbruch"},
    { id: "9812", vorname: "Gerd", nachname: "Müller",alter: "65",geschlecht: "m",krankheit:"Lungenentzündung"},
    { id: "5427", vorname: "Markus", nachname: "Bauer",alter: "21",geschlecht: "m",krankheit:"Angina"}];

//Modul Express wird eingebunden
var express = require("express");
//Modul Handlebars für Express wird eingebunden
var hbs = require("express-handlebars");
//app wird für Konfiguration des Servers verwendet
var app = express();

/*
	- Funktion für Requests/Responses.
	- In diesem Fall wird sie aufgerufen, wenn das "patienten" Dokument angefordert wird.
	- Mit res.render() wird dem Template das patienten Array übergeben.
 */
app.get("/patienten", function(req, res) {
	res.render("patienten", {
		patienten: patienten
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






