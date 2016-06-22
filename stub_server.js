const random_data_folder = './data/random/'
const static_data_folder = './data/static/'

var divisions = require(static_data_folder + 'divisions')
divisions = divisions.carriers.concat(divisions.brokers)
const loads_collection = require(random_data_folder + 'loads_summary.js')


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
	var res_loads = loads_collection


//filtering loads
	res_loads = loads_collection.filter(function(load) {
		//division
		var divisionId = req.query.division
		var division = divisions.find(function(division){
			return division.id == parseInt(divisionId)
		})
		if (division) {
			if (division.type == 'carrier')  {
				if (load.carrierDivision.id != division.id) return false
			}
			else {
				if (load.brokerDivision.id != division.id) return false
			}
		}
		//status
		var status = req.query.status
		if (status) {
			if (load.status != status) return false
		}
		// filter by attributes
		var attributes = req.query.attributes
		if (attributes) {
			var attrsString = load.brokerLoadNumber + ' ' + load.carrierLoadNumber + ' ' + load.bolNumber
			for (var i = 0; i < load.loadAttributes.length; i++) {
				attrsString += ' ' + load.loadAttributes[i].value
			}
			if (attrsString.includes(attributes) == false) return false
		}
		// filter by broker
		var broker = req.query.broker
		if (broker) {
			if (load.brokerDivision.id != parseInt(broker)) return false
		}
		//filter by origin state
		var origin_state = req.query.origin_state
		if (origin_state) {
			if (load.firstStop.state != origin_state) return false
		}
		//filter by origin city
		var origin_city = req.query.origin_city
		if (origin_city) {
			load.firstStop.city == origin_city
		}
		//filter by destination state
		var destination_state = req.query.destination_state
		if (destination_state) {
			if (load.lastStop.state != destination_state) return false
		}
		//filter by destination city
		var destination_city = req.query.destination_city
		if (destination_city) {
			if (load.lastStop.city == destination_city) return false
		}
		return true
	})

//sort loads
	var sort_by = req.query.sort_by
	var sort_type = req.query.sort_type

	if (sort_by != 'shipping' && sort_by != 'delivery') 
		sort_by = 'shipping';
	console.log("sort_by and sort_type", sort_by + ' ' + sort_type)
	res_loads = res_loads.sort(function(load1, load2) {
		var date1
		var date2
		if (sort_by == 'shipping') {
			date1 = new Date(load1.firstStop.date)
			date2 = new Date(load2.firstStop.date)
		} else {
			date1 = new Date(load1.lastStop.date)
			date2 = new Date(load2.lastStop.date)
		}


		if (sort_type == 'asc') {
			return date1.getTime() - date2.getTime()
		} else {
			return date2.getTime() - date1.getTime()
		}
	})

	console.log('filtered number of loads', res_loads.length)

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
