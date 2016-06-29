module.exports = {
	guid: function () {
	    function _p8(s) {
	        var p = (Math.random().toString(16)+"000000000").substr(2,8)
	        return s ? "-" + p.substr(0,4) + "-" + p.substr(4,4) : p 
	    }
	    return _p8() + _p8(true)
	}, 
	randomFrom: function(x) {
		if (x == 100) 
			return Math.floor(Math.random() * 100)
		else if (x > 10 && x < 100) 
			return Math.floor(Math.random() * 100) % x
		else if (x == 10) 
			return Math.floor(Math.random() * 10)
		else (x < 10) 
			return Math.floor(Math.random() * 10) % x
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
		return times[randomFrom(5)]
	} 
}