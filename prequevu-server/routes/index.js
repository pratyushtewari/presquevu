
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'PresqueVu' });
};

exports.inject = function(req, res){
  res.render('inject', { title: 'Inject Location' });
};