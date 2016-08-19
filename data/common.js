module.exports = {
	guid: function () {
	    function _p8(s) {
	        var p = (Math.random().toString(16)+"000000000").substr(2,8)
	        return s ? "-" + p.substr(0,4) + "-" + p.substr(4,4) : p 
	    }
	    return _p8() + _p8(true)
	}, 
	randomFrom: function (x) {
		return random(x)	
	},
	randomDate: function (start, end) {
		var date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
	    return date
	},
	randomTime: function () {
		var times = [
			"Any time",
			"Early morning",
			"Afternoon", 
			"Any time except 2PM - 3PM and call client 3 hours before",
			"Evening between 7PM and 10PM"
		]
		return times[random(5)]
	},
	randomBoolean: function() {
		return (Math.random() >= 0.5)
	},
	isDateInRange: function (targetDate, oneDate, secondDate) {
		//console.log('isDateInRange ' + targetDate + ' ' + oneDate + ' ' + secondDate)
		var startDate = oneDate < secondDate ? oneDate : secondDate
		var endDate = oneDate > secondDate ? oneDate : secondDate
		
		return targetDate >= startDate && targetDate <= endDate
	},
	atob: function (str) {
	  return new Buffer(str, 'base64').toString('binary')
	},
	btoa: function (str) {
	    var buffer;

	    if (str instanceof Buffer) {
	      buffer = str
	    } else {
	      buffer = new Buffer(str.toString(), 'binary')
	    }

	    return buffer.toString('base64')
	}
}
		
function random(x) {
	if (x == 100) 
		return Math.floor(Math.random() * 100)
	else if (x > 10 && x < 100) 
		return Math.floor(Math.random() * 100) % x
	else if (x == 10) 
		return Math.floor(Math.random() * 10)
	else (x < 10) 
		return Math.floor(Math.random() * 10) % x
}