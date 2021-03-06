var moment = require('moment')

function generateNotification(driverId, userId, type) {
	var timestamp = moment().format()
	return {
		"id": Math.round(Math.random() * 100000),
		"title": "important notification",
		"body": "Notification for Driver#" + driverId + ". Please pay attention to this notification. Doesn't matter that it's just test notification. It's still notification. Take care. Have a good day.",
		"type": type == 1 ? "general" : "settlement",
		"fromId": driverId,
		"toId": userId,
		"timestamp": timestamp	
	}
}

function generateDriverMessage(driverId, userId, unread) {
	var timestamp = moment().format()
	return {
		"id": Math.round(Math.random() * 100000),
		"body": "Driver message " + timestamp,
		"fromId": driverId,
		"toId": userId,
		"unread": unread,
		"timestamp": timestamp	
	}
}

function generateDispatcherMessage(driverId, userId, unread) {
	var timestamp = moment().format()
	return {
		"id": Math.round(Math.random() * 100000),
		"body": "Dispatcher message " + timestamp,
		"fromId": userId,
		"toId": driverId,
		"unread": unread,
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
		var endPosition = messageIndex

		if (startPosition < 0) {
			startPosition = 0
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
		"unread": false,
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
	generateNotification: generateNotification,
	generateDriverMessage: generateDriverMessage,
	generateDispatcherMessage: generateDispatcherMessage,
	getMessagesBeforePartucular: getMessagesBeforePartucular,
	getMessagesAfterPartucular: getMessagesAfterPartucular,
	markMessagesAsRead: markMessagesAsRead,
	createMessage: createMessage,
	createNotification: createNotification
}
