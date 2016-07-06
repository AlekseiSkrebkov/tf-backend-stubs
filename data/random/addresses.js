var addresses_collection = require('../static/locations')

for (var i = 0; i < 1; i++) {
	addresses_collection.push(
		{
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
			"company": "Company Name " + i
		}
	)
}

module.exports = addresses_collection