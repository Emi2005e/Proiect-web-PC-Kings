const express= require("express");
const pg= require("pg");
const path= require("path");
const fs=require("fs");
const sass=require("sass");
const sharp = require('sharp');

client=new pg.Client({
    database:"cti_2026",
    user:"emi",
    password:"emi",
    host:"localhost",
    port:5432
})

client.connect()

//Bonus etapa 6 (8.)
let categoriiProduse = [];
client.query("SELECT unnest(enum_range(NULL::tip_componenta))", function(err, rez) {
    if (!err) {
        categoriiProduse = rez.rows.map(rand => rand.unnest);
    }
});

// Bonus etapa 4
function verificareEroriJSON() {
    const caleJson = path.join(__dirname, "resurse", "json", "erori.json");

    // Bonus a
    if (!fs.existsSync(caleJson)) {
        console.error("Fișierul erori.json nu există! Aplicația se va închide.");
        process.exit();
    }
    const continutString = fs.readFileSync(caleJson, "utf8");

    // Bonus f

    const blockRegex = /\{([^{}]*)\}/g;
    let matchBloc;
    while ((matchBloc = blockRegex.exec(continutString)) !== null) {
        let interiorObiect = matchBloc[1];
        let cheiRegex = /"([^"]+)"\s*:/g;
        let cheiGasite = [];
        let cheieMatch;
        while ((cheieMatch = cheiRegex.exec(interiorObiect)) !== null) {
            let numeCheie = cheieMatch[1];
            if (cheiGasite.includes(numeCheie)) {
                console.error("Verifică erori.json.");
            }
            cheiGasite.push(numeCheie);
        }
    }

    let obErori;
    try {
        obErori = JSON.parse(continutString);
    } catch (err) {
        console.error("Fișierul erori.json este stricat (nu este valid).");
        process.exit();
    }

    //Bonus b
    if (!obErori.info_erori || !obErori.cale_baza || !obErori.eroare_default) {
        console.error("Lipsesc proprietăți esențiale (info_erori, cale_baza sau eroare_default).");
    } else {
        
//    Bonus c
        let errDef = obErori.eroare_default;
        if (!errDef.titlu || !errDef.text || !errDef.imagine) {
            console.error("Obiectului 'eroare_default' îi lipsește titlul, textul sau imaginea.");
        }

        //Bonus d
        let caleFolderBaza = path.join(__dirname, obErori.cale_baza);
        if (!fs.existsSync(caleFolderBaza)) {
            console.error("Folderul NU există în proiect!");
        } else {
            // Bonus e

            if (errDef.imagine && !fs.existsSync(path.join(caleFolderBaza, errDef.imagine))) {
                console.error("Imaginea pentru eroarea default nu există în folderul specificat!");
            }
            for (let eroare of obErori.info_erori) {
                if (eroare.imagine && !fs.existsSync(path.join(caleFolderBaza, eroare.imagine))) {
                    console.error("Imaginea pentru eroarea cu identificator nu există în folderul specificat!");
                }
            }
        }

        //Bonus g fara asta ca nu am stiut
        let frecventaId = {};
        for (let eroare of obErori.info_erori) {
            if (frecventaId[eroare.identificator]) {
                frecventaId[eroare.identificator].push(eroare);
            } else {
                frecventaId[eroare.identificator] = [eroare];
            }
        }

        for (let id in frecventaId) {
            if (frecventaId[id].length > 1) {
                console.error("Există erori duplicate cu același identificator!");
                for(let err of frecventaId[id]) {
                    let clonaEroare = { ...err };
                    delete clonaEroare.identificator; 
                    console.error(clonaEroare);
                }
            }
        }
    }
}   




//Cerinta 3 etapa 4
console.log("Calea fisierului (__filename):", __filename);
console.log("Directorul fisierului (__dirname):", __dirname);
console.log("Folderul de lucru (process.cwd()):", process.cwd());
/*
Nu, __dirname și process.cwd() nu sunt mereu acelasi lucru. 
__dirname returneaza mereu folderul in care se afla fizic fișierul codului (ex: index.js), 
pe cand process.cwd() returneaza folderul din care am deschis terminalul si am dat comanda "node"
*/


//Cerinta 20 etapa 4
let vect_foldere = ["temp", "logs", "backup", "fisiere_uploadate"];
for (let folder of vect_foldere) {
    let caleFolder = path.join(__dirname, folder);
    if (!fs.existsSync(caleFolder)) {
        fs.mkdirSync(caleFolder);
    }
}


