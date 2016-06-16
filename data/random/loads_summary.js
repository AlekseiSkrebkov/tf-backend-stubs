const loads_collection = require('./loads');

var load_summary_collection = []

for (var i = 0; i < loads_collection.length; i++) {
	var load = loads_collection[i];
	
	load_summary_collection[i] = {
		"id": load.id,
		"loadNumber": load.loadNumber,
		"bolNumber": load.bolNumber,
		"division": load.division,
		"firstStop": load.stops[0],
		"lastStop": load.stops[load.stops.length - 1],
		"status": load.status,
		"extended_load_data": [],
		"numberOfStops": load.stops.length,
		"tenderingInfo": [],
		"createdDateTime": load.createdDateTime
	}
} 

module.exports = load_summary_collection
