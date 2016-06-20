const random_data_folder = './data/random/'
const static_data_folder = './data/static/'

var divisions = require(static_data_folder + 'divisions')
divisions = divisions.carriers.concat(divisions.brokers)

const express = require('express')
const bodyParser = require('body-parser')
const R = require('ramda')


const app = express()
app.use(bodyParser.json()) // for parsing application/json

app.set('port', (process.env.PORT || 5000))


app.use(function(req, res, next) {
	// Website you wish to allow to connect
	res.setHeader('Access-Control-Allow-Origin', '*')

	// Request methods you wish to allow
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')

	// Request headers you wish to allow
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, X-Security-Token')

	// Set to true if you need the website to include cookies in the requests sent
	// to the API (e.g. in case you use sessions)
	res.setHeader('Access-Control-Allow-Credentials', true)

	// Pass to next layer of middleware
	next()	
}) 

app.get('/', function (req, res) {
 	res.redirect('/loads')
})

const users = require(static_data_folder + 'users.js')
const user_profiles = users.profiles
const user_credentials = users.credentials

app.post('/auth/signin', function (req, res) {
	var user = R.find(R.propEq('login', req.body.login), user_credentials)
	if (user && user.password == req.body.password) {
		var user_profile = R.find(R.propEq('id', user.id), user_profiles)

		res.json(user_profile)
	} else {
		res.status(403).send('User with specified login and password is not found')
	}
})

app.get('/auth', function(req, res) {
	var security_token = req.get('X-Security-Token')

	console.log('security_token', security_token)

	var user_profile = R.find(R.propEq('securityToken', security_token), user_profiles)
	if (user_profile)
		res.json(user_profile)
	else
		res.status(404).send('User is not found')
})


app.get('/loads', function(req, res) {
	const loads_collection = require(random_data_folder + 'loads_summary.js')
	var divisionId = req.query.division
	var division = divisions.find(function(division){
		return division.id == parseInt(divisionId)
	})

	console.log('division', division)

	var res_loads 
// filter by division
	if (division)
		res_loads = loads_collection.filter(function (load) {
			if (division.type == 'carrier')  
				return load.carrierDivision.id == parseInt(divisionId)
			else 
				return load.brokerDivision.id == parseInt(divisionId)
		});
	else
		res_loads = loads_collection
// filter by status

	res.json(res_loads)
})

app.get('/loads/:id', function(req, res){
	const loads_collection = require(random_data_folder + 'loads.js')
	const load = R.find(R.propEq('id', parseInt(req.params.id)), loads_collection)
	
	if (load)
		res.json(load)
	else 
		res.status(404).send("Load ID = " + req.params.id + " is not found")
})

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'))
})