app= express();
app.set("view engine", "ejs")



// curs 5
// Cerinta 13 etapa 4 si etapa 5 cerinta 2 a
obGlobal={
    obErori:null,
    obImagini:null,
    folderScss: path.join(__dirname,"resurse/scss"),
    folderCss: path.join(__dirname,"resurse/css"),
    folderBackup: path.join(__dirname,"backup"),
}
// curs 5

console.log("Folder index.js", __dirname);
console.log("Folder curent (de lucru)", process.cwd());
console.log("Cale fisier", __filename);


//Cerinta 16 etapa 4
app.use(function(req, res, next) {
    res.locals.ip = req.ip;
    res.locals.categoriiProduse = categoriiProduse; //ca sa ajunga la EJS, trebuie sa pun in res.locals
    next();
});


// Etapa 5 Cerinta 1

async function procesareImaginiGalerie() {
    const caleJson = path.join(__dirname, "resurse", "json", "galerie.json");
    if (!fs.existsSync(caleJson)) return [];
    
    const dateGalerie = JSON.parse(fs.readFileSync(caleJson, "utf8"));
    
    const minutCurent = new Date().getMinutes();
    let sfert = 1;
    if (minutCurent >= 15 && minutCurent < 30) sfert = 2;
    else if (minutCurent >= 30 && minutCurent < 45) sfert = 3;
    else if (minutCurent >= 45) sfert = 4;

    let imaginiFiltrate = dateGalerie.imagini.filter(img => parseInt(img.sfert_ora) === sfert);
    if (imaginiFiltrate.length > 10) {
        imaginiFiltrate = imaginiFiltrate.slice(0, 10); 
    }

    let caleFolder = path.join(__dirname, dateGalerie.cale_galerie);
    for (let img of imaginiFiltrate) {
        let caleAbsolutaOriginal = path.join(caleFolder, img.cale_imagine);
        let extensie = path.extname(img.cale_imagine); // ex: .jpg
        let numeFaraExt = path.basename(img.cale_imagine, extensie); // ia numele fara extensie, ex: poza1

        let numeMic = numeFaraExt + "-mic" + extensie; // devine poza1-mic.jpg
        let caleAbsolutaMic = path.join(caleFolder, numeMic);

        img.cale_relativa = "/" + dateGalerie.cale_galerie + "/" + img.cale_imagine;
        img.cale_mica_relativa = "/" + dateGalerie.cale_galerie + "/" + numeMic;

        if (fs.existsSync(caleAbsolutaOriginal) && !fs.existsSync(caleAbsolutaMic)) {
            await sharp(caleAbsolutaOriginal).resize(300).toFile(caleAbsolutaMic);
        }
    }
    return imaginiFiltrate;
}

// Cerinta 8 etapa 4 si etapa 5 cerinta 1
app.get(["/", "/index", "/home"], async function(req,res){
    let imaginiGalerie = await procesareImaginiGalerie();
    res.render("pagini/index", { ip: req.ip, imagini: imaginiGalerie });
} )

