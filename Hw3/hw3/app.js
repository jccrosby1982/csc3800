//SETS UP EXPRESS AND REQUEST
var express = require('express');
var app = express();
var request = require('request');

app.set('port', process.env.PORT || 3000);
//----------------------------------------
// Base page
//-------------------------------------
app.get('/', function(req, res){
	//SENDS HELPFUL INSTRUCTIONS TO USER
	res.send('Homework 3, use GET on /github or POST on /oauth');
});

//-------------------------------------
// /github
//-------------------------------------
app.get('/github', function(req, res){
	//URL FOR GITHUB
	var rqst = 'https://api.github.com/user';
	//GETS TOKEN FROM USER PASSED IN AT QUERY
	var token = 'token ' + req.query.token;
	//MAKES THE REQUEST TO GITHUB USING THE TOKEN USER PASSED IN
	request({
    url: rqst,
    method: 'GET',
		json: true,
    headers: {
        'User-Agent': 'Homework3',
				'Authorization': token
    }
		}, function(error, response, body){
    			if(error) {
        		console.log(error);
    			} else {
						//SENDS THE RESPONSE FROM GITHUB BACK TO USER
        			res.json(body);
    			}
				});

});

//-------------------------------------
// LISTENING SERVER
//--------------------------------------
app.listen(app.get('port'), function(){
	console.log('Express started');
});
