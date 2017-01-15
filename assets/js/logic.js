// Initialize Firebase
  var config = {
    apiKey: "AIzaSyAQeqcMBRN2X3Sk9SYPVdQ2AsEtRvzvci8",
    authDomain: "train-scheduler-edf91.firebaseapp.com",
    databaseURL: "https://train-scheduler-edf91.firebaseio.com",
    storageBucket: "train-scheduler-edf91.appspot.com",
    messagingSenderId: "429679382774"
  };

  firebase.initializeApp(config);

  //assign database

  var database = firebase.database();



  //create some variables 
var trainName;
var destination;
var startTime;
var frequency;

$("#add-train-btn").on("click", function(event){
	event.preventDefault();
	
	trainName = $("#train-name-input").val().trim();
	destination = $("#destination-input").val().trim();

	
	//add data validation for time input


	startTime = $("#start-input").val().trim();
	console.log(startTime);
	frequency = $("#frequency-input").val().trim();
	
	database.ref().push({
	    trainName: trainName,
	    destination: destination,
	    startTime: startTime,
	    frequency: frequency,
	    dateAdded: firebase.database.ServerValue.TIMESTAMP
	});

	$("input").val("");
});

// firebase.database.ServerValue.TIMESTAMP

//form function

database.ref().on("child_added", function (childSnapshot)  {

	console.log("______NEW TRAIN INFO_______");

	  //get current date/time
	var d = moment(new Date());
	var year = d.year();

	var time = d.format("HH:mm");


	//create variables for each individual additional child added
	var newRow = $("<tr>");

		var trainName = childSnapshot.val().trainName;
		var frequency = childSnapshot.val().frequency;

		var train = $("<td>").text(trainName).appendTo(newRow);
		var destination = $("<td>").text(childSnapshot.val().destination).appendTo(newRow);
		var freq = $("<td>").text(frequency).appendTo(newRow);

		// //calculation

		

		var startTime = childSnapshot.val().startTime;
		var startTime = startTime.split(":");
		var startHour = parseInt(startTime[0]);
		var startMinute = parseInt(startTime[1]);

		console.log("The " + trainName + " began today at " + startTime.join(':') + ".");
		var currentTime = time.split(":");
		var currentHour = parseInt(currentTime[0]);
		var currentMinute = parseInt(currentTime[1]);

		if (currentHour >= startHour && currentMinute >= startMinute) {
			var elapsedHours = currentHour - startHour;
			var elapsedMinutes = currentMinute - startMinute;
			var elapsedTime = elapsedHours * 60 + elapsedMinutes;
			console.log("This means as of " + time + ", this train has run for " + elapsedTime + " minutes.");
		} else  if (currentHour>= startHour && currentMinute < startMinute) {
			var elapsedHours = currentHour - startHour;
			var elapsedMinutes = currentMinute - startMinute + 60;
			var elapsedTime = elapsedHours * 60 + elapsedMinutes;
			console.log("This means as of " + time + ", this train has run for " + elapsedTime + " minutes.");
		} else if (currentMinute <= startMinute) {
			var elapsedHours = startHour - currentHour;
			var elapsedMinutes = currentMinute - startMinute;
			var elapsedTime = elapsedHours * 60 + elapsedMinutes;
			console.log("This means as of " + time + ", this train will first run in " + elapsedTime + " minutes.");
		} else {
			var elapsedHours = startHour - currentHour;
			var elapsedMinutes = startMinute - currentMinute;
			var elapsedTime = elapsedHours * 60 + elapsedMinutes;
			console.log("This means as of " + time + ", this train will first run in " + elapsedTime + " minutes.");
		}

		

		if (elapsedTime > 0) {
			//divide time by the freq, keep as many 
			var timeRemaining = frequency - Math.round(((elapsedTime/parseInt(frequency)) % 1).toFixed(10) * frequency);

		} else {
			var timeRemaining = elapsedTime; 
		}

		console.log("Leaving only " + timeRemaining + " minutes until the train arrives.");

		var hour = 0;
		var minute = 0;

		function convertTime (time) {
			if (time > 60) {
				hour++;
				convertTime(time-60);
			} else {
				minute = time;
				return;
			}
		}

		convertTime(parseInt(timeRemaining));

		var nextMinute = currentMinute + minute;
		var nextHour = currentHour + hour;
		var nextAMPM = " AM";
		if (nextMinute > 60) {
			nextMinute-=60;
			nextHour+=1;
		}

		if (nextMinute < 10) {
			nextMinute = "0" + nextMinute;
		}

		if (nextHour > 12) {
			nextHour-=12;
			nextAMPM = " PM";
		}

		var nextArrival = nextHour + ":" + nextMinute + nextAMPM;

		var nextTrain = $("<td>").text(nextArrival).appendTo(newRow);

		var minutesAway = $("<td>").text(timeRemaining).appendTo(newRow);
		
		// var monthlyRate = $("<td>").text(childSnapshot.val().monthlyRate).appendTo(newRow);
		

		//calculation
	
	newRow.appendTo("tbody");


});