const random_data_folder = './data/random/'
const static_data_folder = './data/static/'

const attributes = require(static_data_folder + 'attributes')

var divisions = require(static_data_folder + 'divisions')
var carrierDivisions = divisions.carriers
var brokerDivisions = divisions.brokers
divisions = carrierDivisions.concat(brokerDivisions)

var loadCollection = require(random_data_folder + 'loads')

const express = require('express')
const bodyParser = require('body-parser')
const R = require('ramda')
var moment = require('moment')


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
		console.log('Signed In')
	} else {
		res.status(403).send('User with specified login and password is not found')
	}
})

app.get('/auth', function(req, res) {
	var user_profile = getUserProfile(req)

	if (user_profile)
		res.json(user_profile)
	else
		res.status(404).send('User is not found')
})

function getUserProfile(req) {
	var security_token = req.get('X-Security-Token')

	return R.find(R.propEq('securityToken', security_token), user_profiles)
}

app.post('/auth/forgot', function(req, res) {
	var email = req.body.email
	if (email)
		res.status(200).send("Restore password instructions sent to " + req.body.email)
	else
		res.status(403).send("Email for restore password instructions wasn't specified")
})

app.get('/auth/signout', function(req, res) {
	res.status(204).send('Signed out')
	console.log('Signed Out')
}) 

function getLoadSummary(load) {
	return {
			"id": load.id,
			"brokerLoadNumber": load.brokerLoadNumber,
			"carrierLoadNumber": load.carrierLoadNumber,
			"bolNumber": load.bolNumber,
			"brokerDivision": load.brokerDivision,	
			"carrierDivision": load.carrierDivision,
			"firstStop": load.stops[0],
			"lastStop": load.stops[load.stops.length - 1],
			"status": load.status,
			"loadAttributes": load.loadAttributes,
			"numberOfStops": load.stops.length,
			"brokerTenderingInfo": load.brokerTenderingInfo,
			"carrierTenderingInfo": load.carrierTenderingInfo,
			"createdDateTime": load.createdDateTime
		}
}

