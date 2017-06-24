module.exports = function () {
  return function (req, res, next) {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      req.flash('error', 'You need to be logged in to access that page.');
      return res.redirect('/auth/login');
    }

    next();
  };
};
