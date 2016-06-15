const default_items_per_page = 10;
const random_data_folder = './data/random/';
const static_data_folder = './data/static/';

const express = require('express');
const R = require('ramda');

const app = express()

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
	
	const user = R.find(R.propEq('login', reg.params.login), user_credentials);
	if (user && user.password == req.params.password) {
		const user_profile = R.find(R.propEq('id', user.id), user_profiles);
		res.json(user_profile);
	} else {
		res.status(403).send('User with specified login and password is not found');
	}
})

app.get('/loads', function(req, res) {
	const loads_collection = require(random_data_folder + 'loads_summary.js');
	
	const pageNum = req.query.page_num ? req.query.page_num : 1;
	//if (pageNum === undefined) pageNum = 1;
	
	const quantity = req.query.items_per_page ? req.query.items_per_page : default_items_per_page;
	//if (quantity === undefined) quantity = 10;
	
	var res_loads = [];
	var j = 0;
	for (var i = quantity*(pageNum-1); i < quantity*(pageNum); i++) {
		res_loads[j] = loads_collection[i];
		j++;
	}

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
