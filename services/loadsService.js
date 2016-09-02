var loadsCollection = require('../data/random/loads')
const divisionsService = require('./divisionsService')
const tools = require('./common')

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
			"documentScans": load.documentScans,
			"carrierTenderingInfo": load.carrierTenderingInfo,
			"createdDateTime": load.createdDateTime
		}
}

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

function getLoadsByDivision(divisionId, status, shippingDates, deliveryDates) {
	var divisionLoads = loadsCollection.filter(function(load) {
		if (divisionsService.isCarrierDivision(divisionId)) {
			return (load.carrierDivision != null && load.carrierDivision.id == divisionId)
		} else if (divisionsService.isBrokerDivision(divisionId)) {
			return (load.brokerDivision != null && load.brokerDivision.id == divisionId)
		} 
	})

	console.log('divisions loads quantity', divisionLoads.length)

// Apply filters
	var filteredLoads = divisionLoads.filter(function(load) {
		//status
		if (status) {
			var statuses = status.split(',')
			console.log('statuses', statuses)
			
			console.log('load status', status)
			if (statuses.indexOf(load.status) == -1) return false
		}
		//filter by shipping dates
		if (shippingDates) {
			var startDateInt = new Date(shippingDates.slice(0, shippingDates.indexOf('-'))).getTime()
			var endDateInt = new Date(shippingDates.slice(shippingDates.indexOf('-') + 1, shippingDates.length)).getTime()
			var loadDateInt = new Date(load.stops[0].date).getTime()
			if (!tools.isDateInRange(loadDateInt, startDateInt, endDateInt)) return false
		}
		//filter by delivery dates
		if (deliveryDates) {
			var startDateInt = new Date(deliveryDates.slice(0, deliveryDates.indexOf('-'))).getTime()
			var endDateInt = new Date(deliveryDates.slice(deliveryDates.indexOf('-') + 1, deliveryDates.length)).getTime()
			var loadDateInt = new Date(load.stops[load.stops.length-1].date).getTime()
			if (!tools.isDateInRange(loadDateInt, startDateInt, endDateInt)) return false
		}
		return true
	})

	console.log('filtered Loads quantity', filteredLoads.length)

// Get Map points
	var mapPoints = []
	for (var i = 0; i < filteredLoads.length; i++) {
		var load = filteredLoads[i]
		mapPoints.push({
			"id": load.id,
			"latitude": load.stops[0].latitude,
			"longitude": load.stops[0].longitude,
			"type": "shippingLoc"
		})
		mapPoints.push({
			"id": load.id,
			"latitude": load.stops[load.stops.length - 1].latitude,
			"longitude": load.stops[load.stops.length - 1].longitude,
			"type": "deliveryLoc"
		})
	}

	if (divisionsService.isCarrierDivision(divisionId)) {
		var division = divisionsService.getDivisionById(divisionId)
		var drivers = division.relations
		for (var i = 0; i < drivers.length; i++) {
			var driver = drivers[i]
			var driverPoint = {
				"id": driver.id,
				"latitude": driver.lastKnownLocation.latitude,
				"longitude": driver.lastKnownLocation.longitude,
				"type": Math.random() > 0.5 ? "availableDriver" : "intransitDriver"
			}
			if (driverPoint.type == 'intransitDriver') {
				var randomLoad = filteredLoads[tools.randomFrom(filteredLoads.length)]
				driverPoint.associatedPoint = {
					"id": randomLoad.id,
					"latitude": randomLoad.stops[randomLoad.stops.length - 1].latitude,
					"longitude": randomLoad.stops[randomLoad.stops.length - 1].longitude,
					"type": "deliveryLoc"
				}
			}
			mapPoints.push(driverPoint)	
		}
	}

	return mapPoints
}

function validateLoadParameters(load) {
	var errors = []
	if (!load.bolNumber) 
		errors.push({
			parameter: "bolNumber",
			error: "BOL Number should be specified for load"
		})
	if (!load.freightTerms)
		errors.push({
			parameter: "freightTerms",
			error: "Freight Terms should be specified for load"
		})
	return errors
}

module.exports = {
	getLoadSummary: getLoadSummary,
	processNewStops: processNewStops,
	getLoadsByDivision: getLoadsByDivision,
	validateLoad: validateLoadParameters
}