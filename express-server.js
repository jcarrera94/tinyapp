const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
// const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');

const { generateRandomString } = require('./helpers');
const { findEmail } = require('./helpers');
const { findUser } = require('./helpers');
const { findURLsForUsers } = require('./helpers');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['password']
}));

const isLoggedIn = (userId) => {
  console.log('isLoggedIn:', userId, userId !== undefined);
  return userId !== undefined;
}

// This is a middleware that checks if user is logged in or not
const isUserLogged = function (req, res, next) {
  console.log(req.path);
  if(req.path === '/register' || req.path === '/login' || req.path.indexOf('/u/') !== -1) {
    next();
  } else if (!isLoggedIn(req.session.user_id)) {
    res.redirect('/login');
  } else {
    next();
  }
}
app.use(isUserLogged);


const test = (req, res, next) => {
  const urls = findURLsForUsers(req.session.user_id, urlDatabase)
  let found = false;
  for (let url in urlDatabase) {
    if (req.params.shortURL === url) {
      found = true;
    }
  }
  if (!found) {
    console.log(1);
    let templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL] ? urlDatabase[req.params.shortURL].longURL : '',
      shortURLFound: 'DNE',
      users,
      urls: urls,
      user_id: req.session.user_id
    };
    if(req.path.indexOf('/urls/') !== -1) {
      console.log(2);
      res.render('urls-index', templateVars);
    } else {
      console.log(3);
      if (isLoggedIn(req.session.user_id)) {
        console.log(3.1);
        res.render('urls-index', templateVars);
      }
      else res.render('login', templateVars);
    }
  } else {
    next();
  }
}

const urlDatabase = {
 //urlid: {shorturl:urlid, longurl: longurl, user: user_id}
};

const users = {
 
};

//redirects user to their homepage if they are logged in or sends them to the login page
app.get('/', (req, res) => {
  res.redirect('/urls');
});

//renders login template and sends users object and user_id as undefined
app.get('/login', (req, res) => {
  let templateVars = { users, user_id: undefined, shortURLFound: '' }
  res.render('login', templateVars);
});

//renders register template and sends users object, invalidEmail and user_id as undefined 
app.get('/register', (req, res) => {
  let templateVars = { users, invalidEmail: false, user_id: undefined };
  res.render('register', templateVars);
});

//creates a new user if email hasn't been used before and redirects to /urls/userid website
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
      password: bcrypt.hashSync(req.body.password, 10)
    };
    req.session.user_id = rndmID;
    res.redirect(`/urls`);
  }
});

//logs in from login post request with valid email and password and redirects them to the /urls/user_id
app.post('/login', (req, res) => {
  let userFound = findUser(req.body.email, req.body.password, users);
  if(userFound) {
    req.session.user_id = userFound;
    res.redirect(`/urls`);
  } else {
    let templateVars = {
      users,
      user_id: 'invalid'
    }
    res.render('login', templateVars);
  }
});

//logs out user and clears the cookie 'user_id' and redirects user to the login website
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

//redirects unregistered and not logged in users to the login page or renders index template with all urls saved to the user logged in
app.get('/urls', (req, res) => {
  const urls = findURLsForUsers(req.session.user_id, urlDatabase);
  let templateVars = { urls: urls, user_id: req.session.user_id, users,shortURLFound: 'found' };
  res.render('urls-index', templateVars);
  
});

//redirects unregistered and not logged in users to the login page or checks if user is logged in to create a new tinyURL
app.get('/urls/new', (req, res) => {
  if(!req.session.user_id) {
    res.redirect('/login');
  }
  let templateVars = { users, user_id: req.session.user_id };
  res.render('urls-new', templateVars);
});

//creates new tinyurl for specific user and redirects to the user's index page
app.post('/urls', (req, res) => {
  const rndmURL = generateRandomString();
  urlDatabase[rndmURL] = { shortURL: rndmURL, longURL: req.body.longURL, user_id: req.session.user_id };
  res.redirect(`/urls`);
});

//checks if the user going to the url is logged in or else it will redirect them to the login page. Also checks if the request for the short url belongs to the user if not it will redirect them to their homepage and alerts them that they don't own that short URL
app.get('/urls/:shortURL', test, (req, res) => {
  const urls = findURLsForUsers(req.session.user_id, urlDatabase)
  console.log('shorturl route')
  for (let url of urls) {
    if (req.params.shortURL === url.shortURL) {
      let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, users, user_id: req.session.user_id };
      res.render('urls-show', templateVars);
    }
  }
  let templateVars = {
    users,
    urls: urls,
    user_id: req.session.user_id,
    shortURLFound: 'notfound'
  }
  res.render('urls-index', templateVars);

});

// makes sure the logged in user can delete their own short url
app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

// makes sure the logged in user can edit their own short url
app.post('/urls/:shortURL', (req, res) => {
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect('/urls');
});

//redirects any user/anyone to the long url linked to the short url
app.get('/u/:shortURL', test, (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