app.get('/loads', function(req, res) {
	var res_loads = []

	for (var i = 0; i < loadCollection.length; i++) {
		var load = loadCollection[i]
		
		res_loads[i] = getLoadSummary(load)
	} 

//filtering loads
	res_loads = res_loads.filter(function(load) {
		//division
		var divisionId = req.query.division
		var division = divisions.find(function(division){
			return division.id == parseInt(divisionId)
		})
		if (division) {
			if (division.type == 'carrier')  {
				if (load.carrierDivision && load.carrierDivision.id != division.id) return false
			}
			else {
				if (load.brokerDivision && load.brokerDivision.id != division.id) return false
			}
		}
		//status
		var statusQuery = req.query.status
		if (statusQuery) {
			var statuses = statusQuery.split(',')
			if (statuses.indexOf(load.status) == -1) return false
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
		var brokerIdsStr = req.query.broker
		if (brokerIdsStr) {
			var brokers = brokerIdsStr.split(',')
			console.log('brokers', brokers)
			if (load.brokerDivision == undefined || load.brokerDivision == null) return false
			if (brokers.indexOf(load.brokerDivision.id.toString()) == -1) return false
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
		//filter by shipping dates
		var shipping_dates = req.query.shipping_dates
		if (shipping_dates) {
			var startDateInt = new Date(shipping_dates.slice(0, shipping_dates.indexOf('-'))).getTime()
			var endDateInt = new Date(shipping_dates.slice(shipping_dates.indexOf('-') + 1, shipping_dates.length)).getTime()
			var loadDateInt = new Date(load.firstStop.date).getTime()
			if (!isDateInRange(loadDateInt, startDateInt, endDateInt)) return false
		}
		//filter by delivery dates
		var delivery_dates = req.query.delivery_dates
		if (delivery_dates) {
			var startDateInt = new Date(delivery_dates.slice(0, delivery_dates.indexOf('-'))).getTime()
			var endDateInt = new Date(delivery_dates.slice(delivery_dates.indexOf('-') + 1, delivery_dates.length)).getTime()
			var loadDateInt = new Date(load.lastStop.date).getTime()
			if (!isDateInRange(loadDateInt, startDateInt, endDateInt)) return false
		}
		//filter by Offered To Driver
		var driverOfferedQuery = req.query.driver_offered
		if (driverOfferedQuery) {
			driversOffered = driverOfferedQuery.split(',')
			var drivers = load.carrierTenderingInfo
			var i = 0;
			while (i < drivers.length && ((driversOffered.indexOf(drivers[i].id.toString()) == -1) || drivers[i].assignmentStatus != 'Offered')) { 
				i++ 
			}
			if (i == drivers.length) return false
		}
		//filter by Assigned To Driver
		var driverAssigneeQuery = req.query.driver_assignee
		if (driverAssigneeQuery) {
			var driversAssigneed = driverAssigneeQuery.split(',')
			var drivers = load.carrierTenderingInfo
			var i = 0;
			while (i < drivers.length && ((driversAssigneed.indexOf(drivers[i].id.toString()) == -1) || drivers[i].assignmentStatus != 'Assigned')) { 
				i++ 
			}
			if (i == drivers.length) return false
		}
		//filter by Assigned To Carrier
		var carrierAssigneeQuery = req.query.carrier_assignee
		if (carrierAssigneeQuery) {
			var carrierAssigned = carrierAssigneeQuery.split(',')
			var carriers = load.brokerTenderingInfo
			if (carriers == undefined || carriers == null || carriers == []) return false
			var i = 0;
			while (i < carriers.length && ((carrierAssigned.indexOf(carriers[i].id.toString()) == -1) || carriers[i].assignmentStatus != 'Assigned')) { 
				i++ 
			}
			if (i == carriers.length) return false

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

	var isOverLimit = res_loads.length > 200
	res.json({
		"loads": res_loads.slice(0, 199),
		"isOverLimit": isOverLimit	
	})
})

function processNewStops(load) {
	for (var i = 0; i < load.stops.length; i++) { 
		var tempStopId = load.stops[i]._id
		console.log('processing of temp stop id', tempStopId)
		if (tempStopId) {
			var newStopId = load.id * 10 + i
			for (var j = 0; j < load.shipments.length; j++) {
				if (load.shipments[j].pickup == tempStopId) {
					load.shipments[j].pickup = newStopId
				}
				if (load.shipments[j].dropoff == tempStopId) {
					load.shipments[j].dropoff = newStopId
				}
			}
			load.stops[i].id = newStopId	
		} else if (!load.stops[i].id) {
			res.status(403).send('Stop id is missed')
		} 
	}

	for (var i = 0; i < load.shipments.length; i++) {
		load.shipments[i].id = load.id * 100 + i
		console.log('shipment id', load.shipments[i].id)
		for (var j = 0; j < load.shipments[i].packages.length; j++) {
			load.shipments[i].packages[j].id = load.shipments[i].id * 1000 + j
		}
		for (var k = 0; k < load.shipments[i].orders.length; k++) {
			load.shipments[i].orders[k].id = load.shipments[i].id * 100 + k
		}
	}
}

app.post('/loads', function(req, res) {
	var load = req.body
	load.id = loadCollection[loadCollection.length - 1].id + 1	
	load.status = 'Available'
	load.createdDateTime = moment()

	processNewStops(load)

	load.carrierTenderingInfo = []
	load.brokerTenderingInfo = []
	loadCollection.push(load)
	console.log('new load id', load.id)
	console.log('updated number of loads', loadCollection.length)
	res.json(load)
})

app.put('/loads/:id', function(req, res) {
	var loadId = req.params.id
	var loadNum = loadCollection.findIndex(function(load) {
		return load.id == parseInt(loadId)
	})

	if (loadNum) {
		var updatedLoad = req.body

		processNewStops(updatedLoad)

		loadCollection[loadNum] = updatedLoad		
		res.json(updatedLoad)
	}
	else {
		res.status(404).send("Load ID=" + loadId + " is not found")
	}
})

app.post('/loads/clone', function(req, res) {
	var loadId = req.body.load_id
	
	var clonedLoad =  JSON.parse(JSON.stringify(R.find(R.propEq('id', parseInt(loadId)), loadCollection)))
	clonedLoad.id = loadCollection[loadCollection.length - 1].id + 1
	clonedLoad.status = 'Available'
	clonedLoad.createdDateTime = moment()

	clonedLoad.carrierTenderingInfo = []
	clonedLoad.brokerTenderingInfo = []
	loadCollection.push(clonedLoad)

	res.json(clonedLoad)
})

app.delete('/loads/:id', function(req, res) {
	var loadId = req.params.id
	var loadNum = loadCollection.findIndex(function(load) {
		return load.id == parseInt(loadId)
	})
	console.log('loadnum', loadNum)
	if (loadNum) {
		loadCollection.splice(loadNum, 1)
		res.status(204).send("Load ID=" + loadId + " was deleted")
	} 
	else {
		res.status(404).send("Load ID=" + loadId + " is not found")
	}
})

app.get('/loads/:id', function(req, res) {


	//ToDo: this is WA for problem with unexpectedly generated stop.id
	var load = R.find(R.propEq('id', parseInt(req.params.id)), loadCollection)
	
	console.log('before WA', load.stops)

	for (var i = 0; i < load.stops.length; i++) {
			load.stops[i].id = load.stops[i].stop_id
			//delete load.stops[i].stop_id
	}

	console.log('after WA', load.stops)


	if (load)
		res.json(load)
	else 
		res.status(404).send("Load ID = " + req.params.id + " is not found")
})

app.get('/loads/:id/summary', function(req, res) {
	var load = R.find(R.propEq('id', parseInt(req.params.id)), loadCollection)

	if (load)
		res.json(getLoadSummary(load))
	else 
		res.status(404).send("Load ID = " + req.params.id + " is not found")
})

app.put('/loads/:id/carriertendering', function(req, res) {
	console.log('carrier tendering update for load id=', req.params.id)
	var load = R.find(R.propEq('id', parseInt(req.params.id)), loadCollection)

	console.log('updated tendering info', req.body)
	load.carrierTenderingInfo = req.body

	res.json(getLoadSummary(load))
})

app.put('/loads/:id/brokertendering', function(req, res) {
	var load = R.find(R.propEq('id', parseInt(req.params.id)), loadCollection)

	load.brokerTenderingInfo = req.body

	res.json(getLoadSummary(load))
})

app.put('/loads/:id/changeownership', function(req, res) {	
	var loadId = req.params.id
	var loadIndex = loadCollection.findIndex(function(load) {
			return load.id == parseInt(loadId)
		})
	var load = loadCollection[loadIndex]

	if (load) {
		var newDivision = divisions.find(function(division) {
			return division.id == parseInt(req.body.divisionId)
		})
		newDivision.subordinates = undefined
		if (newDivision) {
			if (newDivision.type == 'broker') {
				load.brokerDivision = newDivision
				load.brokerTenderingInfo = []
			}
			else {
				load.carrierDivision = newDivision
				load.carrierTenderingInfo = []
			}

			res.json(load)
		}
		else res.status(404).send("Target division ID = " + req.body.divisionId + " is not found")
	}
	else res.status(404).send("Load ID = " + req.params.id + " is not found")

})

app.get('/divisions/:id/drivers', function(req, res) {
	var divisionId = req.params.id
	var division = divisions.find(function(division){
			return division.id == parseInt(divisionId)
		})	
	if (division.type == 'carrier')
		res.json(division.subordinates)
	else
		res.status(403).send('Only Carrier Divisions are supported')
})

const addresses_collection = require(random_data_folder + 'addresses')
app.get('/divisions/:id/addresses', function(req, res) {
	var resAddresses = addresses_collection

	console.log('addresses quantity', resAddresses.length)

	var address_entry = req.query.address_entry
	var lastId = req.query.lastid
	var quantity = parseInt(req.query.quantity)


	if (address_entry) {
		resAddresses = resAddresses.filter(function(address) {
			var addressString = JSON.stringify(address)
			return (addressString.toLowerCase().indexOf(address_entry.toLowerCase()) > -1)	
		})		
	}

	console.log('number of addresses after filtering', resAddresses.length)

	var resAddresses1 = resAddresses 
	if (lastId && quantity) {
		var startAddress = resAddresses.findIndex(function(address) {
				return address.id == parseInt(lastId ) + 1
			})
		console.log('requested start address position', startAddress)
		console.log('requested quantity', quantity)

		if (startAddress > 0) {
			resAddresses1 = resAddresses.slice(startAddress, startAddress + quantity)
			console.log('resAddresses1', resAddresses1.length)
			if (startAddress + quantity > resAddresses.length)	{
				resAddresses1 = resAddresses1.concat(resAddresses.slice(0, (startAddress + quantity - resAddresses.length )))
				console.log('resAddresses1 after append', resAddresses1.length)

			} 
		} else {
			resAddresses1 = resAddresses.slice(0, quantity)	
		}
	}
	
	console.log('returned number of addresses', resAddresses1.length)

	res.json(resAddresses1)
})

app.get('/loadattributes', function(req, res) {
	res.json(attributes)
})	

app.get('/divisions/:id/brokers', function(req, res) {
	var brokerDivisionSummary  = []
	for (var i = 0; i < brokerDivisions.length; i++) {
		brokerDivisionSummary.push(
			{
				"id": brokerDivisions[i].id,
				"name": brokerDivisions[i].name
			}
		)
	}
	res.json(brokerDivisionSummary)
})

// Load Sharing
app.get('/loads/:id/share', function(req, res) {
	var loadId = req.params.id
	res.json(
		{
			"link": '/share/' + btoa(loadId)
		}
	)
})

app.put ('/loads/:id/share', function(req, res) {
	res.status(200).send('OK')
})

function atob(str) {
  return new Buffer(str, 'base64').toString('binary');
}

function btoa(str) {
    var buffer;

    if (str instanceof Buffer) {
      buffer = str;
    } else {
      buffer = new Buffer(str.toString(), 'binary');
    }

    return buffer.toString('base64');
}

app.get('/share/:id', function(req, res) {
	var loadId = atob(req.params.id)

	var load = R.find(R.propEq('id', parseInt(loadId)), loadCollection)
	
	if (load)
		res.json(load)
	else 
		res.status(404).send("Load is not found")
})

/*
	Load Notification Settings
*/
const events = require(static_data_folder + 'events')
var loadNotificationSubscribers = []

app.get('/loads/:id/notifications', function(req, res) {
	var loadId = req.params.id
	console.log('Notifications requested for load id=', loadId)
	var loadSettings = loadNotificationSubscribers.find(function(settings) {
		return loadId == settings.id
	})

	console.log('settings for load', loadSettings)

	if (!loadSettings) {
		res.json({
			"events": events,
			"subscribers": []
		})
	} else {
		res.json({
			"events": events,
			"subscribers": loadSettings.subscribers
		})
	}
})

app.put('/loads/:id/notifications', function(req, res) {
	var loadId = req.params.id
	var subscribers = req.body
	console.log('Updating notification subscribers for load id=', loadId)

	var settingsIndex = loadNotificationSubscribers.findIndex(function(loadSettings) {
		return loadId ==loadSettings.id
	})

	if (settingsIndex == -1) {
		var newSettings = {}
		newSettings.id = loadId
		newSettings.subscribers = subscribers
		loadNotificationSubscribers.push(newSettings)
	} else {
		loadNotificationSubscribers[settingsIndex].subscribers = subscribers
	}

	res.status(200).send('OK')
})

/*
	Load Messages
*/
const loadMessages = require(static_data_folder + 'loadMessages')

app.get('/loads/:id/messages', function(req, res) {
	res.json(loadMessages)
})

/* 
	Load Breadcrumbs
*/
const breadcrumbs = require(static_data_folder + 'breadcrumbs')

app.get('/loads/:id/breadcrumbs', function(req, res) {
	console.log('requested number of breadcrumbs', breadcrumbs.length)
	res.json(breadcrumbs)
})

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'))
})

function isDateInRange(targetDate, oneDate, secondDate) {
	//console.log('isDateInRange ' + targetDate + ' ' + oneDate + ' ' + secondDate)
	var startDate = oneDate < secondDate ? oneDate : secondDate
	var endDate = oneDate > secondDate ? oneDate : secondDate
	
	return targetDate >= startDate && targetDate <= endDate
}
