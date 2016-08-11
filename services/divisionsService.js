const divisionsRep = require('../data/static/divisions')
var carrierDivisions = divisionsRep.carriers
var brokerDivisions = divisionsRep.brokers

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

function isCarrierDivision(divisionId) {
	var division = getDivisionById(divisionId)
	return division.type == 'carrier'
}

function isBrokerDivision(divisionId) {
	var division = getDivisionById(divisionId)
	return division.type == 'broker'
}

module.exports = {
	getCarrierDivisionById: getCarrierDivisionById,
	getBrokerDivisionById: getBrokerDivisionById,
	getSubordinateById: getSubordinateById,
	getDivisionById: getDivisionById,
	isCarrierDivision: isCarrierDivision,
	isBrokerDivision: isBrokerDivision
}