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
  let result = undefined;
  console.log(email);
  for (let user in users) {
    console.log('users email', users[user].email)
    if(email === users[user].email) {
      return true;
    } else {
      result = false;
    }
  }
  console.log(result);
  return result;
}

const findUser = function(email, password, users) {
  let userFound = undefined;
  for (let user in users) {
    if(users[user].email === email) {
      if(users[user].password === password) {
        userFound = users[user].id;
      }
    }
  }

  return userFound;
}

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

const users = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

app.get('/', (req, res) => {
  res.redirect('/login')
});

app.get('/login', (req, res) => {
  let templateVars = { users, user_id: undefined }
  res.render('login', templateVars);
});

app.get('/register', (req, res) => {
  let templateVars = { users, invalidEmail: false, user_id: req.cookies.user_id};
  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  if(findEmail(req.body.email, users)) {
    const invalidEmail = true;
    let templateVars = { users, invalidEmail: invalidEmail, user_id: undefined }
    res.render('register', templateVars);
  } else {
    const rndmID = generateRandomString();
    users[rndmID] = {
      id: rndmID,
      email: req.body.email,
      password: req.body.password
    };
    res.cookie('user_id', rndmID);
    res.redirect('/urls');
  }
});

app.post('/login', (req, res) => {
  let userFound = findUser(req.body.email, req.body.password, users);
  if(userFound) {
    res.cookie('user_id', userFound);
    res.redirect('/urls');
  } else {
    let templateVars = {
      users,
      user_id: 'invalid'
    }
    res.render('login', templateVars);
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
})

app.get('/urls', (req, res) => {
  let templateVars = { urls: urlDatabase, user_id: req.cookies.user_id, users };
  res.render('urls-index', templateVars);
});

// app.get('/urls/new', (req, res) => {
//   let templateVars = { users, user_id: req.cookies.user_id };
//   res.render('urls-new', templateVars)
// });

// app.get('/urls/:shortURL', (req, res) => {
//   let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], users , user_id: req.cookies.user_id };
//   res.render('urls-show', templateVars);
// });

// app.get('/u/:shortURL', (req, res) => {
//   const longURL = urlDatabase[req.params.shortURL];
//   res.redirect(longURL);
// });


// app.post('/urls', (req, res) => {
//   const rndmURL = generateRandomString();
//   urlDatabase[rndmURL] = req.body.longURL;
//   res.redirect('/urls');
// });

// app.post('/urls/:shortURL/delete', (req, res) => {
//   delete urlDatabase[req.params.shortURL];
//   res.redirect('/urls');
// });

// app.post('/urls/:shortURL', (req, res) => {
//   urlDatabase[req.params.shortURL] = req.body.longURL;
//   res.redirect('/urls');
// });


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
