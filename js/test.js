var app = app || {
	View : {},
	Logic : {}, 
	Session : {}
};


function signinCallback(authResult) {
  if (authResult['status']['signed_in']) {
    // Update the app to reflect a signed in user
    // Hide the sign-in button now that the user is authorized, for example:
    document.getElementById('signinButton').setAttribute('style', 'display: none');
    app.View.renderReminders();
  } else {
    // Update the app to reflect a signed out user
    // Possible error values:
    //   "user_signed_out" - User is signed-out
    //   "access_denied" - User denied access to your app
    //   "immediate_failed" - Could not automatically log in the user
    console.log('Sign-in state: ' + authResult['error']);
  }
}

app.Session.filter = "default";

var reminderData =  [{"id":"1", "Title":"talk about pears","person":"jennifer"},
{"id":"2", "Title":"talk about car","person":"pratyush"}];

function reminderClicked(element) {			
			var item = {
				value : element.innerHTML,
				id :  element.getAttribute("data-id"),
				contact: element.getAttribute("contact-person")
			};		
			app.View.editReminders(item);
		}


$(document).ready(function (){

		app.View.initialize = function(){
			var template = _.template($('#login').html());
			$('#main_container').html('');
			$('#main_container').html(template());


			// Check browser support
			if (typeof(Storage) != "undefined")
			  {
			  // Store
			  localStorage.setItem('reminderStorage', JSON.stringify(reminderData));
			  // Retrieve
			  var retrievedObject = localStorage.getItem('reminderStorage');
			  console.log('retrievedObject: ', JSON.parse(retrievedObject));
			  }
			else
			  {
			  document.getElementById("result").innerHTML="Sorry, your browser does not support Web Storage...";
			  }
		
		}

		app.View.renderReminders = function  () {
			var template = _.template($('#reminders').html());
			$('#main_container').html('');
			$('#main_container').html(template());
			var ul = document.getElementById("reminderslist");
				for (var i = 0;i<reminderData.length;i++) {
					var listItem = document.createElement("li");			
					listItem.setAttribute("data-id", reminderData[i].id );
					listItem.setAttribute("contact-person", reminderData[i].person );
					listItem.setAttribute("onclick", "reminderClicked(this)");
					listItem.appendChild(document.createTextNode(reminderData[i].Title));
					listItem.appendChild(document.createTextNode(reminderData[i].person));
					ul.appendChild(listItem); 
				}
		}

		app.View.editReminders = function  (item) {
			var template = _.template($('#editReminders').html());
			$('#main_container').html('');
			$('#main_container').html(template());
			$('#note').val(item.value);
			$('#contact').val(item.contact);			
		}
		
window.onload = app.View.initialize();

});

