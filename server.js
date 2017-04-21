var express = require('express');
var path = require('path');
//TODO: figure out why you are getting multiple db error
var url = "mongodb://localhost:27017/url-shortener";
var mongo = require('mongodb').MongoClient;

var app = express();

var port = process.env.PORT || 8080;
var result = {};

app.get('/', function(req,res){
    res.send("Hello World");
});

app.get('/new', function(req,res){
    var urlParam = req.query.url;
    var doc = {original_url : urlParam };
    result = {original_url: null, short_url: null};
    
    if(urlParam)  {
        //TODO: create short url
        
        //add url to urls collection
        mongo.connect(url, function(err, db) {
          if(err) throw err;
          
          // db gives access to the database
          var urls = db.collection('urls');
          
          urls.insert({
            doc 
          }, function(err,data) {
            if(err) throw err;
            result = { original_url : urlParam, short_url: null};
            res.send(result);
            console.log("data: "+JSON.stringify(data));
          });
          
          db.close();
        
        });    
    }
    else {
        res.send(result);    
    }
});

app.listen(port, function(){
    console.log("Port listening on: " + port);
})