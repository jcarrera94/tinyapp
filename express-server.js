const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const generateRandomString = function() {
  let str = '';
  const alph = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    str += alph.charAt(Math.floor(Math.random() * alph.length));
  }
  return str;
};

const findEmail = function(email, users) {
  let result = null;
  for (let user in users) {
    if(email === user.email) {
      result = true;
    } else {
      return false;
    }
  }
  return result;
}

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

const users = {

};

app.get('/', (req, res) => {
  res.send('ok');
});

app.get('/register', (req, res) => {
  let templateVars = users;
  res.render('register', templateVars);
});

app.get('/urls', (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render('urls-index', templateVars);
});

app.get('/urls/new', (req, res) => {
  let templateVars = users;
  res.render('urls-new', templateVars)
});

app.get('/urls/:shortURL', (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], users };
  res.render('urls-show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// app.post('/register', (req, res) => {
//   const rndmID = generateRandomString();
//   users[rndmID] = {
//     id: rndmID,
//     email: req.body.email,
//     password: req.body.password
//   };
//   if(findEmail(req.body.email, users)) {
//     const invalidEmail = true;
//     let templateVars = { users, invalidEmail: invalidEmail}
//     res.render('register', templateVars);
//   } else {
//     res.cookie('user_id', rndmID);
//     res.redirect('/urls');
//   }
// });

app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
})

app.post('/urls', (req, res) => {
  const rndmURL = generateRandomString();
  urlDatabase[rndmURL] = req.body.longURL;
  res.redirect('/urls');
});

app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.post('/urls/:shortURL', (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
