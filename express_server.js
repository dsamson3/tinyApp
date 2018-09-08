"use strict";
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session')
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');

//------- set middleware ------ //

app.set("view engine", "ejs"); // Set View engine 

app.use(bodyParser.urlencoded({extended: true})); // Set Url encoder

app.use(cookieSession({ // Set Cookies
  name: 'session',
  keys: ['secretkey1', 'secretkey2'],
  maxAge: 24 * 60 * 60 * 1000 
}));




//--------- templateVars-----///
/* const templateVars = {
  user: undefined,
  error: undefined
} */





//-------------DataBase---------------//
const urlDatabase = {};
const users = {};
/* 
var urlDatabase = {
  "b2xVn2": {
    shortURL: "b2xVn2",
    longURL: "http://www.lighthouselabs.ca",
    ownerID: "ab12a1b2"
  },
  "9sm5xK": {
    shortURL: "9sm5xK",
    longURL: "http://www.google.com",
    ownerID: "cd34c3d4"
   }
};
 const users = { 
   "ab12a1b2": {
    id: "ab12a1b2", 
    email: "a@a.com", 
    password: "$2a$10$mHczVRhhNZ.Ml.aCmF0EfOE/VpDOYZzMrn.f60kTACuR0JekGC/v6"
  } , 
 "cd34c3d4": {
    id: "cd34c3d4", 
    email: "b@b.com", 
    password: "$2a$10$Rk8EacMPaQUznXCaG25xSOKq1.QNNDxfT6cpcSMj82RHBjOvTC3S"
  } 
}  */

//---------------  Helpers Functions ---------------------//

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

function secretUrls(id) {
  let urls = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].ownerID === id) {
      urls[shortURL] = urlDatabase[shortURL];
    }
  }
  return urls;
}

// ------------Compass Prep-----------//


app.get("/", (req, res) => {    
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {  
    res.json(urlDatabase);
  });

app.get("/hello", (req, res) => {  
    res.send("<html><body>Hello <b>World</b></body></html>\n");
  }); 


// ---------------Register -----------------------//

app.get("/register", (req, res)=> {
  let id = req.session.user_id
  let user = users[userID];
  let templateVars = { user: user};
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
    if(req.body.username === users[id]['email']){
    res.status(400).send('Error 400: Account already exists')
      return;
    }
  }
  // creating new Id & adding to user database
  let newID = user + generateRandomString(6);
  
  users[newID] = {
    id: newID,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)}
// set cookie to new ID
req.session.user_id = users[newID].id;
// redirect if we good
res.redirect("/login");
});


// --------- Get login Page ----------------//
app.get("/login", (req, res) =>{
  let userID = req.cookies.user_id
  let user = users[userID]
  let templateVars = { user: users , urls: urlDatabase};
    res.render("login", templateVars);
});
  
app.post("/login", (req, res) => {
  let emailExists = false;
  let user_id;

  for(let id in users){
    if(users[id].email === req.body.email){
      emailExists = true;
      user_id = id;
    }
  }
    if(!emailExists){
      res.status(403).send("Error 403: Email not Registered")
    } else if (!bcrypt.compareSync(req.body.password, users[user_id].password)){
        res.status(403).send('Error 403: Invalid Password')
    } else {
      req.session.user_id = user_id;
      res.redirect("/urls")
    }
});
//-------------URLS-------------------//


app.get("/urls", (req, res) => {
  let user = req.session.user_id;
  let urls = {}
  if (user !== undefined) {
    urls = sercretUrls(user.id)
  }
  let templateVars = { urls: urls, user: user };
  res.render("urls_index", templateVars)
})

app.post('/urls', (req, res) => { // Create New Tiny Url
  let user = req.session.user_id;
  if(user === undefined){
    res.redirect("/login");
    return;
  }
  let newShortURL = generateRandomString (6);
  urlDatabase[newShortURL] = {
    url: req.body['longURL'],
    userID:  user.id
  }
  res.redirect("/urls");
});

app.get("/urls/new", (req, res) => {
  let user = req.session.user_id;
  if (user === undefined) {
    res.redirect("/login");
    return;
  }
  let templateVars = { user: user };
  res.render("urls_new", templateVars);
});


app.get("/urls/:id", (req, res) => {
  let user = req.session.user_id;
  let shortURL = req.params.id;
  if (urlDatabase[shortURL] === undefined) {
    res.status(404).send("not found");
    return;
  }
  if (user && urlDatabase[shortURL].userID !== user.id) {
    res.status(403).send("unauthorized");
    return;
  }
  let templateVars = { shortURL: shortURL, longURL: urlDatabase[shortURL].url, user: req.session.user_id };
  res.render("urls_show", templateVars);
});


app.post("/urls/:id/", (req, res) => { // Update Tiny Url
  let user = req.session.user_id;
  let shortURL = req.params.id;
  if(urlDatabase[shortURL].userID !== user.id){
    res.status(403).send("Error 403: Unauthorized update");
  }
  urlDatabase[shortURL].url = req.body['longURL'];
  res.redirect('/urls');
});

app.post("/urls/:id/delete", (req, res) => { //Remoce Tiny Url
  let user = req.session.user_id;
  let shortURL = req.params.id;
  if(urlDatabase[shortURL].userID !== user.id){
    res.status(403).send('Error 403: Unauthorized delete');
    return;
  } 
    delete urlDatabase[shortURL];
    res.redirect("/urls");
});
  
  

// ------ Log Out ----------//

app.post('/logout', (req, res) => {
req.session = null;
res.redirect("/urls")
});

//------------ Listening Port------------------//
app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
  });