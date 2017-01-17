// Initialize Firebase
  var config = {
    apiKey: "AIzaSyAQeqcMBRN2X3Sk9SYPVdQ2AsEtRvzvci8",
    authDomain: "train-scheduler-edf91.firebaseapp.com",
    databaseURL: "https://train-scheduler-edf91.firebaseio.com",
    storageBucket: "train-scheduler-edf91.appspot.com",
    messagingSenderId: "429679382774"
  };

  var defaultApp = firebase.initializeApp(config);

  console.log(defaultApp.name)

  //assign database

  var database = firebase.database();

 //Google Log-in functions

 function onSuccess(googleUser) {
    var profile = googleUser.getBasicProfile();
    gapi.client.load('plus', 'v1', function () {
        var request = gapi.client.plus.people.get({
            'userId': 'me'
        });
        //Display the user details
        request.execute(function (resp) {
            var profileHTML = '<div class="profile"><div class="head">Welcome '+resp.name.givenName+'! <a href="javascript:void(0);" onclick="signOut();">Sign out</a></div>';
            profileHTML += '<img src="'+resp.image.url+'"/><div class="proDetails"><p>'+resp.displayName+'</p><p>'+resp.emails[0].value+'</p><p>'+resp.gender+'</p><p>'+resp.id+'</p><p><a href="'+resp.url+'">View Google+ Profile</a></p></div></div>';
            $('.userContent').html(profileHTML);
            $('#gSignIn').slideUp('slow');
        });
    });
}
function onFailure(error) {
    alert(error);
}

function renderButton() {
    gapi.signin2.render('gSignIn', {
        'scope': 'profile email',
        'width': 240,
        'height': 50,
        'longtitle': true,
        'theme': 'dark',
        'onsuccess': onSuccess,
        'onfailure': onFailure
    });
}

function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        $('.userContent').html('');
        $('#gSignIn').slideDown('slow');
    });
}


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
	$("#year").text(year);
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

		var elapsedHours, elapsedMinutes, elapsedTime, 
			hoursTillStart, minutesTillStart, timeTillStart,
			timeRemaining;

		if(startTime < currentTime) {
			elapsedHours = currentHour - startHour;
			if (currentMinute >= startMinute) {
				elapsedMinutes = currentMinute - startMinute;
				elapsedTime = elapsedHours * 60 + elapsedMinutes
			} else {
				elapsedMinutes = startMinute - currentMinute; //positive number
				elapsedTime = elapsedHours * 60 - elapsedMinutes;
			}
			console.log("This means as of " + time + ", this train has run for " + elapsedTime + " minutes.");
			timeRemaining = frequency - Math.round(((elapsedTime/parseInt(frequency)) % 1).toFixed(10) * frequency);
		} else {
			var hoursTillStart = startHour - currentHour;
			if (startMinute >= currentMinute) {
				minutesTillStart = startMinute - currentMinute;
				timeTillStart = hoursTillStart * 60 + minutesTillStart;
			} else {
				minutesTillStart = currentMinute - startMinute;
				timeTillStart = hoursTillStart * 60 - minutesTillStart;
			}
			console.log("This means as of " + time + ", this train will first run in " + timeTillStart + " minutes.");
			timeRemaining = timeTillStart; 
		}

		console.log("Leaving only " + timeRemaining + " minutes until the train arrives.");

		var hour = 0;
		var minute = 0;

		function convertTime (time) {
			if (time >= 60) {
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
		if (nextMinute >= 60) {
			nextMinute-=60;
			nextHour+=1;
		}

		if (nextHour >= 24) {
			nextHour-=24;
			nextAMPM = " AM";
			if (nextHour === 0) {
				nextHour = "0" + nextHour;
			}
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