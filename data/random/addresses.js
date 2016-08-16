var addresses_collection = []

const locations = require('../static/locations')
const breadcrumbs = require('../static/breadcrumbs')
const tools = require('../../services/common')


var i = 0
for (; i < locations.length; i++) {
	var address = locations[i]
	address.id = i
	addresses_collection.push(address)
}

for (; i < 500; i++) {
	var randomCoordinateIndex = tools.randomFrom(breadcrumbs.length)
	addresses_collection.push(
		{
			"id": i,
			"city": "City" + i,
			"state": "State" + i,
			"country": "US",
			"postalCode": "33607",
			"addressLines": [
				"Address Line 1" + i,
				"addrline2" + i
			],
			"phoneNumber": "+19328483749",
			"contactName": "Contact FullName " + i,
			"company": "Company Name " + i,
			"email": "email" + i + "@mail.com",
			"latitude": breadcrumbs[randomCoordinateIndex].coordinates[0],
			"longitude": breadcrumbs[randomCoordinateIndex].coordinates[1]
		}
	)
}

module.exports = addresses_collection