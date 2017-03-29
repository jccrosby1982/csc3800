//SETS UP EXPRESS, REQUEST, AND BODYPARSER
var express = require('express');
var app = express();
var request = require('request');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();


app.set('port', process.env.PORT || 3000);
//----------------------------------------
// Base page
//-------------------------------------
app.get('/', function(req, res){
	//SENDS HELPFUL INSTRUCTIONS TO USER
	res.send('Homework 4!<br>You can use GET and POST on /movies<br>You can also use GET, PUT, and DELETE on /movies/{movie title}');
});
//ERROR MESSAGES FOR POST, PUT, DELETE
app.post('/', function(req,res){
  res.status(400).send({"status" : "400", "description" : "You can not send a POST here, use GET for more info."});
});
app.put('/', function(req,res){
  res.status(400).send({"status" : "400", "description" : "You can not send a PUT here, use GET for more info"});
});
app.delete('/', function(req, res){
  res.status(400).send({"status" : "400", "description" : "You can not send a DELETE here, use GET for more info"});
});
//----------------------------------------------
// /movies page
//----------------------------------------------
app.get('/movies', function(req, res){
  var rtrn = "";
  var rqst = 'https://apibaas-trial.apigee.net/jccrosby/sandbox/movies';
	//MAKES THE REQUEST TO BAAS TO GET ALL THE MOVIES
	request({
    url: rqst,
    method: 'GET',
		json: true
		}, function(error, response, body){
    			if(error) {
        		console.log(error);
    			} else {
						if(body.error){
							res.status(400).json(body)
						}else{
            	for (var x = 0 ; x < body.entities.length ; x++){
                delete body.entities[x].uuid;
                delete body.entities[x].type;
                delete body.entities[x].metadata;
                delete body.entities[x].created;
                delete body.entities[x].modified;
							}
            }
						var newBody = {};
						newBody.status = "200";
						newBody.description = "GET successful!";
						newBody.movies = body.entities;
            res.json(newBody);
    			}
				});
});
app.post('/movies', jsonParser, function(req, res){
		if (req.body.name == undefined || req.body.releaseDate == undefined || req.body.actors == undefined){
        res.status(400).send({"status" : "400", "description" : "Not enough information needed to POST the movie. Need name, releaseDate, and actors[]."});
    } else {
		    request({
	         url: 'https://apibaas-trial.apigee.net/jccrosby/sandbox/movies' ,
	         method: 'POST',
			     json: true,
			     body: {
				         "name" : req.body.name,
				         "releaseDate" : req.body.releaseDate,
				         "actors": req.body.actors
			            }
			     }, function(error, response, body){
	    			     if(error) {
	        		        console.log(error);
	    			     } else {
									 if (body.error){
										 	res.status(400).json({"status" : "400", "description" : "Movie is already in the database"});
									 }else{
										 	var newBody = {};
			 								newBody.status = "200";
			 								newBody.description = "POST successful!";
			 								newBody.name = body.entities[0].name;
			 								newBody.releaseDate = body.entities[0].releaseDate;
			 								newBody.actors = body.entities[0].actors;
			 								res.json(newBody);
									 }
	    			     }
					});
    }
});
//ERROR MESSAGES FOR PUT AND DELETE
app.put('/movies', function(req,res){
  res.status(400).json({"status" : "400", "description" : "You can not PUT to /movies. Use /movies/{name} instead."});
});
app.delete('/movies', function(req, res){
  res.status(400).json({"status" : "400", "description" : "You can not DELETE all my movies. Are you crazy?!?!"});
});
//----------------------------------------
// Specific Movie part
//---------------------------------------
app.get('/movies/:name', function(req, res){
	var rqst = 'https://apibaas-trial.apigee.net/jccrosby/sandbox/movies/' + req.params.name;
	request({
		url: rqst,
		method: 'GET',
		json: true
		}, function(error, response, body){
					if(error) {
						console.log(error);
					} else {
          if(body.error){
            res.status(400).json({"status" : "400", "description" : "Movie is not in the database"});
          }else{
						var newBody = {};
						newBody.status = "200";
						newBody.description = "GET successful!";
						newBody.name = body.entities[0].name;
						newBody.releaseDate = body.entities[0].releaseDate;
						newBody.actors = body.entities[0].actors;
						res.json(newBody);
					}
        }
      });
});
app.put('/movies/:name', jsonParser, function(req,res){
	var rqst = 'https://apibaas-trial.apigee.net/jccrosby/sandbox/movies/' + req.params.name;
	request({
		url: rqst,
		method: 'PUT',
		json: true,
		body: {
			"name" : req.body.name,
			"releaseDate" : req.body.releaseDate,
			"actors": req.body.actors
		}
		}, function(error, response, body){
					if(error) {
						console.log(error);
					} else {
						if(body.error){
							res.status(400).json(body);
						}else{
							res.json({"status" : "200", "description" : "PUT successful"});
						}
					}
				});
});
app.post('/movies/:name', function(req,res){
	var err1 = "You can not send a POST request to /movies/" + req.params.name;
  res.status(400).json({"status" : "400", "description" : err1});
});
app.delete('/movies/:name', function(req,res){
	var rqst = 'https://apibaas-trial.apigee.net/jccrosby/sandbox/movies/' + req.params.name;
	request({
		url: rqst,
		method: 'DELETE',
		json: true,
		}, function(error, response, body){
					if(error) {
						console.log(error);
					} else {
						if(body.error){
								res.status(400).json({"status" : "400", "description" : "Movie is not in the database"});
						}else{
							var newBody = {};
							newBody.status = "200";
							newBody.description = "DELETE successful!";
							newBody.name = body.entities[0].name;
							newBody.releaseDate = body.entities[0].releaseDate;
							newBody.actors = body.entities[0].actors;
							res.json(newBody);
						}
					}
				});
});
//-------------------------------------
// LISTENING SERVER
//--------------------------------------
app.listen(app.get('port'), function(){
	console.log('Express started');
});
