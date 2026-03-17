const express= require("express");
const path= require("path");

app= express();
app.set("view engine", "ejs")

console.log("Folder index.js", __dirname);
console.log("Folder curent (de lucru)", process.cwd());
console.log("Cale fisier", __filename);

app.get("/", function(req,res){
    res.sendFile(path.join(__dirname, "index.html"));
    // res.render("pagini/index")
})



app.use("/resurse", express.static(path.join(__dirname,"resurse"))); //il fac ca sa imi intre in fisierul resurse singur si sa ia tot ce trb, poate avea doa run inceput de path

app.get("/cale", function(req,res)
    {
        console.log("S-a accesat ruta <b style='color: red;'> ruta</b>, rege!!!");
        res.send("S-a accesat ruta <b style='color: red;'> ruta</b>, rege!!!");
    }
)

app.get("/cale2", function(req,res)
    {
        res.write("123 aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa ");
        res.write("holee sheet");
        res.end();
    }
)




app.listen(8080);
console.log("Serverul a pornit!");