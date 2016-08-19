const common_tools = require('../../services/common')
const R = require('ramda')
var moment = require('moment')
moment().format()

const locations = require('../static/locations')
const divisions = require('../static/divisions.js')
const breadcrumbs = require('../static/breadcrumbs.json')

const divisionsService = require('../../services/divisionsService')

const numberOfStops = 7
const numberOfShipments = 10
const loadsQuantity = 2000

var loads_collection = []

for (var i = 0; i < loadsQuantity; i++) {
	var newLoad = generateLoad(i);

	loads_collection.push(JSON.parse(JSON.stringify(newLoad)));
}

function generateLoad(id) {
	var idx = id + 1

	var stops = generateStops(idx)

	var brokerDivision = getBrokerDivision()
	var carrierDivision = getCarrierDivision()
	while (carrierDivision == null && brokerDivision == null) {
		carrierDivision = getCarrierDivision()
	}

	var load = {
		"id": idx,
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
		"stops": stops.slice(),
		"shipments": generateShipments(idx, stops),
		"documentScans": generateDocScanLinks(idx),
		"showMap": true
	}	

	if (load.status == 'InTransit') {
		var nextStop = stops[common_tools.randomFrom(stops.length - 1) + 1]
		load.nextStop = nextStop.id
		
		var routeStart = load.stops[0].coordinatesIndex
		var breadcrumbsBeforNextStop = nextStop.coordinatesIndex - routeStart
		var breadcrumbsSubset = breadcrumbs.slice(routeStart, nextStop.coordinatesIndex - Math.floor(breadcrumbsBeforNextStop / 5))
		load.breadcrumbs = breadcrumbsSubset

		if (breadcrumbsSubset[breadcrumbsSubset.length-1] == undefined) {
			console.log(breadcrumbsSubset.length)
			console.log(breadcrumbs[breadcrumbsSubset.length-1])
			console.log('first stop', load.stops[0].coordinatesIndex)
			console.log('next stop', nextStop.coordinatesIndex - 100)
			console.log('breadcrumbs.length', breadcrumbs.length)

			for (var i = 0; i< load.stops.length; i++) {
				console.log(load.stops[i].coordinatesIndex)
			}
		}

		var truckLocation = locations[common_tools.randomFrom(locations.length)]
		truckLocation.latitude = breadcrumbsSubset[breadcrumbsSubset.length-1].coordinates[0]
		truckLocation.longitude = breadcrumbsSubset[breadcrumbsSubset.length-1].coordinates[1]
		truckLocation.timestamp = breadcrumbsSubset[breadcrumbsSubset.length-1].timestamp

		load.truckLocation = truckLocation
	}
	return load
}

function generateDocScanLinks(loadId) {
	var links = []
	for (var i = 0; i < 15; i++) {
		links.push({
			"label": "Document scan #" + i + " | Confirmation ID | XX pages",
			"url": "/scans/' + loadId + '/' + i"
		})	
	}
	return links
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
//ToDo reimplement this part
		var pickUpStopNum
		var dropOffStopNum
		if (stops_quantity > 2) {
			pickUpStopNum = common_tools.randomFrom(stops_quantity-1)
			dropOffStopNum = pickUpStopNum + 1 
				+ common_tools.randomFrom(stops_quantity-1 - (pickUpStopNum == 0 ? 1 : pickUpStopNum) )
		} else {
			pickUpStopNum = 0
			dropOffStopNum = 1
		}
//ToDo reimplement this part ^
		var id = loadId * 100 + i
//ToDo stop.stop_id is WA, should be replaced with 'id' 
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
			"pickup": stops[pickUpStopNum].stop_id,
			"dropoff": stops[dropOffStopNum].stop_id,
			"orders": generateOrders(id),
			"packages": generatePackages(id)
		}
	}
	
	return shipments
}

function generateStops(loadId) {
	var stop = {}
	var stops_array = []
	var stops_quantity = common_tools.randomFrom(numberOfStops)
	if (stops_quantity < 2) stops_quantity = 2

	var startLocationNumber	= common_tools.randomFrom(locations.length)

	var coordinatesSubsetLength = Math.floor(breadcrumbs.length / (stops_quantity))


	for (var i = 0; i < stops_quantity; i++) {
		var stopId = loadId * 10 + i

		stop = locations[(startLocationNumber + i) % locations.length]
		stop.id = stopId
		stop.stop_id = stopId
		stop.date = moment().add(common_tools.randomFrom(25), 'd')
		stop.time = common_tools.randomTime()

		
		stops_array.push(stop)
	}
	
	stops_array.sort(function(stop1, stop2) {
		return (moment(stop1.date).valueOf() - stop2.date.valueOf())
	})

	for (var i = 0; i < stops_array.length; i++) {
		stops_array[i].date = stops_array[i].date.format('YYYY/MM/DD')
		stops_array[i].stopNum = i

		stops_array[i].coordinatesIndex = coordinatesSubsetLength * i + common_tools.randomFrom(coordinatesSubsetLength)
		
		//stops_array[i].coordinates = breadcrumbs[stops_array[i].coordinatesIndex].coordinates
		stops_array[i].latitude = breadcrumbs[stops_array[i].coordinatesIndex].coordinates[0]
		stops_array[i].longitude = breadcrumbs[stops_array[i].coordinatesIndex].coordinates[1]
	}

	return stops_array
}

//ToDo: Implement It
function generateWayPoints() {
	return []
}

function generateOrders(shipmentId) {
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
	var packages = []
	for (var i = 0; i < common_tools.randomFrom(10); i++) {
		packages[i] = {
			"id": shipmentId*1000 + i,
			"quantity": common_tools.randomFrom(50),
			"type": "type " + i,
			"volume": common_tools.randomFrom(10000) / 100,
			"weight": common_tools.randomFrom(10000) / 100,
			"sizeUnit": "ft",
			"weightUnit": "lb",
			"freightClass": "freightClass " + i
		}
	}
	return packages
}

function generateTenderingInfo(divisionId) {
	const assignmentStatuses = ['Offered', 'Rejected', 'Assigned']

	var division = divisionsService.getDivisionById(divisionId)

	var relations = division.relations
	var numberOfSubordinates = relations.length

	var assignmentStatus 
	var numberOfAssignees

	if (division.type == 'carrier') {
		assignmentStatus = assignmentStatuses[common_tools.randomFrom(3)]
		numberOfAssignees = numberOfSubordinates > 4 ? 4 : common_tools.randomFrom(numberOfSubordinates)
	}
	else {
		assignmentStatus = 'Assigned'
		numberOfAssignees = 1
	}

	var tenderingInfo = []
	// getting subset of relations
	var startSubsetPosition = common_tools.randomFrom(numberOfSubordinates)
	for (var i = 0; i < numberOfAssignees; i++) {
		var assignmentParty = relations[(startSubsetPosition + i) % numberOfSubordinates]
		tenderingInfo.push({
			"id": assignmentParty.id,
			"name": assignmentParty.name,
			"assignmentStatus": assignmentStatus
		})
	}	

	return tenderingInfo
}

function randomStatus() {
	const statuses = [
		"Available",
		"InTransit",
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


module.exports = loads_collection
