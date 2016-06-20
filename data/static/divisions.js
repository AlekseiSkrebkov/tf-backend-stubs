const tools = require('../common')

function generateDrivers(divisionId) {
	var numberOfDrivers = tools.randomFrom(20) + 10
	drivers = []
	for(var i = 0; i < numberOfDrivers; i++) {
		drivers[i] = {
			"id": divisionId * 100 + i,
			"name": "Driver#" + i,
			"email": "driver#" + i + "@gmail.com",
			"isNewMessage": false
		}
	}
	return drivers;
}

var carrierDivisions = [
	{
		id: 1,
		name: "Division 1",
		type: "carrier",
		subordinates: generateDrivers(1)
	},
	{
		id: 2,
		name: "Division 2",
		type: "carrier",
		subordinates: generateDrivers(2)
	},
	{
		id: 7,
		name: "Division 7",
		type: "carrier",
		subordinates: generateDrivers(7)
	},
	{
		id: 8,
		name: "Division 8",
		type: "carrier",
		subordinates: generateDrivers(8)
	},
	{
		id: 9,
		name: "Division 9",
		type: "carrier",
		subordinates: generateDrivers(9)
	},
	{
		id: 10,
		name: "Division 10",
		type: "carrier",
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
	return carriersSubset
}

const brokerDivisions = [
		{
			id: 3,
			name: "Division 3",
			type: "broker",
			subordinates: randomCarriers()
		},
		{
			id: 4,
			name: "Division 3",
			type: "broker",
			subordinates: randomCarriers()
		},
		{
			id: 5,
			name: "Division 5",
			type: "broker",
			subordinates: randomCarriers()

		},
		{
			id: 6,
			name: "Division 6",
			type: "broker",
			subordinates: randomCarriers()
		}
	]

module.exports = {
	carriers: carrierDivisions,
	brokers: brokerDivisions
}
