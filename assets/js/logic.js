//google sign-in

/**
    * Function called when clicking the Login/Logout button.
*/
// [START buttoncallback]
function toggleSignIn() {
  if (!firebase.auth().currentUser) {
    // [START createprovider]
    var provider = new firebase.auth.GoogleAuthProvider();
    // [END createprovider]
    // [START addscopes]
    provider.addScope('https://www.googleapis.com/auth/plus.login');
    // [END addscopes]
    // [START signin]
    firebase.auth().signInWithPopup(provider).then(function(result) {
      // This gives you a Google Access Token. You can use it to access the Google API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;
      // [START_EXCLUDE]
      document.getElementById('quickstart-oauthtoken').textContent = token;
      // [END_EXCLUDE]
    }).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      // [START_EXCLUDE]
      if (errorCode === 'auth/account-exists-with-different-credential') {
        alert('You have already signed up with a different auth provider for that email.');
        // If you are using multiple auth providers on your app you should handle linking
        // the user's accounts here.
      } else {
        console.error(error);
      }
      // [END_EXCLUDE]
    });
    // [END signin]
  } else {
    // [START signout]
    firebase.auth().signOut();
    // [END signout]
  }
  // [START_EXCLUDE]
  document.getElementById('quickstart-sign-in').disabled = true;
  // [END_EXCLUDE]
}
// [END buttoncallback]
/**
 * initApp handles setting up UI event listeners and registering Firebase auth listeners:
 *  - firebase.auth().onAuthStateChanged: This listener is called when the user is signed in or
 *    out, and that is where we update the UI.
 */
function initApp() {
  // Listening for auth state changes.
  // [START authstatelistener]
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in.
      var displayName = user.displayName;
      var email = user.email;
      var emailVerified = user.emailVerified;
      var photoURL = user.photoURL;
      var isAnonymous = user.isAnonymous;
      var uid = user.uid;
      var providerData = user.providerData;
      // [START_EXCLUDE]
      document.getElementById('quickstart-sign-in-status').textContent = 'Signed in';
      document.getElementById('quickstart-sign-in').textContent = 'Sign out';
      document.getElementById('quickstart-account-details').textContent = JSON.stringify(user, null, '  ');
      // [END_EXCLUDE]
    } else {
      // User is signed out.
      // [START_EXCLUDE]
      document.getElementById('quickstart-sign-in-status').textContent = 'Signed out';
      document.getElementById('quickstart-sign-in').textContent = 'Sign in with Google';
      document.getElementById('quickstart-account-details').textContent = 'null';
      document.getElementById('quickstart-oauthtoken').textContent = 'null';
      // [END_EXCLUDE]
    }
    // [START_EXCLUDE]
    document.getElementById('quickstart-sign-in').disabled = false;
    // [END_EXCLUDE]
  });
  // [END authstatelistener]
  document.getElementById('quickstart-sign-in').addEventListener('click', toggleSignIn, false);
}
window.onload = function() {
  initApp();
};

// Initialize Firebase
  const config = {
    apiKey: "AIzaSyAQeqcMBRN2X3Sk9SYPVdQ2AsEtRvzvci8",
    authDomain: "train-scheduler-edf91.firebaseapp.com",
    databaseURL: "https://train-scheduler-edf91.firebaseio.com",
    storageBucket: "train-scheduler-edf91.appspot.com",
    messagingSenderId: "429679382774"
  };

  const defaultApp = firebase.initializeApp(config);

  console.log(defaultApp.name)

  //assign database

  const database = firebase.database();
 
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