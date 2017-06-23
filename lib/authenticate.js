const debug = require('debug')('passport');
const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const User = require('../db/user');

const user = new User();

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (userId, done) => {
  const deserializedUser = await user.read(userId);
  done(null, deserializedUser);
});

passport.use('local', new LocalStrategy(async (username, password, done) => {
  const currentUser = await user.find(username);

  if (!currentUser) {
    return done(null, false, {message: 'That user doesn\'t exist'});
  }

  const passwordMatches = await bcrypt.compare(password, currentUser.hash);

  if (!passwordMatches) {
    return done(null, false, {message: 'The given password was incorrect'});
  }

  done(null, currentUser);
}));

passport.use('register', new LocalStrategy({
  passReqToCallback: true
}, async (req, username, password, done) => {
  try {
    const newUser = await user.create(req.body);

    if (newUser instanceof Error) {
      return done(null, false, newUser);
    }

    return done(null, newUser);
  } catch (err) {
    return done(null, false, err);
  }
}));

module.exports = passport;
