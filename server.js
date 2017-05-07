//TODO: return error when trying to add faulty url & return error

(function(){ //iife

var express = require('express');
var path = require('path');
var url = process.env.URL_SHORTENER_DB_URI;
var mongo = require('mongodb').MongoClient;

var app = express();

var port = process.env.PORT || 8080;
var result = {};

app.get('/', function(req,res){
      // TODO: serve landing page with instructions here   
      res.send("Hello World!");
});

app.get('/:urlid', function(req,res){
    //if shortUrlId is in db, redirect to original url
    var urlid = Number(req.params["urlid"]);
    console.log("urlid: "+ urlid);
    
    if(!Number.isNaN(urlid)) {
      mongo.connect(url, function(err, db) {
        if(err) throw err;
        
        // db gives access to the database
        var urls = db.collection('urls');
  
        urls.find({
          extension: urlid
        }).toArray(function(err,documents) {
            if(err) throw err;
            if(!documents[0]) {
              db.close();
              return res.send('This url does not exist');
            }
            // redirect to original url
            db.close();
            return res.redirect(documents[0]['original_url']);
        });
      });
    } else {
      res.send("Not a valid url!");
    }
});

app.get('/new', function(req,res){ // TODO: should this be a POST??
    var urlParam = req.query.url;
    var doc = {original_url : urlParam };
    result = {original_url: null, short_url: null};
    var urlCount;
    
    if(urlParam)  { //if the there is a url parameter, add to db
        
        //get url count from db when server starts
        mongo.connect(url, function(err, db) {
          if(err) throw err;

          var urls = db.collection('urls');
          urls.find().sort({_id:-1}).limit(1).toArray(function(err,documents) {
              if(err) throw err;

              // get url count
              urlCount = documents[0]["extension"] + 1;
              console.log('urlCount: '+urlCount);
              doc["short_url"] = 'https://' + req.get('host') + '/' + urlCount;
              doc["extension"] = urlCount;
              
              // add new item to 'urls' collection  
              urls.insert(doc, function(err,data) {
                if(err) throw err;
                result = {original_url: doc.original_url, short_url: doc.short_url};
                res.send(result);
                db.close()
              });
          });
        });
    }
    else {
        res.send(result);    
    }
}); // app.get();

app.listen(port, function(){
    console.log("Port listening on: " + port);
});

})();