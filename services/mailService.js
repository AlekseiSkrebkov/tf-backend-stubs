var nodemailer = require('nodemailer');
 
// create reusable transporter object using the default SMTP transport 
var transporter = nodemailer.createTransport('smtps://alexey.skrebkov%40gmail.com:googlexedfr1@smtp.gmail.com');
 
 function sendPasswordRestoreLink(email, link) {
	// setup e-mail data with unicode symbols 
	var mailOptions = {
	    from: '"Transflo Command Center" <alexey.skrebkov@gmail.com>', // sender address 
	    to: email,  
	    subject: 'Password reset instructions',  
	    text: 'Please following thi link to create new password: ' + link, 
	    html: '<b>Please following thi link to create new password: ' + link + '</b>' 
	};
	 
	// send mail with defined transport object 
	transporter.sendMail(mailOptions, function(error, info){
	    if(error){
	        return console.log(error);
	    }
	    console.log('Message sent: ' + info.response);
	}); 
 }

 module.exports = {
 	sendPasswordRestoreLink: sendPasswordRestoreLink
 }
