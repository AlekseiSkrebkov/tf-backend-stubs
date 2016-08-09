const tools = require('../common')
const locations = require('../static/locations')


function generateDrivers(divisionId) {
	var numberOfDrivers = tools.randomFrom(20) + 10
	drivers = []
	for(var i = 0; i < numberOfDrivers; i++) {
		drivers[i] = {
			"id": divisionId * 100 + i,
			"name": "DriverName#" + i + " DriverSurname#" + i,
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
			"loads": []
		}
	}
	return drivers;
}

var carrierDivisions = [
	{
		id: 1,
		name: "Montgomery Logistics",
		type: "carrier",
		code: "MGYL",
		subordinates: generateDrivers(1)
	},
	{
		id: 2,
		name: "JKC Mobile Test Fleet",
		type: "carrier",
		code: "JKCFM",
		subordinates: generateDrivers(2)
	},
	{
		id: 7,
		name: "Syfan Logistics",
		type: "carrier",
		code: "SYFNVQP",
		subordinates: generateDrivers(7)
	},
	{
		id: 8,
		name: "Foodliner - Owner Operator Miscellaneous Document",
		type: "carrier",
		code: "FOLWMMIS",
		subordinates: generateDrivers(8)
	},
	{
		id: 9,
		name: "First Choice OS & D",
		type: "carrier",
		code: "FCTICLM",
		subordinates: generateDrivers(9)
	},
	{
		id: 10,
		name: "Division 10",
		type: "carrier",
		code: "dvscar10",
		subordinates: generateDrivers(10)
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
			subordinates: randomCarriers(),
			"permissions": []
		},
		{
			id: 4,
			name: "Division 4",
			type: "broker",
			code: "dvsbro4",
			subordinates: randomCarriers(),
			"permissions": ['showDrivers']
		},
		{
			id: 5,
			name: "Division 5",
			type: "broker",
			code: "dvsbro5",
			subordinates: randomCarriers(),
			"permissions": []

		},
		{
			id: 6,
			name: "Division 6",
			type: "broker",
			code: "dvsbro6",
			subordinates: randomCarriers(),
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

function getSubordinateById(division, id) {
	console.log('looking for sub id = ' + id + ' from division id=' + division.id)
	return division.subordinates.find(function(subordinate){
			return subordinate.id == parseInt(id)
		})
}

module.exports = {
	carriers: carrierDivisions,
	brokers: brokerDivisions,
	getCarrierDivisionById: getCarrierDivisionById,
	getBrokerDivisionById: getBrokerDivisionById,
	getSubordinateById: getSubordinateById
}
