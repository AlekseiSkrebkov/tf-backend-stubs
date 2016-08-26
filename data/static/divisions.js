const tools = require('../../services/common')
const locations = require('../static/locations')
const messagesService = require('../../services/messagesService')

function generateDriverMessages(id) {
	var messages = []
	var userId
	for (var i = 0; i < 100; i++) {
		userId = tools.randomFrom(2) +1
		messages.push(messagesService.generateDriverMessage(id, userId, false))
		messages.push(messagesService.generateDispatcherMessage(id, userId, false))
	}
	return messages
}

function generateDriverNotifications(id) {
	var notifications = []
	var userId
	for (var i = 0; i < 50; i++) {
		userId = tools.randomFrom(2) +1
		notifications.push(messagesService.generateNotification(id, userId, tools.randomFrom(2)))
	}
	return notifications	
}

function generateDrivers(divisionId) {
	var numberOfDrivers = tools.randomFrom(20) + 10
	drivers = []
	for(var i = 0; i < numberOfDrivers; i++) {
		var id = divisionId * 100 + i
		drivers[i] = {
			"id": id,
			"name": "Driver Full Name#" + i,
			"driverId": 'driverID #' + i,
			"email": "driverFullName#" + i + "@gmail.com",
			"isNewMessage": tools.randomBoolean(),
			"isFavorite": tools.randomBoolean(),
			"regFields": [
				{
					"key": "regField name " + i, 
					"value": "regField value " + i
				}
			],
			"lastKnownLocation": locations[tools.randomFrom(locations.length)],
			"messages": generateDriverMessages(id),
			"notifications": generateDriverNotifications(id),
			"statistics": [
				{
					"label": "Offered Loads",
					"value": 8,
					"type": "loads",
					"filters": [
						{
							"param": "driverOffered",
							"value": id
						}
					]
				},
				{
					"label": "Assigned Loads",
					"value": 3,
					"type": "loads",
					"filters": [
						{
							"param": "driverAssignee",
							"value": id
						}
					]
				}
			]
		}
		//console.log(drivers[i].notifications)
	}
	return drivers;
}

var carrierDivisions = [
	{
		id: 1,
		name: "Montgomery Logistics",
		type: "carrier",
		code: "MGYL",
		relations: generateDrivers(1)
	},
	{
		id: 2,
		name: "JKC Mobile Test Fleet",
		type: "carrier",
		code: "JKCFM",
		relations: generateDrivers(2)
	},
	{
		id: 7,
		name: "Syfan Logistics",
		type: "carrier",
		code: "SYFNVQP",
		relations: generateDrivers(7)
	},
	{
		id: 8,
		name: "Foodliner - Owner Operator Miscellaneous Document",
		type: "carrier",
		code: "FOLWMMIS",
		relations: generateDrivers(8)
	},
	{
		id: 9,
		name: "First Choice OS & D",
		type: "carrier",
		code: "FCTICLM",
		relations: generateDrivers(9)
	},
	{
		id: 10,
		name: "Division 10",
		type: "carrier",
		code: "dvscar10",
		relations: generateDrivers(10)
	}
]

function randomCarriers() {
	var numberOfCarriers = tools.randomFrom(carrierDivisions.length-2) + 2
	var startOfSubset = tools.randomFrom(carrierDivisions.length)
	var carriersSubset = []
	for (var i = 0; i < numberOfCarriers; i++) {
		carriersSubset.push(carrierDivisions[(startOfSubset + i) % carrierDivisions.length])
	}
	for (var i = 0; i < carriersSubset.length; i++) {
		carriersSubset[i].isFavorite = tools.randomBoolean()
	}
	return carriersSubset
}

const brokerDivisions = [
		{
			id: 3,
			name: "Division 3",
			type: "broker",
			code: "dvsbro3",
			relations: randomCarriers(),
			"permissions": []
		},
		{
			id: 4,
			name: "Division 4",
			type: "broker",
			code: "dvsbro4",
			relations: randomCarriers(),
			"permissions": ['showDrivers']
		},
		{
			id: 5,
			name: "Division 5",
			type: "broker",
			code: "dvsbro5",
			relations: randomCarriers(),
			"permissions": []

		},
		{
			id: 6,
			name: "Division 6",
			type: "broker",
			code: "dvsbro6",
			relations: randomCarriers(),
			"permissions": ['showDrivers']
		}
	]

function getCarrierDivisionById(id) {
	return carrierDivisions.find(function(division){
			return division.id == parseInt(id)
		})
}

function getBrokerDivisionById(id) {
	return brokerDivisions.find(function(division){
			return division.id == parseInt(id)
		})
}

function getDivisionById(id) {
	var allDivisions = carrierDivisions.concat(brokerDivisions)
	return allDivisions.find(function(division){
			return division.id == parseInt(id)
		})
}

function getSubordinateById(division, id) {
	console.log('looking for sub id = ' + id + ' from division id=' + division.id)
	return division.relations.find(function(subordinate){
			return subordinate.id == parseInt(id)
		})
}

module.exports = {
	carriers: carrierDivisions,
	brokers: brokerDivisions,
	getCarrierDivisionById: getCarrierDivisionById,
	getBrokerDivisionById: getBrokerDivisionById,
	getSubordinateById: getSubordinateById,
	getDivisionById: getDivisionById
}
