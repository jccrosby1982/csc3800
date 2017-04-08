//SETS UP EXPRESS, REQUEST, AND BODYPARSER
var express = require('express');
var app = express();
var request = require('request');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var async = require('async');

app.set('port', process.env.PORT || 3000);
//----------------------------------------
// Base page
//-------------------------------------
app.get('/', function(req, res){
	//SENDS HELPFUL INSTRUCTIONS TO USER
	res.send('Homework 5!<br>You can use GET and POST on /movies.<br>You can also use GET, PUT, and DELETE on /movies/{movie title}.<br>You can use GET and POST to /reviews.<br>You can also use GET, PUT, and DELETE on /reviews/{uuid}.');
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
  var rqst = 'https://apibaas-trial.apigee.net/jccrosby/sandbox/movies';
	var rqst2 = 'https://apibaas-trial.apigee.net/jccrosby/sandbox/reviews';
	var newBody = {};
	var reviews = {};
	//MAKES THE REQUEST TO BAAS TO GET ALL THE MOVIES
	async.series([
		function getMovies(callback){
			request({
				url: rqst,
				method: 'GET',
				json: true
			}, function(error, response, body){
					if(error) {
						console.log(error);
						} else {
								if(body.error){
										res.status(400).json(body);
										callback();
								}else{
									newBody.status = "200";
									newBody.description = "GET successful!";
									newBody.movies = [];
									for (var x = 0 ; x < body.entities.length ; x++){
											newBody.movies.push({
													"title" : body.entities[x].name,
													"releaseDate" : body.entities[x].releaseDate,
													"actors" : body.entities[x].actors
												});
								}//end of for
								callback();
								}
							}
						});//end of request for movies
					},//end of getMovies
					function getReviews(callback){
						if(req.query.reviews == "true" || req.query.review == "true"){
						request({
							url: rqst2,
							method: 'GET',
							json: true
						}, function(error, response, body){
								if(error) {
									console.log(error);
									} else {
											if(body.error){
													res.status(400).json(body);
													callback();
											}else{
													reviews = body.entities;
											callback();
											}
										}
									});//end of request for movies
								}else{
									callback();
								}
					},
					function sendResults(callback){
						//pair up each movie with it's reviews
						if(req.query.reviews == "true" || req.query.review == "true"){
						for(var x = 0 ; x < newBody.movies.length ; x++){
							newBody.movies[x].reviews = [];
							for(var y = 0 ; y < reviews.length; y++){
								if(reviews[y].movie == newBody.movies[x].title){
									newBody.movies[x].reviews.push({
										"reviewer" : reviews[y].reviewer,
										"stars" : reviews[y].stars,
										"quote" : reviews[y].quote
									});
								}//end of if
							}//end of inner for
						}//end of outer for
					}//end of if
						res.json(newBody)
						callback();
				}//endof sendResults
				]);
});//end of GET /movies
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
	var rqst2 = "https://apibaas-trial.apigee.net/jccrosby/sandbox/reviews?ql=movie='" + req.params.name + "'";
	var newBody = {};
	//Uses series to call each function in order.
	async.series([
		function getMovie(callback){
			//Send request to BAAS to get the movie.
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
								newBody.status = "200";
								newBody.description = "GET successful!";
								newBody.name = body.entities[0].name;
								newBody.releaseDate = body.entities[0].releaseDate;
								newBody.actors = body.entities[0].actors;
								callback();
							}
						}
					});//end of request
		},
		function getReview(callback){
			//Checks to see if user wants the reviews
			//if so gets the reviews from BAAS
			//if not, it just callback to the next function.
			if(req.query.reviews == "true" || req.query.review == "true"){
					newBody.reviews = []
					//send GET request to APIGEEBAAS
					request({
						url: rqst2,
						method : 'GET',
						json: true
					}, function(error, response, body){
							if(error){
								console.log(error);
							} else {
								for (var x = 0 ; x < body.entities.length ; x++){
										newBody.reviews.push({
											"reviewer" : body.entities[x].reviewer,
											"quote" : body.entities[x].quote,
											"stars" : body.entities[x].stars
										});
								}
								callback();
							}
				});
				} else{
					callback();
				}
		},//end of getReview function
		function sendResults(callback){
			res.json(newBody);
		}
	]);//end of series
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
//----------------------------------------------
// REVIEWS SECTION
//---------------------------------------------
app.get('/reviews', function(req, res){
	var rqst = 'https://apibaas-trial.apigee.net/jccrosby/sandbox/reviews';
	var newBody = {};
	request({
		url: rqst,
		method: 'GET',
		json: true
		}, function(error, response, body){
					if(error) {
						console.log(error);
					} else {
					if(body.error){
						res.status(400).json({"status" : "400", "description" : "No reviews are in the database"});
					}else{
						newBody.status = "200";
						newBody.description = "GET successful!";
						newBody.reviews = [];
						for (var x = 0 ; x < body.entities.length ; x++){
							newBody.reviews.push({
								"movie" : body.entities[x].movie,
								"reviewer" : body.entities[x].reviewer,
								"quote" : body.entities[x].quote,
								"stars" : body.entities[x].stars,
								"UUID" : body.entities[x].uuid
							});
						}
						res.json(newBody);
					}
				}
			});//end of request
});
app.delete('/reviews', function(req,res){
	res.status(400).json({
		"status" : "400",
		"description" : "You can not delete all of the reviews. To delete a review, send a DELETE request to /reviews/{UUID}"
	});
});
app.put('/reviews', function(req,res){
	res.status(400).json({
		"status" : "400",
		"description" : "You can not send a PUT request here. To edit a review, send a PUT request to /reviews/{UUID}"
	});
});
app.post('/reviews', jsonParser, function(req, res){
	if (req.body.movie == undefined || req.body.quote == undefined || req.body.stars == undefined || req.body.reviewer == undefined){
			res.status(400).send({"status" : "400", "description" : "Not enough information needed to POST the review. Need movie, reviewer, quote and stars."});
	} else {
			request({
				 url: 'https://apibaas-trial.apigee.net/jccrosby/sandbox/reviews' ,
				 method: 'POST',
				 json: true,
				 body: {
							 "movie" : req.body.movie,
							 "reviewer" : req.body.reviewer,
							 "quote": req.body.quote,
							 "stars" : req.body.stars
								}
				 }, function(error, response, body){
							 if(error) {
										console.log(error);
										res.json(error);
							 } else {
								 if (body.error){
										res.status(400).json({"status" : "400", "description" : "Movie is already in the database"});
								 }else{
										var newBody = {};
										newBody.status = "200";
										newBody.description = "POST successful!";
										newBody.movie = body.entities[0].movie;
										newBody.reviewer = body.entities[0].reviewer;
										newBody.quote = body.entities[0].quote;
										newBody.stars = body.entities[0].stars;
										newBody.UUID = body.entities[0].uuid;
										res.json(newBody);
								 }
							 }
				});
	}
});
//------------------------------------------------------
// SPECIFIC REVIEWS part
//-------------------------------------------------------
app.get('/reviews/:uuid', function(req, res){
	var rqst = 'https://apibaas-trial.apigee.net/jccrosby/sandbox/reviews/' + req.params.uuid;
	request({
		url: rqst,
		method: 'GET',
		json : true
	},function(error, response, body){
		if(error){
			console.log(error);
			res.json(error);
		}else{
			if(body.error){
				res.status(400).json(body);
			}else{
				var newBody = {};
				newBody.status = "200";
				newBody.description = "GET Successful!";
				newBody.movie = body.entities[0].movie;
				newBody.reviewer = body.entities[0].reviewer;
				newBody.quote = body.entities[0].quote;
				newBody.stars = body.entities[0].stars;
				newBody.UUID = body.entities[0].uuid;
				res.json(newBody);
			}
		}
	});
});//end of GET
app.delete('/reviews/:uuid', function(req, res){
	var rqst = 'https://apibaas-trial.apigee.net/jccrosby/sandbox/reviews/' + req.params.uuid;
	request({
		url: rqst,
		method: 'DELETE',
		json : true
	},function(error, response, body){
		if(error){
			console.log(error);
			res.json(error);
		}else{
			if(body.error){
				res.status(400).json({"status": "400", "description" : "Cannot DELETE, movie was not found in databese."});
			}else{
				var newBody = {};
				newBody.status = "200";
				newBody.description = "DELETE Successful!";
				newBody.movie = body.entities[0].movie;
				newBody.reviewer = body.entities[0].reviewer;
				newBody.quote = body.entities[0].quote;
				newBody.stars = body.entities[0].stars;
				newBody.UUID = body.entities[0].uuid;
				res.json(newBody);
			}
		}
	});
});
app.post('/reviews/:uuid', function(req, res){
	res.status(400).json({"status":"400", "description": "You can not POST to a specific movie. Please use /reviews to POST a review."})
});
app.put('/reviews/:uuid', jsonParser, function(req,res){
	var rqst = 'https://apibaas-trial.apigee.net/jccrosby/sandbox/reviews/' + req.params.uuid;
	console.log(req.body);
	request({
		url: rqst,
		method: 'PUT',
		json: true,
		body: req.body
		}, function(error, response, body){
					if(error) {
						console.log(error);
					} else {
						if(body.error){
							res.status(400).json(body);
						}else{
							var newBody = {};
							newBody.status = "200";
							newBody.description = "PUT Successful!";
							newBody.movie = body.entities[0].movie;
							newBody.reviewer = body.entities[0].reviewer;
							newBody.quote = body.entities[0].quote;
							newBody.stars = body.entities[0].stars;
							newBody.UUID = body.entities[0].uuid;
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
