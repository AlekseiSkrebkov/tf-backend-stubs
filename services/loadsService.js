var loadsCollection = require('../data/random/loads')
const divisionsService = require('./divisionsService')
const tools = require('../data/common')

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
	filteredLoads = divisionLoads.filter(function(load) {
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
			var loadDateInt = new Date(load.stops[length-1].date).getTime()
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
			mapPoints.push({
				"id": driver.id,
				"latitude": driver.lastKnownLocation.latitude,
				"longitude": driver.lastKnownLocation.longitude,
				"type": Math.random() > 0.5 ? "availableDriver" : "intransitDriver"
			})	
		}
	}

	return mapPoints
}

module.exports = {
	getLoadsByDivision: getLoadsByDivision
}