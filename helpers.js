const bcrypt = require('bcrypt')

// generates a random 6 digit alphanumerical string
const generateRandomString = function() {
  let str = '';
  const alph = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    str += alph.charAt(Math.floor(Math.random() * alph.length));
  }
  return str;
};

// checks if the email has already been used to register another account
const findEmail = function(email, users) {
  let result = undefined;
  for (let user in users) {
    if(email === users[user].email) {
      return users[user];
    } else {
      result = false;
    }
  }
  return result;
};

// checks if user email & password is saved in the database and return the user found
const findUser = function(email, password, users) {
  let userFound = undefined;
  for (let user in users) {
    if(users[user].email === email) {
      if(bcrypt.compareSync(password, users[user].password)) {
        userFound = users[user].id;
      }
    }
  }

  return userFound;
};

//find all urls created by the logged in user
const findURLsForUsers = function(user_id, db) {
  let arr = [];
  for (let shortURL in db) {
    if (user_id === db[shortURL].user_id) {
      arr.push(db[shortURL]);
    }
  }
  return arr;
};

module.exports = {
  generateRandomString,
  findEmail,
  findUser,
  findURLsForUsers
};