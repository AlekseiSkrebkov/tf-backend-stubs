const random_data_folder = './data/random/'
const static_data_folder = './data/static/'

const tools = require('./services/common')


const attributes = require(static_data_folder + 'attributes')

var divisionsRepository = require(static_data_folder + 'divisions')
var carrierDivisions = divisionsRepository.carriers
var brokerDivisions = divisionsRepository.brokers
divisions = carrierDivisions.concat(brokerDivisions)

var loadCollection = require(random_data_folder + 'loads')
const breadcrumbs = require(static_data_folder + 'breadcrumbs')

const loadsService = require('./services/loadsService')
const divisionsService = require('./services/divisionsService')



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

app.use(function(req, res, next) {
	var userProfile = getUserProfile(req)
	var originalUrl = req.originalUrl
	if (originalUrl.indexOf('?') >=0)
		originalUrl = req.originalUrl.substring(0, originalUrl.indexOf('?'))
	var method = req.method

	var noAuthURLs = ['/', '/auth/signin', '/auth/resetpassword']

	console.log('test URL', originalUrl)

	if (method != 'OPTIONS' && noAuthURLs.indexOf(originalUrl) == -1 && userProfile == undefined)
		res.status(401).send("Token is expired")
	else
		next()
})

app.get('/', function (req, res) {
 	res.status(200).send("ok")
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

const mailService = require('./services/mailService')

app.post('/auth/resetpassword', function(req, res) {
	var email = req.body.email

	var userIndex = user_profiles.findIndex(function(userProfile) {
		return userProfile.email == email
	})
	var passToken = tools.guid()
	user_profiles[userIndex].passToken = passToken

	mailService.sendPasswordRestoreLink(email, req.baseUrl + '//auth/resetpassword?passToken=' + passToken)

	if (userIndex >= 0)
		res.status(200).send("Restore password instructions sent to " + email)
	else
		res.status(400).send(composeBadRequestError("User with specified email is not found"))
})


app.put('/auth/resetpassword', function(req, res) {
	var token = req.query.passToken

	var userIndex = user_profiles.findIndex(function(userProfile) {
		return userProfile.passToken == token
	})

	if (userIndex >=0) {
		var newPassword = req.body.password
		user_credentials[userIndex].password = newPassword

		res.status(200).send("Password updated")
	}
	else {
		res.status(401).send("Password restore token is expired")
	}
})

app.get('/auth/signout', function(req, res) {
	res.status(204).send('Signed out')
	console.log('Signed Out')
}) 


app.get('/loads', function(req, res) {
	var res_loads = []

	for (var i = 0; i < loadCollection.length; i++) {
		var load = loadCollection[i]
		
		res_loads[i] = loadsService.getLoadSummary(load)
	} 

//filtering loads
	res_loads = res_loads.filter(function(load) {
		//division
		var divisionId = req.query.division
		if (!divisionId) {
			res.status(400).send(composeBadRequestError("Division ID is  required parameter for List Loads request"))
			return
		}

		var division = divisionsService.getDivisionById(divisionId)
		if (division) {
			if (division.type == 'carrier')  {
				if (!load.carrierDivision) 
					return false 
				else if (load.carrierDivision.id != division.id) 
					return false
			}
			else {
				if (!load.brokerDivision) 
					return false 
				else if (load.brokerDivision.id != division.id) 
					return false			}
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
			if (load.brokerDivision == undefined || load.brokerDivision == null) return false
			if (brokers.indexOf(load.brokerDivision.id.toString()) == -1) return false
		}
		//filter by origin state
		var origin_state = req.query.originState
		if (origin_state) {
			if (load.firstStop.state != origin_state) return false
		}
		//filter by origin city
		var origin_city = req.query.originCity
		if (origin_city) {
			load.firstStop.city == origin_city
		}
		//filter by destination state
		var destination_state = req.query.destinationState
		if (destination_state) {
			if (load.lastStop.state != destination_state) return false
		}
		//filter by destination city
		var destination_city = req.query.destinationCity
		if (destination_city) {
			if (load.lastStop.city == destination_city) return false
		}
		//filter by shipping dates
		var shipping_dates = req.query.shippingDates
		if (shipping_dates) {
			var startDateInt = new Date(shipping_dates.slice(0, shipping_dates.indexOf('-'))).getTime()
			var endDateInt = new Date(shipping_dates.slice(shipping_dates.indexOf('-') + 1, shipping_dates.length)).getTime()
			var loadDateInt = new Date(load.firstStop.date).getTime()
			if (!tools.isDateInRange(loadDateInt, startDateInt, endDateInt)) return false
		}
		//filter by delivery dates
		var delivery_dates = req.query.deliveryDates
		if (delivery_dates) {
			var startDateInt = new Date(delivery_dates.slice(0, delivery_dates.indexOf('-'))).getTime()
			var endDateInt = new Date(delivery_dates.slice(delivery_dates.indexOf('-') + 1, delivery_dates.length)).getTime()
			var loadDateInt = new Date(load.lastStop.date).getTime()
			if (!tools.isDateInRange(loadDateInt, startDateInt, endDateInt)) return false
		}
		//filter by Offered To Driver
		var driverOfferedQuery = req.query.driverOffered
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
		var driverAssigneeQuery = req.query.driverAssignee
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
		var carrierAssigneeQuery = req.query.carrierAssignee
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
	var sort_by = req.query.sortBy
	var sort_type = req.query.sortType

	if (sort_by != 'shipping' && sort_by != 'delivery') 
		sort_by = 'shipping';
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

app.post('/loads', function(req, res) {
	var load = req.body

	var errors = loadsService.validateLoad(load)
	if (errors.length > 0) {
		res.status(400).send(composeValidationError("Validation of load parameters failed", errors))
		return
	}
	
	load.id = loadCollection[loadCollection.length - 1].id + 1	
	load.status = 'Available'
	load.createdDateTime = moment()

	loadsService.processNewStops(load)

	load.carrierTenderingInfo = []
	load.brokerTenderingInfo = []
	loadCollection.push(load)

	res.json(load)
})

app.put('/loads/:id', function(req, res) {
	var loadId = req.params.id
	console.log('Updating load id=', loadId)
	var loadNum = loadCollection.findIndex(function(load) {
		return load.id == parseInt(loadId)
	})

	if (loadNum >= 0) {
		var updatedLoad = req.body
		
		var errors = loadsService.validateLoad(updatedLoad)
		if (errors.length > 0) {
			res.status(400).send(composeValidationError("Validation of load parameters failed", errors))
			return
		}

		loadsService.processNewStops(updatedLoad)

		var targetLoad = loadCollection[loadNum]
		for (var attrname in updatedLoad) { targetLoad[attrname] = updatedLoad[attrname]; }
		res.json(targetLoad)
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
	//load.breadcrumbs = undefined
	
	if (load) {

		console.log('before WA', load.stops)

		for (var i = 0; i < load.stops.length; i++) {
				load.stops[i].id = load.stops[i].stop_id
				//delete load.stops[i].stop_id
		}

		console.log('after WA', load.stops)

		res.json(load)
	}	
	else 
		res.status(404).send("Load ID = " + req.params.id + " is not found")
})

app.get('/loads/:id/summary', function(req, res) {
	var load = R.find(R.propEq('id', parseInt(req.params.id)), loadCollection)

	if (load)
		res.json(loadsService.getLoadSummary(load))
	else 
		res.status(404).send("Load ID = " + req.params.id + " is not found")
})

app.put('/loads/:id/carriertendering', function(req, res) {
	console.log('carrier tendering update for load id=', req.params.id)
	var load = R.find(R.propEq('id', parseInt(req.params.id)), loadCollection)

	if (!load) {
		res.status(404).send("Load ID = " + req.params.id + " is not found")
	} else {
		var receivedTenderingUpdate = req.body

		for (var i = 0; i < receivedTenderingUpdate.length; i++) {
			if (!receivedTenderingUpdate[i].name) {
				var division = divisionsRepository.getCarrierDivisionById(load.carrierDivision.id)
				var driver = divisionsRepository.getSubordinateById(division, receivedTenderingUpdate[i].id) 
				receivedTenderingUpdate[i].name = driver.name
			}
		}

		load.carrierTenderingInfo = receivedTenderingUpdate
	}

	res.json(load.carrierTenderingInfo)
})

app.put('/loads/:id/brokertendering', function(req, res) {
	console.log('broker tendering update for load id=', req.params.id)
	var load = R.find(R.propEq('id', parseInt(req.params.id)), loadCollection)

	if (!load) {
		res.status(404).send("Load ID = " + req.params.id + " is not found")
	} else {
		var receivedTenderingUpdate = req.body

		for (var i = 0 ; i < receivedTenderingUpdate.length; i++) {
			if (!receivedTenderingUpdate[i].name) {
				var division = divisionsRepository.getBrokerDivisionById(load.brokerDivision.id)
				var carrier = divisionsRepository.getSubordinateById(division, receivedTenderingUpdate[i].id) 
				receivedTenderingUpdate[i].name = carrier.name
			}
		}

		load.brokerTenderingInfo = receivedTenderingUpdate		
	}

	res.json(load.brokerTenderingInfo)
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
		newDivision.relations = undefined
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


/*
	Division resources
*/

app.get('/divisions/:id', function(req, res) {
	var division = divisionsRepository.getDivisionById(req.params.id)
	res.json(division)
})

app.get('/divisions/:id/drivers', function(req, res) {
	var divisionId = req.params.id
	var division = divisions.find(function(division){
			return division.id == parseInt(divisionId)
		})	
	if (division.type == 'carrier') {
		var driversSummary = []
		for (var i = 0; i < division.relations.length; i++) {
			var driver = division.relations[i]
			driversSummary.push({
				"id": driver.id,
				"name": driver.name,
				"email": driver.email,
				"driverId": driver.driverId,
				"isFavorite": driver.isFavorite
			})
		}
		res.json(driversSummary)
	}
	else
		res.status(403).send('Only Carrier Divisions are supported')
})

app.get('/divisions/:id/carriers', function(req, res) {
	var divisionId = req.params.id
	var division = divisions.find(function(division){
			return division.id == parseInt(divisionId)
		})	

	if (division.type == 'broker') {
		var carriers = division.relations
		for (var i = 0; i < carriers.length; i++) {
			carriers[i].relations = undefined
		} 
		res.json(carriers)
	}
	else
		res.status(403).send('Only Broker Divisions are supported')
})

const addresses_collection = require(random_data_folder + 'addresses')
app.get('/divisions/:id/addresses', function(req, res) {
	var resAddresses = addresses_collection

	var address_entry = req.query.addressEntry
	var lastId = req.query.lastid
	var quantity = parseInt(req.query.quantity)


	if (address_entry) {
		resAddresses = resAddresses.filter(function(address) {
			var addressString = JSON.stringify(address)
			return (addressString.toLowerCase().indexOf(address_entry.toLowerCase()) > -1)	
		})		
	}

	var resAddresses1 = resAddresses 
	if (lastId && quantity) {
		var startAddress = resAddresses.findIndex(function(address) {
				return address.id == parseInt(lastId ) + 1
			})

		if (startAddress > 0) {
			resAddresses1 = resAddresses.slice(startAddress, startAddress + quantity)
			if (startAddress + quantity > resAddresses.length)	{
				resAddresses1 = resAddresses1.concat(resAddresses.slice(0, (startAddress + quantity - resAddresses.length )))

			} 
		} else {
			resAddresses1 = resAddresses.slice(0, quantity)	
		}
	}
	
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

app.put('/divisions/:id/favorites', function(req, res) {
	var divisionRelations = divisionsRepository.getDivisionById(req.params.id).relations
	console.log('updating division relations list', divisionRelations)
	var updatedRelations = req.body

	for (var i = 0; i < updatedRelations; i++) {
		var relationIndex = divisionRelations.findIndex(function(relation) {
			relation.id == updatedRelations[i].relationId
		})
		console.log('updating relation', divisionRelations[relationIndex])

		divisionRelations[relationIndex].isFavorite = updatedRelations[i].isFavorite 	
	}
	res.status(200).send('OK')
})

// Load Sharing
app.get('/loads/:id/share', function(req, res) {
	var loadId = req.params.id
	res.json(
		{
			"link": '/share/' + tools.btoa(loadId)
		}
	)
})

app.put ('/loads/:id/share', function(req, res) {
	res.status(200).send('OK')
})

app.get('/share/:id', function(req, res) {
	var loadId = tools.atob(req.params.id)

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
app.get('/loads/:id/breadcrumbs', function(req, res) {
	var loadId = req.params.id
	var load = loadCollection.find(function(load) {
		return load.id == parseInt(loadId)
	})

	res.json(load.breadcrumbs)
})

/*
	Home Page
*/
const statistics = require(static_data_folder + 'statistics')

app.get('/statistics', function(req, res) {
	res.json(statistics)
})

app.get('/mappoints', function(req, res) {
	var divisionId = req.query.division

	var status = req.query.status
	var shippingDates = req.query.shippingDatesRange
	var deliveryDates = req.query.deliveryDatesRange

	var loads = loadsService.getMappointsByDivision(divisionId, status, shippingDates, deliveryDates)

	res.json(loads)

})

app.get('/divisions/:divisionId/drivers/:driverId', function(req, res) {
	var divisionId = req.params.divisionId
	var driverId = req.params.driverId

	var driver = divisionsService.getDriver(divisionId, driverId)

	res.json(driver)
})

/*
	Messaging
*/
var messagingService = require('./services/messagesService')

app.get('/divisions/:divisionId/messages/summary', function(req, res) {
	var divisionId = req.params.divisionId
	var division = divisionsService.getDivisionById(divisionId)
	var userProfile = getUserProfile(req)
	var userId = userProfile ? userProfile.id : 1

	var newMessagesSummary = []

	for (var i = 0; i < division.relations.length; i++) {
		var driver = division.relations[i]

		var unreadMessagesCount = 0
		var j = driver.messages.length - 1
		while (driver.messages[j].unread == true) {
			unreadMessagesCount ++
			j --
		}
		
		var randomNewMessagesNumber = tools.randomFrom(7)
		for (var j = 0; j < randomNewMessagesNumber; j++) {
			driver.messages.push(messagingService.generateDriverMessage(driver.id, userId, true))
		}
		newMessagesSummary.push({
			"driverId": driver.id,
			"quantity": unreadMessagesCount + randomNewMessagesNumber
		})
	}
	res.json(newMessagesSummary)
})

app.get('/divisions/:divisionId/messages/backward', function(req, res) {
	var divisionId = req.params.divisionId
	var driverId = req.query.driver

	var driver = divisionsService.getDriver(divisionId, driverId)

	var messageId = req.query.messageId
	var quantity = req.query.quantity
	if (quantity == undefined) quantity = 10

	var messages = messagingService.getMessagesBeforePartucular(driver.messages, messageId, quantity)

	res.json(messages)

	messagingService.markMessagesAsRead(messages)
})

app.get('/divisions/:divisionId/messages/forward', function(req, res) {
	var divisionId = req.params.divisionId
	var driverId = req.query.driver

	var driver = divisionsService.getDriver(divisionId, driverId)

	var messageId = req.query.messageId
	var quantity = req.query.quantity
	if (quantity == undefined) quantity = 10

	var messages = messagingService.getMessagesAfterPartucular(driver.messages, messageId, quantity)

	res.json(messages)

	messagingService.markMessagesAsRead(messages)
})

app.post('/divisions/:divisionId/messages/', function(req, res) {
	var userProfile = getUserProfile(req)
	var userId = userProfile ? userProfile.id : 1

	var divisionId = req.params.divisionId
	var driverIds = req.body.toIds

	for (var i = 0; i < driverIds.length; i++)
	{
		var driver = divisionsService.getDriver(divisionId, driverIds[i])
		driver.messages.push(messagingService.createMessage(driverIds[i], userId, req.body.message))
	}
	res.status(201).send("Ok")
})

app.get('/divisions/:divisionId/notifications', function(req, res) {
	var divisionId = req.params.divisionId
	var driverId = req.query.driver

	var driver = divisionsService.getDriver(divisionId, driverId)

	res.json(driver.notifications)
})

app.post('/divisions/:divisionId/notifications', function(req, res) {
	var userProfile = getUserProfile(req)
	var userId = userProfile ? userProfile.id : 1

	var divisionId = req.params.divisionId
	var driverIds = req.body.toIds

	for (var i = 0; i < driverIds.length; i++) {
		var driver = divisionsService.getDriver(divisionId, driverIds[i])
		driver.notifications.push(
			messagingService.createNotification(driverIds[i], userId, req.body.message, req.body.title, req.body.type)	
		)
	}

	res.status(201).send("Ok")
})

function composeValidationError(message, errors) {
	return {
		errorType: "ValidationError",
		errorMessage: message,
		details: errors
	}
}

function composeBadRequestError(message) {
	return {
		errorType: "BadRequest",
		errorMessage: message,
		details: []
	}
}

app.get('/error500', function(req, res){
	res.status(500).send("Requested url doesn't exist")
})

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'))
})
