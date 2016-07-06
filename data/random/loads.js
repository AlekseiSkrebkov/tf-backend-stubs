const common_tools = require('../common')
const R = require('ramda')


const locations = require('../static/locations')
const divisions = require('../static/divisions.js')

const numberOfStops = 7
const numberOfShipments = 10
const loadsQuantity = 2

var loads_collection = []
for (var i = 0; i < loadsQuantity; i++) {
	loads_collection[i] = generateLoad(i)
}

module.exports = loads_collection

function generateLoad(id) {
	id += 1

	var stops = generateStops(id)
	var brokerDivision = getBrokerDivision()
	var carrierDivision = getCarrierDivision()
	while (carrierDivision == null && brokerDivision == null) {
		carrierDivision = getCarrierDivision()
	}

	return {
		"id": id,
		"brokerLoadNumber": common_tools.guid(),
		"carrierLoadNumber": common_tools.guid(),
		"bolNumber": common_tools.guid(),
		"brokerDivision": brokerDivision,
		"carrierDivision": carrierDivision,
		"status": randomStatus(),
		"brokerTenderingInfo": brokerDivision ? generateTenderingInfo(brokerDivision.id) : [],
		"carrierTenderingInfo": carrierDivision ? generateTenderingInfo(carrierDivision.id) : [],
		"createdDateTime": common_tools.randomDate(new Date(2016, 5, 1), new Date()), 
		"freightTerms": "Test frightTerms",
		"carrierSpecialInstructions": "The following paperwork is required for each load: "+
			"1. Your final signed Carrier Rate Confirmation (all pages required). "+
			"We require that you provide a reference number on the Carrier Rate Confirmation by entering " + 
			"it where indicated at the bottom of the Carrier Rate Confirmation sheet. That number will then " +  
			"be referenced on our payment to you. " +
			"	2. The signed Bill of Lading." +
			"	3. Receipts for lumpers or other accessorial charges.",
		"loadAttributes": generateLoadAttributes(),
		"stops": stops,
		"shipments": generateShipments(id, stops)
	}	
}

function getBrokerDivision() {
	if (common_tools.randomFrom(2) == 0) return null
	var numberOfBrokers = divisions.brokers.length

	var division = divisions.brokers[common_tools.randomFrom(numberOfBrokers)]
	return getDivisionSummary(division)
}

function getCarrierDivision() {
	if (common_tools.randomFrom(2) == 0) return null

	var numberOfCarriers = divisions.carriers.length

	var division = divisions.carriers[common_tools.randomFrom(numberOfCarriers)]
	return getDivisionSummary(division)	
}

function getDivisionSummary(division) {
	return {
		"id": division.id,
		"name": division.name,
		"type": division.type,
		"code": division.code
	}	
}

function generateLoadAttributes() {
	var data = []
	var i = 0
	strAttrNumber = common_tools.randomFrom(5)
	while (i < strAttrNumber) {
		data[i] = {
			"key": 'key' + i,
			"value": 'value' + i,
			"type": "string"
		}
		i++
	}
	numAttrNumber = common_tools.randomFrom(5)
	while (i < (strAttrNumber + numAttrNumber)) {
		data[i] = {
			"key": 'key' + i,
			"value": 'value' + i,
			"type": "number"
		}
		i++
	}
	booleanAttrNumber = common_tools.randomFrom(3)
	while (i < (strAttrNumber + numAttrNumber + booleanAttrNumber)){
		data[i] = {
			"key": randomMark(),
			"value": 'true',
			"type": "boolean"
		}
		i++
	}
	return data
}

