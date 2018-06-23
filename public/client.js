function showHerLun() {

    var herz = document.getElementById("herz");
    var lunge = document.getElementById("lunge");

    if(herz.style.display === "block") {

        herz.style.display = "none";
        lunge.style.display = "none";
    }
    else {
        herz.style.display = "block";
        lunge.style.display = "block";
    }
}

function showBrain() {

    var gehirn = document.getElementById("gehirn");


    if(gehirn.style.display === "block") {

        gehirn.style.display = "none";

    }
    else {
        gehirn.style.display = "block";

    }
}

function showKidney() {

    var niere = document.getElementById("nieren");


    if(niere.style.display === "block") {

        niere.style.display = "none";

    }
    else {
        niere.style.display = "block";

    }
}