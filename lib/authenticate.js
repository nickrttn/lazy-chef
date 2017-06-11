const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../db/user');

const user = new User();

passport.serializeUser((user, done) => {
	done(null, user.username);
});

passport.deserializeUser(async (userId, done) => {
	const deserializedUser = await user.read(userId);
	done(null, deserializedUser);
});

passport.use(new LocalStrategy((username, password, done) => {
	// find user in the database
	// if it doesn't exist, return incorrect username error;
	// if the password is wrong, return incorrect password error
	// if all is good, return done(null, user)
}));

module.exports = passport;
