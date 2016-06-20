const loads_collection = require('./loads') 

var load_summary_collection = []

for (var i = 0; i < loads_collection.length; i++) {
	var load = loads_collection[i]
	
	load_summary_collection[i] = {
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

module.exports = load_summary_collection