//etapa 6
// Ruta pentru toate produsele (Filtrare + Extragere atribute dinamice etapa 6 bonus)
app.get("/produse", async function(req, res) {
    try {
        let query = "SELECT * FROM componente";
        let parametri = [];
        if (req.query.categorie) {
            query += " WHERE categorie = $1";
            parametri.push(req.query.categorie);
        }
        let rezProduse = await client.query(query, parametri);

        // 1. RANGE: Extrag minimul si maximul pentru slider garantie
        let rezGarantie = await client.query("SELECT MIN(garantie_luni) as min_gar, MAX(garantie_luni) as max_gar FROM componente");
        let minGar = rezGarantie.rows[0].min_gar || 0;
        let maxGar = rezGarantie.rows[0].max_gar || 120;

        // 2. DATALIST: Extrage producatorii unici
        let rezProducatori = await client.query("SELECT DISTINCT producator FROM componente");
        let producatori = rezProducatori.rows.map(r => r.producator);

        // 3. RADIO: Extrag starile unice
        let rezStare = await client.query("SELECT DISTINCT stare_produs FROM componente");
        let stari = rezStare.rows.map(r => r.stare_produs);

        // 4. SELECT MULTIPLU: Extrag tehnologiile unicesi despart stringurile cu virgule
        let rezTehnologii = await client.query("SELECT DISTINCT unnest(string_to_array(tehnologii, ',')) as tehnologie FROM componente");
        let tehnologii = rezTehnologii.rows.map(r => r.tehnologie.trim()).filter((v, i, a) => a.indexOf(v) === i && v !== ""); //indexof pentru a sterge dublurile din vectorul tehnologii, filter pentru a sterge valorile goale daca sunt

        // 5. CHECKBOX: Extrag optiunile distincte pentru gaming (true/false)
        let rezGaming = await client.query("SELECT DISTINCT recomandat_gaming FROM componente");
        let optiuniGaming = rezGaming.rows.map(r => r.recomandat_gaming); 

        // 6. INPUT TEXT: Extrag cel mai scump produs ca placeholder si calculez lungimea maxima admisa
        let rezNumeExemplu = await client.query("SELECT nume FROM componente ORDER BY pret DESC LIMIT 1");
        let numeExemplu = rezNumeExemplu.rowCount > 0 ? rezNumeExemplu.rows[0].nume : "RTX 4090";
        let rezMaxLenNume = await client.query("SELECT MAX(LENGTH(nume)) as max_len FROM componente");
        let maxLenNume = rezMaxLenNume.rows[0].max_len || 100;

        // 7. TEXTAREA: Calculam lungimea maxima a descrierii pt atributul maxlength
        let rezMaxLenDesc = await client.query("SELECT MAX(LENGTH(descriere)) as max_len FROM componente");
        let maxLenDesc = rezMaxLenDesc.rows[0].max_len || 500;

        // Trimit toate aceste variabile la EJS
        res.render("pagini/produse", { 
            produse: rezProduse.rows,
            minGarantie: minGar,
            maxGarantie: maxGar,
            producatori: producatori,
            stari: stari,
            tehnologii: tehnologii,
            optiuniGaming: optiuniGaming,
            numeExemplu: numeExemplu,
            maxLenNume: maxLenNume,
            maxLenDesc: maxLenDesc
        });

    } catch (err) {
        console.error("EROARE SQL ", err.message);
        afisareEroare(res, 500, "Eroare DB");
    }
});

// Ruta pentru o singura componenta
app.get("/produs/:id", function(req, res) {
    client.query("SELECT * FROM componente WHERE id = $1", [req.params.id], function(err, rez) {
        if (err) afisareEroare(res, 500);
        else if (rez.rowCount === 0) afisareEroare(res, 404, "Produs inexistent");
        else res.render("pagini/produs", { produs: rez.rows[0] });
    });
});

//etapa 6

app.get("/despre", function(req,res){
    res.render("pagini/despre")
})
//Cerinta 6 etapa 4 folder special definit ca static
app.use("/resurse", express.static(path.join(__dirname,"resurse"))); //il fac ca sa imi intre in fisierul resurse singur si sa ia tot ce trb, poate avea doar un inceput de path


//Cerinta 19 etapa 4
app.get("/favicon.ico", function(req, res){
    res.sendFile(path.join(__dirname, "resurse/imagini/ico/favicon/favicon.ico"));
});


app.get("/cale", function(req,res)
    {
        console.log("S-a accesat ruta <b style='color: red;'> ruta</b>, rege!!!");
        res.send("S-a accesat ruta <b style='color: red;'> ruta</b>, rege!!!");
    }
)

app.get("/cale2", function(req,res)
    {
        res.write("123 aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa ");
        res.write("hi");
        res.end();
    }
)

// curs 5
// Cerinta 13 etapa 4 citire erori din fisier json si salvare in obGlobal
function initErori(){
    // important de stiut fisire sincron si asincron, daca e sincron, codul se opreste pana se citeste fisierul, daca e asincron, codul continua sa ruleze si cand se termina de citit fisierul, se executa callback-ul
    let continut = fs.readFileSync(path.join(__dirname,"resurse/json/erori.json")).toString("utf-8");
    let erori=obGlobal.obErori=JSON.parse(continut)
    let err_default=erori.eroare_default;
    err_default.imagine=path.join(erori.cale_baza, err_default.imagine)
    for (let eroare of erori.info_erori){
        eroare.imagine=path.join(erori.cale_baza, eroare.imagine)
    }

}
initErori()


// Cerinta 14 etapa 4 functie pentru afisare eroare
function afisareEroare(res, identificator, titlu, text, imagine){
    let eroare=obGlobal.obErori.info_erori.find((elem)=>
        elem.identificator==identificator
    );
    let errDefault=obGlobal.obErori.eroare_default;
    if(eroare?.status){
        res.status(eroare.identificator);
        }
        res.render("pagini/eroare",{
        imagine: imagine || eroare?.imagine || errDefault.imagine,
        titlu: titlu || eroare?.titlu || errDefault.titlu,
        text: text || eroare?.text || errDefault.text
    });

}

