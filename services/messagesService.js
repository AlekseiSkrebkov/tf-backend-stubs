var moment = require('moment')

function generateNewDriverMessage(driverId, userId) {
	var timestamp = moment()
	return {
		"id": Math.round(Math.random() * 100000),
		"body": "Generated message " + timestamp,
		"fromId": driverId,
		"toId": userId,
		"unread": true,
		"timestamp": timestamp	
	}
}


function getMessagesBeforePartucular(messages, messageId, quantity) {
	console.log('messageId', messageId)
	console.log('quantity0', quantity)

	if (messageId == null) {
		return messages.slice(quantity * -1)
	} else  {
		var messageIndex = messages.findIndex(function(message) {
			return message.id == parseInt(messageId)
		})
		console.log('messageIndex', messageIndex)

		var startPosition = messageIndex - parseInt(quantity)
		var endPosition = startPosition + parseInt(quantity)

		if (startPosition < 0) {
			startPosition = 0
			endPosition =  messageIndex
		}
		console.log('startPosition', startPosition)
		console.log('endPosition', endPosition)
		console.log('quantity', quantity)
		return messages.slice(startPosition, endPosition)	
	}
}

function getMessagesAfterPartucular(messages, messageId, quantity) {
	console.log('messageId', messageId)
	if (messageId == null) {
		return messages.slice(0, quantity)
	} else  {
		var messageIndex = messages.findIndex(function(message) {
			return message.id == messageId
		})
		console.log('messageIndex', messageIndex)

		var endPosition = messageIndex + parseInt(quantity) + 1
		var startPosition = messageIndex + 1

		if (endPosition >= messages.length) {
			endPosition = messages.length
		}

		console.log('startPosition', startPosition)
		console.log('endPosition', endPosition)
		console.log('quantity', quantity)
		return messages.slice(startPosition, endPosition)	
	}
}

function markMessagesAsRead(messages) {
	for (var i = 0; i < messages.length; i++) {
		messages[i].unread = false
	}
}

function createMessage(driverId, sender, message) {
	var timestamp = moment()
	return {
		"id": Math.round(Math.random() * 100000),
		"body": message,
		"fromId": sender,
		"toId": driverId,
		"unread": true,
		"timestamp": timestamp	
	}
}

function createNotification(driverId, sender, message, title, type) {
	var timestamp = moment()
	return {
		"id": Math.round(Math.random() * 100000),
		"body": message,
		"title": title,
		"type": type,
		"fromId": sender,
		"toId": driverId,
		"timestamp": timestamp	
	}
}


module.exports = {
	generateNewDriverMessage: generateNewDriverMessage,
	getMessagesBeforePartucular: getMessagesBeforePartucular,
	getMessagesAfterPartucular: getMessagesAfterPartucular,
	markMessagesAsRead: markMessagesAsRead,
	createMessage: createMessage,
	createNotification: createNotification
}
