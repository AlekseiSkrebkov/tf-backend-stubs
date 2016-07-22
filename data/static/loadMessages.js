var moment = require('moment')

var date = moment()

module.exports = [
	{
		"id": 1,
		"title": "Declined",
		"message": "Decline/and pre-loaded I'll go ahead and do it this place is a joke we have Drop trailers there that never get pre-loaded and we end up sitting there for hours and hours waiting to get loaded like I said if they could have the trailer loaded when I get there then I'll take it no problem",
		"timestamp": date.subtract(20, "hours").format()
	},
	{
		"id": 2,
		"title": "Accepted",
		"message": "Accept/I can PU another load afterwards & T-CALL it at the Romeoville drop yard. I will have to drop the TRLR there anyways. either that or help out with local runs for a couple days. meaning the rest of the 8th & 9th.",
		"timestamp": date.subtract(18, "hours").format()
	},
	{
		"id": 3,
		"title": "Started Load",
		"message": "Start/",
		"timestamp": date.subtract(16, "hours").format()
	},
	{
		"id": 4,
		"title": "ARRIVE AT SHIPPER",
		"message": "",
		"timestamp": date.subtract(14, "hours").format()
	},
	{
		"id": 5,
		"title": "Shipment Delayed",
		"message": "None/Saying there's only 18.55 on the card so won't let me pull it off",
		"timestamp": date.subtract(12, "hours").format()
	},
	{
		"id": 6,
		"title": "ARRIVE STOP",
		"message": "",
		"timestamp": date.subtract(10, "hours").format()
	},
	{
		"id": 7,
		"title": "Scan Item Barcode",
		"message": "",
		"timestamp": date.subtract(8, "hours").format()
	},
	{
		"id": 8,
		"title": "DEPART STOP",
		"message": "",
		"timestamp": date.subtract(6, "hours").format()
	},
	{
		"id": 9,
		"title": "Delivered",
		"message": "",
		"timestamp": date.subtract(4, "hours").format()
	},
	{
		"id": 10,
		"title": "Departing Delivery",
		"message": "",
		"timestamp": date.subtract(2, "hours").format()
	}
]