app.get("/eroare", function(req, res){
    afisareEroare(res, 404, "Eroare 404 - Pagina nu a fost gasita");
});

// Etapa 5 cerinta 2 b
function compileazaScss(caleScss, caleCss){
    if(!caleCss){
        let numeFisExt=path.basename(caleScss); //iau numele fisierului cu extensie, ex: stil.scss
        let numeFis=numeFisExt.split(".")[0]; //iau numele fisierului fara extensie, ex: stil
        caleCss=numeFis+".css"; // adaug extensia css, ex: stil.css
    }
    
    if (!path.isAbsolute(caleScss))
        caleScss=path.join(obGlobal.folderScss,caleScss )
    if (!path.isAbsolute(caleCss))
        caleCss=path.join(obGlobal.folderCss,caleCss )
    
    // Etapa 5 Cerinta 2 c
    let caleBackup=path.join(obGlobal.folderBackup, "resurse/css");
    if (!fs.existsSync(caleBackup)) {
        fs.mkdirSync(caleBackup,{recursive:true}) //recursive pentru a crea si folderele parinte daca nu exista, le creeaza in lant ca sa nu dea err
    }

    let numeFisCss=path.basename(caleCss);
    if (fs.existsSync(caleCss)){
        //Etapa 5 cerinta 2 c - daca exista fisierul css, fac backup in folderul backup cu acelasi nume + timestamp
        try {
            // Etapa 5 Cerinta 2 d si e
            let numeBackup = numeFisCss.replace('.css', '') + "_" + new Date().getTime() + ".css";
            fs.copyFileSync(caleCss, path.join(caleBackup, numeBackup));
        } catch (err) {
            console.error("Eroare la crearea backup-ului pentru " + numeFisCss + ": ", err.message);
        }
    }
    // Etapa 5 cerinta 2 b
    try {
        let rez=sass.compile(caleScss, {"sourceMap":true});
        fs.writeFileSync(caleCss,rez.css);
    } catch (err) {
        console.error("Eroare SASS la fișierul " + caleScss + ": ", err.message);
    }
}

// Etapa 5 Cerinta 2 d
// la pornirea serverului, compilez toate fisierele scss din folderul resurse/scss
vFisiere=fs.readdirSync(obGlobal.folderScss); //ia toate fisierele idn folderul scss si le pune in arrayul vFisiere
for( let numeFis of vFisiere ){
    if (path.extname(numeFis)==".scss"){
        compileazaScss(numeFis);
    }
}

// Etapa 5 Cerinta 2 e
fs.watch(obGlobal.folderScss, function(eveniment, numeFis){
    if (eveniment=="change" || eveniment=="rename"){
        let caleCompleta=path.join(obGlobal.folderScss, numeFis);
        if (fs.existsSync(caleCompleta)){
            compileazaScss(caleCompleta);
        }
    }
})


app.get("/galerie", async function(req, res){
    try {
        let imaginiGalerie = await procesareImaginiGalerie();
        res.render("pagini/galerie", { imagini: imaginiGalerie });
    } catch (err) {
        console.error("Eroare la incarcarea galeriei:", err);
        afisareEroare(res);
    }
});

// Cerinta 9 etapa 4
app.get("/*pagina", function(req, res){
    console.log("Pagina ceruta:", req.url);

    // Cerinta 17 etapa 4
    if(req.url.startsWith("/resurse")){
        if(path.extname(req.url) === ""){
            afisareEroare(res, 403);
        } else {
            afisareEroare(res, 404);
        }
        return; 
    }

    // Cerinta 18 etapa 4 Cererea oricarui fisier cu extensia .ejs
    if(path.extname(req.url) === ".ejs"){
        afisareEroare(res, 400);
        return;
    }

    // Cerinta 10 etapa 4
    res.render("pagini" + req.url, function(err, rezRandare){
        if(err){
            if(err.message.includes("Failed to lookup view")){
                afisareEroare(res, 404);
            } else {
                afisareEroare(res); 
            }
        } else {
            res.send(rezRandare);
        }
    });
});




// curs 5

verificareEroriJSON();

// Cerinta 2 etapa 4
app.listen(8080);
console.log("Serverul a pornit!");