var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var urls = [];

var routes = require('./routes/index');

var app = express();

//require socket io and initiate an instance of it 
app.io = require('socket.io')();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('node-sass-middleware')({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true,
  sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

app.io.on('connection', function(socket){
  console.log('conncted form socket Events ' + socket.id)

  //DICONNECT
  socket.on('disconnect', function(){
    console.log('oh no edisocnenct ed from socket events ' + socket.id)
  });

  //MAKE A REQUEST
  socket.on('make a search', function(dataObj){
    //CLEAR URLS ARRAY ON NEW SEARCHES
    urls = [];
    //DELETE OLD FILES
    fs.unlink('./public/rippedImgs', function(err){
      if(err){
        console.log(err)
      }
      else{
        console.log('removed all imgs from rippedImgs')
      }
    })
    //TO DO SEARCH ON IMGUR POPULATE CLINET VIEW WITH ACTUAL IMGS USING MASONRY
    var searchUrl = 'https://www.imgur.com//r/' + dataObj.searchTerm + "/";
    request(searchUrl , function(err, res, body){
      
      if(!err && res.statusCode == 200 ){
        var $ = cheerio.load(body);
        
        $('.image-list-link>img').each(function(ind, curVal){
          var url = 'http://www.' + curVal.attribs.src.substring(2);
          
          urls.push(url);
        });
        
      }

      console.log(urls)
      app.io.emit('return search results', urls)
      //RIP FILES TO rippedImgs FOLDER
      for(var i = 0; i < urls.length; i++){
        request(urls[i]).pipe(fs.createWriteStream('./public/rippedImgs/' + i + '.jpg'));
      }
    })

  });

  //DOWNLOAD IMG TO rippedImgs FOLDER
 // socket.on('rip imgs', function(){

  //});
});

module.exports = app;
