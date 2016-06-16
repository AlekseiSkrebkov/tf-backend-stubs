const default_items_per_page = 10;
const random_data_folder = './data/random/';
const static_data_folder = './data/static/';

const express = require('express');
const bodyParser = require('body-parser');
const R = require('ramda');
const common_tools = require('./data/common');


const app = express()
app.use(bodyParser.json()); // for parsing application/json

app.set('port', (process.env.PORT || 5000));


app.use(function(req, res, next) {
	// Website you wish to allow to connect
	res.setHeader('Access-Control-Allow-Origin', '*')

	// Request methods you wish to allow
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')

	// Request headers you wish to allow
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type')

	// Set to true if you need the website to include cookies in the requests sent
	// to the API (e.g. in case you use sessions)
	res.setHeader('Access-Control-Allow-Credentials', true)

	// Pass to next layer of middleware
	next()	
}) 

app.get('/', function (req, res) {
 	res.redirect('/loads');
});

app.post('/auth/signin', function (req, res) {
	const users = require(static_data_folder + 'users.js');
	const user_credentials = users.credentials;
	const user_profiles = users.profiles;

	const user = R.find(R.propEq('login', req.body.login), user_credentials);
	if (user && user.password == req.body.password) {
		var user_profile = R.find(R.propEq('id', user.id), user_profiles);
		user_profile.security_token = common_tools.guid()
		console.log('user_profile', user_profile)
		res.json(user_profile);
	} else {
		res.status(403).send('User with specified login and password is not found');
	}
})


app.get('/loads', function(req, res) {
	const loads_collection = require(random_data_folder + 'loads_summary.js');
	const division = req.query.division;

	var res_loads 
// filter by division
	if (division)
		res_loads =	res_loads = R.filter(R.propEq('division', parseInt(division)), loads_collection);
	else
		res_loads = loads_collection;
// filter by status
	


	res.json(res_loads);
});

app.get('/loads/:id', function(req, res){
	const loads_collection = require(random_data_folder + 'loads.js');
	const load = R.find(R.propEq('id', parseInt(req.params.id)), loads_collection);
	
	if (load)
		res.json(load);
	else 
		res.status(404).send("Load ID = " + req.params.id + " is not found");
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
