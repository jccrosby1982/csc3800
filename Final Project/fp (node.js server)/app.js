//SETS UP EXPRESS, REQUEST, STRIPE, AND BODYPARSER
var express = require('express');
var app = express();
var request = require('request');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var async = require('async');
var cors = require('cors');
//SeTUP PORT
app.set('port', process.env.PORT || 3000);

//----------------------------------------
// BASE ENDPOINT
//-------------------------------------
app.get('/', function(req, res){
	//SENDS HELPFUL INSTRUCTIONS TO USER
	res.send('Final Project API<br>You can use POST on /checkout.');
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
// USE CORS HEADERS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
//----------------------------------------------------------------------
// CHECOUT ENDPOINT
//-----------------------------------------------------------------------
app.post('/checkout', jsonParser, cors(), function(req, res){
	// MAKES SURE ALL NEEDED INFO IS SENT IN
	var geoLoc1 = {};
	var stripe1 = {};
	var temp = req.body.total;
	temp = temp * 100;
	temp = Math.trunc(temp);
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	console.log(ip);
	async.series([
		function checkPost(callback){
			if (
				req.body.fname == undefined ||
				req.body.lname == undefined ||
				req.body.email == undefined ||
				req.body.address == undefined ||
				req.body.city == undefined ||
				req.body.state == undefined ||
				req.body.postcode == undefined ||
				req.body.phone == undefined ||
				req.body.ccnum == undefined ||
				req.body.expirymonth == undefined ||
				req.body.expiryyear == undefined ||
				req.body.cvc == undefined ||
				req.body.total == undefined
			){
				res.status(400).json({"status" : "400", "description" : "Not enough information was submitted. need IP address, all personal info, all credit card info, and total purchase amount"})
			} else {
				callback();
			}
		},//end of error checking function
		function geoLoc(callback){
			// CHECKS IP ADDRESS GEOLOCATION TO ALLOW PROCCESSING OR TO REJECT PROCESSING OF PAYMENTS.
			var rqst1 = "https://ipinfo.io/" + ip + "/geo";
			request({
				url : rqst1,
				method: 'GET',
				json: true
			}, function(error, response, body){
				if (error){
					console.log(error);
					res.send(error);
				} else{
						//stores the geolocation info
						geoLoc1 = body;
						callback();
				}
			});
		},//end of geoloc function
		function storeGeo(callback){
			//create body to send to apigee
			var userGeo = {};
			userGeo.name = ip;
			userGeo.city = geoLoc1.city;
			userGeo.state = geoLoc1.region;
			userGeo.country = geoLoc1.country;
			//send it to apigee
			request({
					 url: 'https://apibaas-trial.apigee.net/jccrosby/sandbox/orders' ,
					 method: 'POST',
					 json: true,
					 body: userGeo
					 }, function(error, response, body){
								 if(error) {
											console.log(error);
								 } else {
									 if (body.error){
											//do stuff
									 }else{
										 //do stuff
									 }
								 }
					});
					//check to see if it is a CO address
					if(geoLoc1.region != "Colorado"){
						res.status(400).json({"status": "400", "description" : "The IP address is not from Colorado."});
					} else {
						callback();
					}
		},

		function stripe(callback){
			// Create a new customer and then a new charge for that customer:
			var stripe = require('stripe')('sk_test_x8bZ6h7cPHN4afnIDAR8v059');
			stripe.customers.create({
  			email: req.body.email
			}).then(function(customer){
  			return stripe.customers.createSource(customer.id, {
    			source: {
       		object: 'card',
       		exp_month: req.body.expirymonth,
       		exp_year: req.body.expiryyear,
       		number: req.body.ccnum,
       		cvc: req.body.cvc
    			}
  			});
			}).then(function(source) {
  			return stripe.charges.create({
    			amount: temp,
    			currency: 'usd',
    			customer: source.customer
  			});
			}).then(function(charge) {
  		// New charge created on a new customer
				stripe1 = charge;
				callback();
			}).catch(function(err) {
  		// Deal with an error
				res.status(400).json(err);
			});//end of Stripe module
		}//end of stripe function
	],function(err,result){
		if(err){
			res.status(500).json({"Status" : "500", "description" : "Something went wrong! Please report this error to john.crosby@ucdenver.edu"})
		} else{
			//DO STuFF with baas then return
			var final = {};
			final.status = "200";
			final.description = "Payment processes successfully!";
			final.name = stripe1.id;
			final.IP = ip;
			final.fname = req.body.fname;
			final.lname = req.body.lname;
			final.address = req.body.address;
			final.city = req.body.city;
			final.state = req.body.state;
			final.postcode = req.body.postcode;
			final.phone = req.body.phone;
			final.total = req.body.total;
			//POST to baas
			request({
	         url: 'https://apibaas-trial.apigee.net/jccrosby/sandbox/shipments' ,
	         method: 'POST',
			     json: true,
			     body: final
			     }, function(error, response, body){
	    			     if(error) {
	        		        console.log(error);
	    			     } else {
									 if (body.error){
										 	//do stuff
									 }else{
										 //do stuff
									 }
	    			     }
					});//*/
			//RETURN SOMETHING TO USER
			res.json(final);
		}//end of else
	});//end of series
});//end of POST to /checkout
//-------------------------------------
// LISTENING SERVER
//--------------------------------------
app.listen(app.get('port'), function(){
	console.log('Express started');
});
