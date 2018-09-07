"use strict";
var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
app.set("view engine", "ejs");
var cookieParser = require('cookie-parser')
app.use(cookieParser())

//-------------DataBase---------------//


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
    console.log(urlDatabase[shortURL], id);
    if (urlDatabase[shortURL].ownerID === id) {
      urls[shortURL] = urlDatabase[shortURL];
      console.log("in if")
    }
  }
  return urls;
}

// ----------------- Gets------------------//


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
  let user = users[req.cookies["user_id"]];
  let urls = {};
  console.log(user);
  if(user !== undefined){
    urls = secretUrls(user.id)
  }
   let templateVars = {urls: urls, user: user}
    res.render("urls_index", templateVars);
  
});

app.get("/urls/new", (req, res) => {
  if (req.cookies["user_id"]){
    let user = users[req.cookies["user_id"]] || null;
    let templateVars = { user };
     res.render("urls_new", templateVars); 
  } else {
    res.redirect('/login');
  }
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
    if(req.cookies["user_id"]) {
     let url_id = generateRandomString(6);
      urlDatabase[url_id] = {
       shortURL: url_id,
       longURL: req.body.longURL,
       ownerID: req.session.user_id
      };

       res.redirect("/url/" + url_id);
   } else {
     res.status(401).send('Error: 401 must be logged in to create new url') 
   }
  });


  app.post("/urls/:id/delete", (req, res) => {
    delete urlDatabase[req.params.id];
        res.redirect("/urls");
  });
app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
  });