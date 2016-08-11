var loadsCollection = require('../data/random/loads')
const divisionsService = require('./divisionsService')

function getLoadsByDivision(divisionId) {
	var divisionLoads = loadsCollection.filter(function(load) {
		if (divisionsService.isCarrierDivision(divisionId)) {
			return (load.carrierDivision != null && load.carrierDivision.id == divisionId)
		} else if (divisionsService.isBrokerDivision(divisionId)) {
			return (load.brokerDivision != null && load.brokerDivision.id == divisionId)
		} 
	})

	var mapPoints = []
	for (var i = 0; i < divisionLoads.length; i++) {
		var load = divisionLoads[i]
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