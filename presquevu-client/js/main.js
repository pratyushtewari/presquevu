var app = app || {
	View : {},
	Logic : {}, 
	Session : {}
};

var userIDs =  [{"person":"Ramya Mallya", "uid":"108907421997224056509"},
					{"person":"Pratyush Tewari", "uid":"103790459059924001513"},
					{"person":"Jennifer Morioka", "uid":"103968547566080000803"}	
					];
var timerRunning=false;
var server=0;

 $('#disconnect').click(helper.disconnect);


function printinfo(data) {
	console.log(data);
}

function getusername (uid) {
	//default to Ramya.
	var username =  "";
	for(var i = 0; i < userIDs.length; i++) {
		if (userIDs[i].uid == uid) {
			username = userIDs[i].person;
			break;
		}					
	}
	return username;	
}

function getuid (contact) {
	//default to Ramya.
	var userID =  "108907421997224056509";
	for(var i = 0; i < userIDs.length; i++) {
		if (userIDs[i].person.replace(/ /g,'').toLowerCase() == contact.replace(/ /g,'').toLowerCase()) {
			userID = userIDs[i].uid;
			break;
		}					
	}
	return userID;	
}

app.Session.filter = "default";
var RID;
var reminderData =  [];
var retrievedObject;

function reminderClicked(element) {			
			var item = {
				note : element.getAttribute("note"),
				id :  element.getAttribute("data-id"),
				contact: element.getAttribute("contact-person")
			};		
			app.View.editReminders(item);
		}


$(document).ready(function (){
	
	
		
		app.View.initialize = function(){
			app.Logic.getLocation();
			if(!timerRunning){
				app.Logic.startTimer();
				timerRunning=true;
			}

			var template = _.template($('#login').html());
			$('#main_container').html('');
			$('#main_container').html(template());


			// Check browser support
			if (typeof(Storage) != "undefined")
			  {
			  // Store
			  localStorage.setItem('reminderStorage', JSON.stringify(reminderData));
			  // Retrieve
			  retrievedObject = JSON.parse(localStorage.getItem('reminderStorage'));
			}	
			//init the reminder ID.
			RID = retrievedObject.length;
		}

		app.View.renderReminders = function  () {
			var template = _.template($('#reminders').html());
			$('#main_container').html('');
			$('#main_container').html(template());
			// Create the list of the reminders and add it to the ul using the jQuery			
			var listItem = '';
				for (var i = 0;i<retrievedObject.length;i++) {
					listItem += "<li data-id='" + retrievedObject[i].id + "' contact-person='" + retrievedObject[i].person + "' onclick='reminderClicked(this)' note='" + retrievedObject[i].note + "'>";
					listItem += "<p id='remindernote'>" + retrievedObject[i].note + "</p>";
					listItem += "<p id='reminderperson'>" + retrievedObject[i].person + "</p>";
					listItem += "</li>";
				}
			$('#reminderslist').html(listItem);
			$('#addnewreminder').click(function (){
				app.View.addReminder();
			});	
		}

		app.View.editReminders = function  (item) {
			var template = _.template($('#editReminder').html());
			$('#main_container').html('');
			$('#main_container').html(template());
			$('#oldNote').val(item.note);
			$('#oldContact').val(item.contact);
			$('#editReminderButton').click(function (){
				var newNote = document.getElementById("oldNote").value;
				var newContact = document.getElementById("oldContact").value;

				var index;
				// find the item in the array and splice it to remove from the array.
				for(var i = 0; i < retrievedObject.length; i++) {
					if (item.id == retrievedObject[i].id) {
						index = i;
						break;
					}					
				}	
				// Remove the certain item from the json.
				retrievedObject.splice(index,1);
				// Add the edited item
				retrievedObject.push( { "id":retrievedObject.length, "note":newNote, "person":newContact});	
				localStorage.setItem('reminderStorage', JSON.stringify(retrievedObject));	
				app.View.renderReminders();
			});	

			$('#deleteReminderButton').click(function (){				
				// find the item in the array and splice it to remove from the array.
				for(var i = 0; i < retrievedObject.length; i++) {
					if (item.id == retrievedObject[i].id) {
						// Remove the certain item from the json.
						retrievedObject.splice(i,1);
						break;
					}					
				}								
				localStorage.setItem('reminderStorage', JSON.stringify(retrievedObject));	
				app.View.renderReminders();
			});	


		}

		app.View.addReminder = function  () {
			var template = _.template($('#addReminder').html());
			$('#main_container').html('');
			$('#main_container').html(template());
			$('#addReminderButton').click(function (){
				var note = document.getElementById("newNote").value;
				var contact = document.getElementById("newContact").value;
				var id = ++RID;
				retrievedObject.push( { "id":id, "note":note, "person":contact});	
				localStorage.setItem('reminderStorage', JSON.stringify(retrievedObject));
				app.Session.sendReminder(id,getuid(contact));
				app.View.renderReminders();
			});	
			$('#cancelReminderButton').click(function (){				
				app.View.renderReminders();
			});		
		}


		app.Session.sendReminder = function (id,contact){
			console.log("IN SEND REMINDER");
			console.log(me+" "+id+" "+contact);
			socket.emit('newReminder',{"usr1":me , "remId":id , "usr2":contact});
		}

		app.Logic.startTimer = function (){
			setInterval(function(){
				app.Logic.getLocation();},10000);
		}

		app.Logic.getLocation = function() {				  
				  if (navigator.geolocation)
				    	{
				   		 navigator.geolocation.getCurrentPosition(app.Session.sendLocation);
				    	}
				  else{app.Logic.throwError('Sorry, your browser does not support geolocation');}	  
		}

		app.Session.sendLocation = function (position) {
					console.log(position.coords.latitude+" "+position.coords.longitude);
				  socket.emit('locationUpdate',{"usrId":me,"loc":{"usrlat":position.coords.latitude,"usrlong":position.coords.longitude}});	
				  }
		

		
window.onload = app.View.initialize();



});


socket.on('connected',function (data){
	server=socket.id;
	socket.emit('authenticated','Lets go');

});


//Alert that the reminder was successfully saved on the server.	
socket.on('addedReminder',function (data) {
	alert("Reminder Saved!");
});

socket.on('gotProximity',function (data){
	alert(data);
});

//Alert when someone adds you in their reminder list.
socket.on('watchingNotification',function (data){
	//function call to notify user
	alert(getusername(data)+' has just added a reminder for you.');
});

//Alert when the server finds your person in proximity
socket.on('reminderTriggered', function (remId){
	for(var i = 0; i < retrievedObject.length; i++) {
			if (remId == retrievedObject[i].id) {
			alert(retrievedObject[i].person + ' is close by and I wanted to remind about ' + retrievedObject[i].note);
			break;
		}					
	}	
	
});