function generateShipments(loadId, stops) {
	const stops_quantity = stops.length
	var shipments_quantity = common_tools.randomFrom(numberOfShipments)
	if (shipments_quantity < Math.ceil(stops_quantity/2)) {
		shipments_quantity = Math.ceil(stops_quantity/2)
	}


	var shipments = []
	for (var i = 0; i < shipments_quantity; i++) {

		var pickUpStopNum
		var dropOffStopNum
		if (stops_quantity > 2) {
			pickUpStopNum = common_tools.randomFrom(stops_quantity)
			dropOffStopNum = common_tools.randomFromNotZero(stops_quantity - pickUpStopNum) + pickUpStopNum
		} else {
			pickUpStopNum = 0
			dropOffStopNum = 1
		}
		
		var id = loadId * 100 + i
		console.log("shipmentId", id)
		shipments[i] = {
			"id": id,
			"shipmentBOL": common_tools.guid(),
			"shipmentCarrierSpecInstructions": "The following paperwork is required for each load: "+
			"1. Your final signed Carrier Rate Confirmation (all pages required). "+
			"We require that you provide a reference number on the Carrier Rate Confirmation by entering " + 
			"it where indicated at the bottom of the Carrier Rate Confirmation sheet. That number will then " +  
			"be referenced on our payment to you. " +
			"	2. The signed Bill of Lading." +
			"	3. Receipts for lumpers or other accessorial charges.",
			"pickup": (stops[pickUpStopNum]).id,
			"dropoff": stops[dropOffStopNum].id,
			"orders": generateOrders(id),
			"packages": generatePackages(id)
		}
	}
	
	return shipments
}

function generateStops(loadId) {
	var stop 
	var stops_array = []
	var stops_quantity = common_tools.randomFrom(numberOfStops)
	if (stops_quantity < 2) stops_quantity = 2
	for (var i = 0; i < stops_quantity; i++) {
		console.log('stop id', loadId * 100 + i)
		stop = locations[common_tools.randomFrom(10)]
		stop.id = loadId * 100 + i
		stop.date = common_tools.randomDate(new Date(), new Date(2016, 6, 30))
		stop.time = common_tools.randomTime
		stops_array[i] = stop
	}
	
	stops_array.sort((stop1, stop2) => {
		return (stop1.date.getTime() - stop2.date.getTime())
	})
		
	return stops_array
}

//ToDo: Implement It
function generateWayPoints() {
	return []
}

function generateOrders(shipmentId) {
	console.log('orderId', shipmentId*100 + 1)
	var orders = []
	for (var i = 0; i < common_tools.randomFrom(5); i++) {
		orders[i] = {
			"id": shipmentId*100 + i,
			"orderNUmber": common_tools.guid(),
			"purchaseOrderNumber": common_tools.guid()
		}
	}
	return orders
}

//ToDo: support list values for Type and FreightClass
function generatePackages(shipmentId) {
	console.log('package1', shipmentId*10000 + 1)
	var packages = []
	for (var i = 0; i < common_tools.randomFrom(10); i++) {
		packages[i] = {
			"id": shipmentId*10000 + i,
			"quantity": common_tools.randomFrom(50),
			"type": "type " + i,
			"volume": common_tools.randomFrom(10000) / 100,
			"weight": common_tools.randomFrom(10000) / 100,
			"freightClass": "freightClass " + i
		}
	}
	return packages
}

function generateTenderingInfo(divisionId) {
	const assignmentStatuses = ['Offered', 'Rejected', 'Assigned']

	var division = R.find(R.propEq('id', divisionId), divisions.brokers.concat(divisions.carriers))
	var divisionType =  division.type

	var subordinates = division.subordinates
	var assignmentStatus 

	if (divisionType == 'carrier')
		assignmentStatus = assignmentStatuses[common_tools.randomFrom(3)]
	else
		assignmentStatus = 'Assigned'

	var tenderingInfo = []
	// getting subset of subordinates
	var numberOfSubordinates = subordinates.length
	var subsetLength = common_tools.randomFrom(numberOfSubordinates)
	var startSubsetPosition = common_tools.randomFrom(numberOfSubordinates)
	for (var i = 0; i < subsetLength; i++) {
		var assignmentParty = subordinates[(startSubsetPosition + i) % numberOfSubordinates]
		tenderingInfo.push({
			"id": assignmentParty.id,
			"name": assignmentParty.name,
			"isNewMessage": assignmentParty.isNewMessage,
			"assignmentStatus": assignmentStatus
		})
	}	

	return tenderingInfo
}

function randomStatus() {
	const statuses = [
		"Available",
		"In Transite",
		"Offered",
		"Assigned",
		"Declined",
		"Delivered"
	]
	
	return statuses[common_tools.randomFrom(5)]
}

function randomMark() {
	const marks = [
		"Hazardous",
		"Fragile",
		"High Value"
	]
	
	return marks[common_tools.randomFrom(2)]
}
