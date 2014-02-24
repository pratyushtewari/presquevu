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

var reminderData =  [];

function reminderClicked(element) {			
			var item = {
				value : element.innerHTML,
				id :  element.getAttribute("data-id"),
				contact: element.getAttribute("contact-person")
			};		
			app.View.editReminders(item);
		}


$(document).ready(function (){
	var retrievedObject;

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
			  retrievedObject = JSON.parse(localStorage.getItem('reminderStorage'));
			}			  		
		}

		app.View.renderReminders = function  () {
			var template = _.template($('#reminders').html());
			$('#main_container').html('');
			$('#main_container').html(template());
			var ul = document.getElementById("reminderslist");
				for (var i = 0;i<retrievedObject.length;i++) {
					var listItem = document.createElement("li");			
					listItem.setAttribute("data-id", retrievedObject[i].id);
					listItem.setAttribute("contact-person", retrievedObject[i].person );
					listItem.setAttribute("onclick", "reminderClicked(this)");
					listItem.appendChild(document.createTextNode(retrievedObject[i].note));
					listItem.appendChild(document.createTextNode(retrievedObject[i].person));
					ul.appendChild(listItem); 
				}

			$('#addnewreminder').click(function (){
				app.View.addReminder();
			});	
		}

		app.View.editReminders = function  (item) {
			var template = _.template($('#editReminder').html());
			$('#main_container').html('');
			$('#main_container').html(template());
			$('#oldNote').val(item.value);
			$('#oldContact').val(item.contact);
			$('#editReminderButton').click(function (){
				var newNote = document.getElementById("oldNote").value;
				var newContact = document.getElementById("oldContact").value;
				var index = item.id;
				// Remove the certain item from the json.
				// NOT WORKING ..... FIND A WAY TO REMOVE OR EDIT THE ITEM INPLACE.
				
				retrievedObject.splice(index,1);
				// Add the edited item
				retrievedObject.push( { "id":retrievedObject.length, "note":newNote, "person":newContact});	
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
				var id = retrievedObject.length;
				retrievedObject.push( { "id":id, "note":note, "person":contact});	
				localStorage.setItem('reminderStorage', JSON.stringify(retrievedObject));	
				app.View.renderReminders();
			});		
		}
		
window.onload = app.View.initialize();

});

