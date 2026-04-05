const express= require("express");
const path= require("path");
const fs=require("fs");
const sass=require("sass");


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

        //Bonus g
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
pe cand process.cwd() returneaza folderul din care ai deschis terminalul si ai dat comanda "node"
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

//Cerinta 6 etapa 4 folder special definit ca static


// curs 5
// Cerinta 13 etapa 4
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
    next();
});


// Cerinta 8 etapa 4
app.get(["/", "/index", "/home"], function(req,res){
    res.render("pagini/index")
})

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
// Cerinta 13 etapa 4 - citire erori din fisier json si salvare in obGlobal
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


// Cerinta 14 etapa 4 - functie pentru afisare eroare, care primeste ca parametru res, identificatorul erorii, titlu, text, imagine
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

function compileazaScss(caleScss, caleCss){
    if(!caleCss){

        let numeFisExt=path.basename(caleScss);
        let numeFis=numeFisExt.split(".")[0];
        caleCss=numeFis+".css";
    }
    
    if (!path.isAbsolute(caleScss))
        caleScss=path.join(obGlobal.folderScss,caleScss )
    if (!path.isAbsolute(caleCss))
        caleCss=path.join(obGlobal.folderCss,caleCss )
    
    let caleBackup=path.join(obGlobal.folderBackup, "resurse/css");
    if (!fs.existsSync(caleBackup)) {
        fs.mkdirSync(caleBackup,{recursive:true})
    }

    let numeFisCss=path.basename(caleCss);
    if (fs.existsSync(caleCss)){
        fs.copyFileSync(caleCss, path.join(obGlobal.folderBackup, "resurse/css",numeFisCss ))// +(new Date()).getTime()
    }
    rez=sass.compile(caleScss, {"sourceMap":true});
    fs.writeFileSync(caleCss,rez.css)
    
}


// la pornirea serverului, compilez toate fisierele scss din folderul resurse/scss
vFisiere=fs.readdirSync(obGlobal.folderScss);
for( let numeFis of vFisiere ){
    if (path.extname(numeFis)==".scss"){
        compileazaScss(numeFis);
    }
}


fs.watch(obGlobal.folderScss, function(eveniment, numeFis){
    if (eveniment=="change" || eveniment=="rename"){
        let caleCompleta=path.join(obGlobal.folderScss, numeFis);
        if (fs.existsSync(caleCompleta)){
            compileazaScss(caleCompleta);
        }
    }
})

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