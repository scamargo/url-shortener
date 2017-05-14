(function(){ //iife

var express = require('express');
var path = require('path');
var validUrl = require('valid-url');
var url = process.env.URL_SHORTENER_DB_URI;
var mongo = require('mongodb').MongoClient;

var app = express();
//var r = express.Router();

var port = process.env.PORT || 8080;

/*r.param('urlid', function( req, res, next, id ) {
    req.id_from_param = id;
    next();
});*/

app.use(express.static(path.join(__dirname, 'public')));

app.get('/new', function(req,res){
    console.log('new');
    var urlParam = req.query.url;
    var doc = {original_url : urlParam };
    var result = {original_url: null, short_url: null, error: null};
    var urlCount;
    if(validUrl.isUri(urlParam))  { //if the there is a url parameter, add to db
        
        //get url count from db when server starts
        mongo.connect(url, function(err, db) {
          if(err) throw err;

          var urls = db.collection('urls');
          urls.find().sort({_id:-1}).limit(1).toArray(function(err,documents) {
              if(err) throw err;

              // get url count
              urlCount = documents[0]["extension"] + 1;
              doc["short_url"] = 'https://' + req.get('host') + '/' + urlCount;
              doc["extension"] = urlCount;
              
              // add new item to 'urls' collection  
              urls.insert(doc, function(err,data) {
                if(err) throw err;
                result.original_url = doc.original_url;
                result.short_url = doc.short_url;
                res.send(result);
                db.close()
              });
          });
        });
    }
    else {
        result.error = "No valid url provided";
        console.log("no valid provided");
        res.send(result);    
    }
}); // app.get();

app.get('/:urlid', function(req,res){ // TODO: why is this being called every time??
    //if shortUrlId is in db, redirect to original url
    var urlid = Number(req.params["urlid"]);
    //var urlid = req.id_from_param;
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

//app.use(r);
app.listen(port, function(){
    console.log("Port listening on: " + port);
});

})();