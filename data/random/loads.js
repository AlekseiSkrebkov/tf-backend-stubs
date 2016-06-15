const common_tools = require('../common');
const locations = require('../static/locations');

const numberOfStops = 7;
const numberOfShipments = 10;
const loadsQuantity = 200;

var loads_collection = [];
for (var i = 0; i < loadsQuantity; i ++) {
	loads_collection[i] = generateLoad(i);
}

module.exports = loads_collection;

function generateLoad(id) {
	var stops = generateStops(id);
	return {
		"id": id + 1,
		"loadNUmber": common_tools.guid(),
		"bolNumber": common_tools.guid(),
		"division": common_tools.randomFrom(10),
		"status": randomStatus(),
		"marks": randomMarks(),
		"tenderingInfo": [],
		"createdDateTime": common_tools.randomDate(new Date(2016, 1, 1), new Date()), 
		"freightTerms": "Test frightTerms",
		"carrierSpecialInstructions": "The following paperwork is required for each load: "+
			"1. Your final signed Carrier Rate Confirmation (all pages required). "+
			"We require that you provide a reference number on the Carrier Rate Confirmation by entering " + 
			"it where indicated at the bottom of the Carrier Rate Confirmation sheet. That number will then " +  
			"be referenced on our payment to you. " +
			"	2. The signed Bill of Lading." +
			"	3. Receipts for lumpers or other accessorial charges.",
		"extLoadData": extendedLoadData(),
		"stops": stops,
		"shipments": generateShipments(id, stops),
		"wayPoints": generateWayPoints()
	}	
}

function extendedLoadData() {
	var data = [];
	for (var i = 0; i < common_tools.randomFrom(5); i++) {
		data[i] = {
			"key": 'key' + i,
			"value": 'value' + i
		}
	}
	return data;
}

function generateShipments(loadId, stops) {
	const stops_quantity = stops.length;
	var shipments_quantity = common_tools.randomFrom(numberOfShipments);
	if (shipments_quantity < Math.ceil(stops_quantity/2)) {
		shipments_quantity = Math.ceil(stops_quantity/2);
	}
	
	var shipments = [];
	for (var i = 0; i < shipments_quantity; i++) {
		
		var pickUpStopNum = common_tools.randomFrom(stops_quantity);
		var dropOffStopNum = common_tools.randomFrom(stops_quantity);
		
		while (dropOffStopNum == pickUpStopNum) { 
			dropOffStopNum = common_tools.randomFrom(stops_quantity); 
		}
		
		shipments[i] = {
			"id": loadId * 100 + i,
			"shipmentBOL": common_tools.guid(),
			"shipmentCarrierSpecInstructions": "The following paperwork is required for each load: "+
			"1. Your final signed Carrier Rate Confirmation (all pages required). "+
			"We require that you provide a reference number on the Carrier Rate Confirmation by entering " + 
			"it where indicated at the bottom of the Carrier Rate Confirmation sheet. That number will then " +  
			"be referenced on our payment to you. " +
			"	2. The signed Bill of Lading." +
			"	3. Receipts for lumpers or other accessorial charges.",
			"pickup": stops[pickUpStopNum].id,
			"dropoff": stops[dropOffStopNum].id,
			"orders": generateOrders(),
			"packages": generatePackages()
		}
	}
	
	return shipments;
}

function generateStops(loadId) {
	var stop; 
	var stops_array = [];
	var stops_quantity = common_tools.randomFrom(numberOfStops);
	if (stops_quantity < 2) stops_quantity = 2;
	for (var i = 0; i < stops_quantity; i++) {
		stop = locations[common_tools.randomFrom(10)];
		stop.id = loadId * 100 + i;
		stop.date = common_tools.randomDate(new Date(), new Date(2017, 1, 1));
		stop.time = common_tools.randomTime;
		stops_array[i] = stop;
	}
	
	stops_array.sort((stop1, stop2) => {
		return (stop1.date.getTime() - stop2.date.getTime());
	});
		
	return stops_array;
}

//ToDo: Implement It
function generateWayPoints() {
	return [];
}

function generateOrders(shipmentId) {
	var orders = [];
	for (var i = 0; i < common_tools.randomFrom(5); i++) {
		orders[i] = {
			"id": shipmentId*100 + 1,
			"orderNUmber": common_tools.guid(),
			"purchaseOrderNumber": common_tools.guid()
		};
	}
	return orders;
}

//ToDo: support list values for Type and FreightClass
function generatePackages(shipmentId) {
	var packages = [];
	for (var i = 0; i < common_tools.randomFrom(10); i++) {
		packages[i] = {
			"id": shipmentId*10000 + 1,
			"quantity": common_tools.randomFrom(50),
			"type": "type " + i,
			"volume": common_tools.randomFrom(10000) / 100,
			"weight": common_tools.randomFrom(10000) / 100,
			"freightClass": "freightClass " + i
		}
	}
	return packages;
}

function randomStatus() {
	const statuses = [
		"Available",
		"In Transite",
		"Offered",
		"Assigned",
		"Declined",
		"Delivered"
	];
	
	return statuses[common_tools.randomFrom(5)];
}

function randomMarks() {
	const marks = [
		"Hazardous",
		"Fragile",
		"High Value"
	];
	
	return marks[common_tools.randomFrom(2)];
}
