const SensorTag  = require('sensortag');
const express = require('express');
const http = require('http');
const app = express();
const mongoose = require('mongoose');

// const dbUrl = process.env.MONGODB_URI || 'mongodb://localhost:sensorlog/sensorlog';
// mongoose.connect(dbUrl);


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
			console.log('\Object Temp = %d C', objectTemp.toFixed(1));
			console.log('\Ambient Temp = %d C', ambientTemp.toFixed(1));
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
				tag.disconnect();
			}

		});
	}

	connectAndSetUpMe();

});



