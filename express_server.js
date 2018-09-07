"use strict";
var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
app.set("view engine", "ejs");
var cookieParser = require('cookie-parser')
app.use(cookieParser())

var urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
  };

// User DataBase
const users = { 
  "ab12a1b2": {
    id: "ab12a1b2", 
    email: "a@a.com", 
    password: "aaa"
  },
 "cd34c3d4": {
    id: "cd34c3d4", 
    email: "appleonius@example.com", 
    password: "funky-town-get-down"
  }
}

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
//Helpers



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
    
outputArray.push(String.fromCharCode(Math.floor(Math.random() * (87 - 65) + 65)));
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
    let user = users[req.cookies["user_id"]] || null;
    let templateVars = { urls: urlDatabase, user };
    res.render("urls_index", templateVars);
  });

app.get("/urls/new", (req, res) => {
  let user = users[req.cookies["user_id"]] || null;
  let templateVars = { user };
    res.render("urls_new", templateVars);
  });

  app.get("/u/:shortURL", (req, res) => {
    res.redirect(`${urlDatabase[req.params.shortURL]}`);
  });


app.get("/urls/:id", (req, res) => {
  let user = users[req.cookies["user_id"]] || null;
    let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id], user };
    res.render("urls_show", templateVars);
  });
// Get login Page
app.get("/login", (req,res) =>{
  let templateVars = {user: users}
  res.render("login")
});


app.post("/login", (req, res) =>{
  let emailExists = false;
  let user_id;

  for(let id in users){
    if(users[id].email === req.body.email){
     emailExists = true;
     user_id = id;
}
  }
  if(!emailExists){
    res.status(403).send("Error 403: Email Not registered");
  } else if(req.body.password !== users[user_id].password) {
    res.status(403).send("Error 403: Invalid Password");
  } else {
    res.cookie("user_id" , user_id);
    res.redirect("/urls");
    console.log(user_id)
  }

});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});

// Register

 app.get("/register", (req, res)=> {
  let id = req.session.user_id
  let user = users[req.cookies["user_id"]] || null;
  let templateVars = { user: user };
  res.render("register", templateVars);
});


app.post("/register", (req, res) => {
 
  let email = req.body.email;
  let password = req.body.password;

  // Blank email or password field
  if(email === "" || password === ""){
    res.status(400).send("Error 400: Please fill all fields")
    return;
  }
  // iterate through object to compare emails
  for(let id in users){
    if(users[id].email === req.body.email){
    res.status(400).send('Error 400: account exists')
      return;
    }
  }
  // creating new Id & adding to user database
  let newID = generateRandomString(6);
  
  users[newID] = {
    id: newID,
    email: req.body.email,
    password: req.body.password};
// set cookie to new ID
res.cookie("user_id", "newID");
// redirect if we good
res.redirect("/login");

});

app.get('/logout', (req, res) => {
  res.clearCookie('user_id')
  res.redirect("/urls")
  });

app.post('/logout', (req, res) => {
res.clearCookie('user_id')
res.redirect("/urls")
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