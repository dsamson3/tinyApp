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
    password: bcrypt.hashSync("aaa", 10)
  } , 
 "cd34c3d4": {
    id: "cd34c3d4", 
    email: "b@b.com", 
    password: bcrypt.hashSync("bbb", 10)
  } 
}   

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
    let str = "";
    for(let i = 0; i < strLength + 1 ; i++){
    
outputArray.push(String.fromCharCode(Math.floor(Math.random() * (87 - 65) + 65)));
    }
    str = outputArray.join('');
    return str;
}

function secretUrls(id) {
  let urls = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
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
  let templateVars = { user: users[req.session.user_id]};
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
  
  
  // creating new Id & adding to user database
 
 let newID = generateRandomString(6);
 for(let id in users){                        // iterate through object to compare emails
   if(email === users[id].email){
   res.status(400).send('Error 400: Account already exists')
     return;
   }
 }
 users[newID] = {};
 users[newID].id = newID,
 users[newID].email= email;
 users[newID].password = bcrypt.hashSync(password, 10);
 

// set cookie to new ID
req.session.user_id = newID;
// redirect if we good
res.redirect("/login");
});



// --------- Get login Page ----------------//
app.get("/login", (req, res) => {

  if(!req.session.user_id)
  {
    let templateVars = {user: users[req.session.user_id]}
    res.render("login", templateVars);
  }
  else{
    res.redirect("/urls");
  }

});
  
app.post("/login", (req, res) => {
  let emailExists = false;
  let user_id;

  if(req.body.email === "" || req.body.password === ""){
    res.status(403).send("Error 403; Please Fill out provided fields")
  }

  for(let id in users){
    if(users[id].email === req.body.email){
     emailExists = true;
     user_id = id;
     }
    }
    if(!emailExists){
      res.status(403).send("Error 403: Email Not Registered!!!")
    } else if (!bcrypt.compareSync(req.body.password, users[user_id].password)) {
      res.status(403).send("Error 403: Invalid Password");
    } else {
      req.session.user_id = user_id;
      res.redirect('/urls');
    }
});
//-------------URLS-------------------//


app.get("/urls", (req, res) => {

  if(!req.session.user_id) {
    res.redirect("/login");
  } else {
    if(Object.keys(users).indexOf(req.session.user_id) === -1){
      req.session = null;
      return res.redirect('/login');
    } else {
      let templateVars = {user: users[req.session.user_id], urls: urlDatabase};
      res.render("urls_index", templateVars);
    }
  }
});


app.get("/urls/new", (req, res) => {
  let user = req.session.user_id;
  if (user === undefined) {
    res.redirect("/login");
    return;
  }
  let templateVars = { user: users[req.session.user_id] , urls: urlDatabase};
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => { //render page showing shrunk url
  if(!urlDatabase[req.params.id]) {
    res.send('Error 400 URL does not Exists');
  } else {
  if(req.session.user_id=== urlDatabase[req.params.id].ownerID){
     let templateVars = {user: users[req.session.user_id], urls: urlDatabase, shortURL: req.params.id}
     res.render("urls_show", templateVars);

  } else if (req.session.user_id) {
    res.send('Access Denied');
  } else {
    res.redirect("/login");
  }
}
  });
  

app.get("/u/:userShortURL", (req , res) => {
  let newShortURL = req.params.userShortURL;
  if(urlDatabase[newShortURL]){
    res.redirect(urlDatabase[req.params.userShortURL].longURL);
  }else {
    res.status(400).send("Error 400: Page does not exist")
  }

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
  let templateVars = { shortURL: shortURL, longURL: urlDatabase[shortURL].url, user: users[req.session.user_id] };
  res.render("urls_show", templateVars);
});


app.post("/urls", (req, res) => {

  if(req.session.user_id){
      let randomShortURL = "";
      randomShortURL = generateRandomString(6);
      urlDatabase[randomShortURL] = {};
      urlDatabase[randomShortURL]["longURL"]= validateURL(req.body.longURL);
      urlDatabase[randomShortURL]["ownerID"] = req.session.user_id;
      console.log(urlDatabase);
      res.redirect(`http://localhost:${PORT}/urls`); 
    }    
});


app.post("/urls/:id", (req, res) => {// Check if valid user, edit link else login

  if(req.session.user_id){
    let shortURLID = req.params.id;
    urlDatabase[shortURLID].longURL= validateURL(req.body.longURL);
    res.redirect(`http://localhost:${PORT}/urls`);
  }
  else{
    return res.redirect("/login");
  }      
});


app.post("/urls/:id/delete", (req, res) => { // delete url if owned by user
  if (urlDatabase[req.params.id]['ownerID'] === req.session.user_id) {
    console.log(urlDatabase[req.params.id], "has been deleted");
    delete urlDatabase[req.params.id];
    res.redirect(`http://localhost:${PORT}/urls`); //redirect to updated list
} else {
    res.status(400)
    .send("you do not have permission to edit this link.")
}
});



app.post("/urls/:id/edit", (req, res) => { //recieve edited address from :id/edit
  if (urlDatabase[req.params.id]['ownerID'] === req.session.user_id) {
      delete urlDatabase[req.params.id];
      urlDatabase[req.params.id] = {
          'longURL': req.body.longURL,
          'ownerID': req.session.user_id,
      }
      res.redirect(`/urls`);
  } else {
      res.status(400).send("Error 400: You do not have permission to edit this link.")
  }
})
 

// ------ Log Out ----------//

app.post('/logout', (req, res) => {
req.session = null;
res.redirect("/login");
});

//------------ Listening Port------------------//
app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
  });