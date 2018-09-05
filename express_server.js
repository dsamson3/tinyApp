"use strict";
var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
app.set("view engine", "ejs");

var urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
  };

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

function validateURL(para){
  let str = para.includes("http://")
  if(str === true){
  return para
  } else {
  return `http://${para}`
  }
}
function generateRandomString(strLength) {
    let outputArray = [];
    let str = ""
    for(let i = 0; i < strLength + 1 ; i++){
    
outputArray.push(String.fromCharCode(Math.floor(Math.random() * (122 - 65) + 65)));
    }
    str = outputArray.join('');
    return str;
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
  });

app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
  });

app.get("/urls", (req, res) => {
    let templateVars = { urls: urlDatabase };
    res.render("urls_index", templateVars);
  });

app.get("/urls/new", (req, res) => {
    res.render("urls_new");
  });

  app.get("/u/:shortURL", (req, res) => {
    res.redirect(`${urlDatabase[req.params.shortURL]}`);
  });

app.get("/urls/:id", (req, res) => {
    let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id]};
    res.render("urls_show", templateVars);
  });
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});

 app.post("/urls", (req, res) => {
    let randomShortURL= "";
    randomShortURL= generateRandomString(6); //ctdhtt
    urlDatabase[randomShortURL] =validateURL(req.body.longURL); //urlDatabase[ctdhtt] = http://google.com
    res.redirect(`/urls`)        
  });
  app.post("/urls/:id/delete", (req, res) => {
    delete urlDatabase[req.params.id];
        res.redirect("/urls");
  });
app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
  });