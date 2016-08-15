const breadcrumbsSource = require('../data/static/breadcrumbs_source.json')

var breadcrumbs = []
for (var i = 0; i < breadcrumbsSource.length; i++) {
	var trackingPoint = {}
	trackingPoint.coordinates = [breadcrumbsSource[i].Location.Latitude, breadcrumbsSource[i].Location.Longitude]
	trackingPoint.timestamp = breadcrumbsSource[i].Timestamp
	trackingPoint.speed = Math.round(breadcrumbsSource[i].Speed * 0.621371)

	breadcrumbs.push(trackingPoint)
}

var fs = require('fs');
fs.writeFile("../data/static/breadcrumbs.json", JSON.stringify(breadcrumbs), function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
}); 


const source_example = {
  "Location": {
    "Latitude": 22.1709824,
    "Longitude": 113.272476
  },
  "RecipientId": "TESTFLEET",
  "Timestamp": "2016-06-01T00:00:00Z",
  "Speed": 0,
  "DeviceId": "",
  "DeviceType": "",
  "DriverId": 1357,
  "Email": "selnahwy@transflo.com"
}