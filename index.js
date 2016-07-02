const SensorTag  = require('sensortag');
const express = require('express');
const http = require('http');
const app = express();
// const mongoose = require('mongoose');
const  AWS = require('aws-sdk'); 

// const dbUrl = process.env.MONGODB_URI || 'mongodb://localhost:sensorlog/sensorlog';
// mongoose.connect(dbUrl);


AWS.config.apiVersions = {
	dynamodb: '2016-07-02'
}
AWS.config.update({
	region: 'us-west-2',
	endpoint: "https://dynamodb.us-west-2.amazonaws.com",
	
});
const docClient = new AWS.DynamoDB.DocumentClient();
const table = "raspsensorlog";

SensorTag.discover(function(tag) {
	console.log('start discover');
	tag.on('disconnect', function() {
		console.log('disconnected!');
		process.exit(0);
	});

	function connectAndSetUpMe() {
		console.log('connectAndSetUp');
		tag.connectAndSetUp(enableIrTempMe);
	};

	function enableIrTempMe() {
		console.log('enableIRTemperatureSensor');
		tag.enableIrTemperature(notifyMe);
	}

	function notifyMe() {
		tag.notifyIrTemperature(listenForTempReading);
		tag.notifySimpleKey(listenForButton);
	}

	function listenForTempReading() {
		tag.on('irTemperatureChange', function(objectTemp, ambientTemp) {
			//console.log('\Object Temp = %d C', objectTemp.toFixed(1));
			//console.log('\Ambient Temp = %d C', ambientTemp.toFixed(1));
			const params = {
				TableName: table,
				Item: { 
				"created": Date.now(),
				"type": "temperature",
				"objecttemp": objectTemp.toFixed(1),
				"ambienttemp": ambientTemp.toFixed(1)
				}
			}
			docClient.put(params, function(err, data) {
				if (err) {
					console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
				} else {
					console.log("Added item:", JSON.stringify(data, null, 2));
				}
			});
		});
	}

	function listenForButton() {
		tag.on('simpleKeyChange', function(left, right) {
			if (left) {
				console.log('left: ', + left);
			}
			if (right) {
				console.log('right: ' + right);
			}

			if (left && right) {
				var params = {
				    TableName: table,
				    Key:{
				        "type": "temperature"
    					}
				};

				docClient.get(params, function(err, data) {
    					if (err) {
        					console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
    					} else {
        					console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
   					}
				});
				tag.disconnect();
			}

		});
	}

	connectAndSetUpMe();

});



