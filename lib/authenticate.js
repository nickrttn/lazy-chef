/* eslint curly: 0, quotes: 0 */
const debug = require('debug')('passport');
const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const user = require('../db/user');

passport.serializeUser(serialize);
passport.deserializeUser(deserialize);
passport.use('local', new LocalStrategy(onlogin));
passport.use(
  'register',
  new LocalStrategy({passReqToCallback: true}, onregister)
);

function serialize(user, done) {
  if (!user)
    return done(
      null,
      false,
      new Error('Something went wrong, please try again.')
    );
  done(null, user._id);
}

function deserialize(userId, done) {
  user.read(userId, onread);

  function onread(err, user) {
    if (err) return done(null, false, err);
    done(null, user);
  }
}

function onlogin(username, password, done) {
  user.find(username, onfind);

  function onfind(err, user) {
    if (err) return done(null, false, err);

    if (!user) {
      return done(null, false, new Error("That user doesn't exist."));
    }

    bcrypt.compare(password, user.hash, oncompare);

    function oncompare(err, matches) {
      if (err) return done(null, false, err);

      if (!matches) {
        return done(
          null,
          false,
          new Error('The given password was incorrect.')
        );
      }

      done(null, user);
    }
  }
}

function onregister(req, username, password, done) {
  user.create(req.body, oncreate);

  function oncreate(err, user) {
    if (err) return done(null, false, err);
    done(null, user);
  }
}

module.exports = passport;
