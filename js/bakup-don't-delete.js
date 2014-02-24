
var reminderData =  [{"id":"1", "Title":"talk about pears","person":"jennifer"},
{"id":"2", "Title":"talk about car","person":"pratyush"}]


function renderReminders () {
var ul = document.getElementById("reminders");
		for (var i = 0;i<reminderData.length;i++) {
			var listItem = document.createElement("li");			
			listItem.setAttribute("data-id", reminderData[i].id );
			listItem.setAttribute("onclick", "reminderClicked(this)");
			listItem.appendChild(document.createTextNode(reminderData[i].Title));
			listItem.appendChild(document.createTextNode(reminderData[i].person));
			ul.appendChild(listItem); 
		}
}		

















// Utility to add Title casing to Strings
String.prototype.toTitleCase = function () {
  var smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|of|on|or|the|to|vs?\.?|via)$/i;

  return this.replace(/([^\W_]+[^\s-]*) */g, function (match, p1, index, title) {
    if (index > 0 && index + p1.length !== title.length &&
      p1.search(smallWords) > -1 && title.charAt(index - 2) !== ":" && 
      title.charAt(index - 1).search(/[^\s-]/) < 0) {
      return match.toLowerCase();
    }

    if (p1.substr(1).search(/[A-Z]|\../) > -1) {
      return match;
    }

    return match.charAt(0).toUpperCase() + match.substr(1);
  });
};



function loadFromStorage()
{
	var reminderDataString = window.localStorage["reminderData"];
	reminderData = JSON.parse(reminderDataString);
	reload();
}
 
function saveToStorage()
{
	var reminderDataString = JSON.stringify(reminderData);
	window.localStorage["reminderData"] = reminderDataString;
}

var app = app || {
	View : {},
	Logic : {}, 
	Session : {}
};

app.Session.filter = "default";

function locationClicked(element) {
	console.log("Name: " + element.innerHTML);
	console.log("Id: " + element.getAttribute("data-id"));
	var place = {
		name : element.innerHTML,
		id :  element.getAttribute("data-id")
	};
	var time = "";
	app.Logic.addUserToEvent(place, time);
	app.View.renderChatMenu(place);
	//app.View.renderChatPage('default');
	// add user to this event 
}


$(function(){

app.Logic.addUserToPeople = function ( name, meta ){
    var peopleRef = new Firebase("https://hackny.firebaseio.com/people/");
    var ref = peopleRef.push({name:name, meta:meta});
    app.Session.name = name;
    app.Session.meta = meta;
};

app.View.initialize = function(){

	$(document).ready(function(){
		$('.chzn').chosen();
	});

	template = _.template( $('#loginPage').html() );
	$('#main_container').html(template( {name: '', day:''} ));

	$('#enterLoginInfo').on('click', function(){
			var name = $('#name').val();
			var email = $('#email').val();
			var phone = $('#phone').val();

		    console.log("Selected interests: " + $('#input-interests').val());

			var meta = {
				email : email, 
				phone : phone, 
				interests : ($('#input-interests').val() || [])
			};
			app.Logic.addUserToPeople(name, meta);
			app.View.renderLocationPage();
		} );

	$('#cover').delay(1500).fadeOut(1000);
	app.Session.filter = "default";
};

// opens default chat session
app.Logic.addUserToEvent = function (event, time){

	app.Session.event = event;
    var eventRef = new Firebase("https://hackny.firebaseio.com/events/" + event.id + "/");

    for (var i=0;i<app.Session.meta.interests.length;i++){
       var attendeesRef = new Firebase("https://hackny.firebaseio.com/events/" + event.id + "/" + app.Session.meta.interests[i] + "/" + "people" + "/");
       attendeesRef.push({
        name: app.Session.name,
        time : time, 
        meta : app.Session.meta
       });
    }
     var attendeesRef = new Firebase("https://hackny.firebaseio.com/events/" + event.id + "/" + "default" + "/" + "people" + "/");
       attendeesRef.push({
        name: app.Session.name,
        time : time, 
        meta : app.Session.meta
    });
}


// gets all meta data of users of certain filter
// filter == none returs all attendees
app.Logic.getAttendees = function ( event, filter, callback ){

    // get refs to all attendees
    var attendeesRef = new Firebase("https://hackny.firebaseio.com/events/" + event + "/" + filter + "/" + "people" + "/");
    attendeesRef.on('child_added', function(snapshot) {
    	var attendee = snapshot.val();
    	console.log(attendee);
    	callback( attendee );
    });
}

app.Logic.setFilter = function(filter) {
	app.Session.filter = filter;
}

app.Logic.addChat = function(text){
	// console.log("Add CHAT!");
	// app.Session.filter = "default"; // change depending on what chatroom you are in
	time = new Date();
    var chatRef = new Firebase("https://hackny.firebaseio.com/events/" + app.Session.event.id + "/" + app.Session.filter + "/" + "chat" + "/");
	chatRef.push({
        name: app.Session.name,
        time : time, 
        text : text
       });
}

app.Logic.getChat = function( callback ){

    // get refs to all attendees
    // change session.filter depending on what chatroom you are in
    var chatRef = new Firebase("https://hackny.firebaseio.com/events/" + app.Session.event.id + "/" + app.Session.filter + "/" + "chat" + "/");
    var chatRefLimited = chatRef.limit(5);

    chatRefLimited.on('child_added', function(snapshot) {
    	var chat = snapshot.val();

    	callback( chat );
    });
}

app.View.renderMessage = function(text) {
	template = _.template($('#chatroom-message').html());
	var time = new Date();
	var timeStamp = (time.getMonth() + 1) + "/" + time.getDate() + "/" + time.getFullYear() + " " + time.getHours() + ":" + (time.getMinutes()<10?'0':'') + time.getMinutes();
	$('#msg-list').append(template({message : text.text, username : text.name, timestamp : timeStamp}));
}


app.View.renderLocationPage = function(){

	app.View.drawLocation();
	app.View.getLocation();
};

app.View.renderChatMenu = function( filter ){

	var filters = [ 'default', 'art', 'sports', 'music', 'technology', 'food'];
	var counts = [];
	var count = 0;

	for (var i=0;i<filters.length;i++){
		var k = i;
		console.log("https://hackny.firebaseio.com/events/" + app.Session.event.id + "/" + filters[i] + "/" + "people" + "/");
    	var attendeesRef = new Firebase("https://hackny.firebaseio.com/events/" + app.Session.event.id + "/" + filters[i] + "/" + "people" + "/");
    	attendeesRef.on('value', function(snapshot) {
    	var t = snapshot.val();
    	if (t) {
    	counts[count] = Object.keys(t).length;
    	console.log("k is " + k);
    	console.log('adding to array' + counts[count]);
    	count+=1;
    	} else 
    	{
	    	console.log("k is " + k);

    		counts[count]=0;
    		count+=1;
    	}
    	if (count == 6) {
    		app.View.FinishChatMenu(filter, counts);
    	}
    });
	}
}

app.View.FinishChatMenu = function(filter, counts){


	var numPublicAttendees = counts[0];
	var numArtAttendees = counts[1];
	var numSportsAttendees = counts[2];
	var numMusicAttendees = counts[3];
	var numTechAttendees = counts[4];
	var numFoodAttendees = counts[5];

	var template = _.template($('#chatMenuTemplate').html());
	$('#main_container').html( template({

		numberOfPublicAttendees : numPublicAttendees,
		numberOfArtAttendees : numArtAttendees,
		numberOfSportsAttendees : numSportsAttendees,
		numberOfMusicAttendees : numMusicAttendees,
		numberOfTechnologyAttendees : numTechAttendees,
		numberOfFoodAttendees : numFoodAttendees
	}) );

	// Set all buttons to disabled. We will add logic to enable each button if they have more than 1 person, or they have selected an interest
	$('#artChat').attr("disabled", "diabled").addClass("btn-disabled");
	$('#sportsChat').attr("disabled", "diabled").addClass("btn-disabled");
	$('#musicChat').attr("disabled", "diabled").addClass("btn-disabled");
	$('#technologyChat').attr("disabled", "diabled").addClass("btn-disabled");
	$('#foodChat').attr("disabled", "diabled").addClass("btn-disabled");
	$('#artAttendees').attr("disabled", "diabled").addClass("btn-disabled");
	$('#sportsAttendees').attr("disabled", "diabled").addClass("btn-disabled");
	$('#musicAttendees').attr("disabled", "diabled").addClass("btn-disabled");
	$('#technologyAttendees').attr("disabled", "diabled").addClass("btn-disabled");
	$('#foodAttendees').attr("disabled", "diabled").addClass("btn-disabled");
	
	//app.View.renderChatPage('default');
	$('#defaultChat').on("click", function() {app.View.renderChatPage('default');});
	$('#defaultChatAttendees').on("click", function() {app.View.renderAttendeesPage("default");});

	// TODO - ADD logic to fetch the number of attendees for each interests.

	for (var i = 0; i < app.Session.meta.interests.length; i++) {
		console.log(app.Session.meta.interests[i]);
 
		if (app.Session.meta.interests[i] === "art") {
			$('#artChat').on("click", function() {app.View.renderChatPage('art')}).removeAttr("disabled", "disabled").removeClass("btn-disabled");
		}

		if (app.Session.meta.interests[i] === "sports") {
			$('#sportsChat').on("click", function() {app.View.renderChatPage('sports')}).removeAttr("disabled", "disabled").removeClass("btn-disabled");
		}

		if (app.Session.meta.interests[i] === "music") {
			$('#musicChat').on("click", function() {app.View.renderChatPage('music')}).removeAttr("disabled", "disabled").removeClass("btn-disabled");
		}

		if (app.Session.meta.interests[i] === "technology") {
			$('#technologyChat').on("click", function() {app.View.renderChatPage('technology')}).removeAttr("disabled", "disabled").removeClass("btn-disabled");
		}

		if (app.Session.meta.interests[i] === "food") {
			$('#foodChat').on("click", function() {app.View.renderChatPage('food')}).removeAttr("disabled", "disabled").removeClass("btn-disabled");
		}
	}



	// If there are more than 0 people, then allow viewing user list
	if (numArtAttendees > 0 && $('#artChat').is(':disabled') == false) {
		$('#artAttendees').removeAttr("disabled", "disabled").removeClass("btn-disabled").click(function() {app.View.renderAttendeesPage("art");});
	}
	
	if (numSportsAttendees > 0 && $('#sportsChat').is(':disabled') == false) {
		$('#sportsAttendees').removeAttr("disabled", "disabled").removeClass("btn-disabled").click(function() {app.View.renderAttendeesPage("sports");})
	}

	if (numMusicAttendees > 0 && $('#musicChat').is(':disabled') == false) {
		$('#musicAttendees').removeAttr("disabled", "disabled").removeClass("btn-disabled").click(function() {app.View.renderAttendeesPage("music");})
	}

	if (numTechAttendees > 0 && $('#technologyChat').is(':disabled') == false) {
		$('#technologyAttendees').removeAttr("disabled", "disabled").removeClass("btn-disabled").click(function() {app.View.renderAttendeesPage("technology");})
	}

	if (numFoodAttendees > 0 && $('#foodChat').is(':disabled') == false) {
		$('#foodAttendees').removeAttr("disabled", "disabled").removeClass("btn-disabled").click(function() {app.View.renderAttendeesPage("food");})
	}	
}

app.View.renderChatPage = function( filter ){

	app.Session.filter = filter;

	var tempFilter = "Public";

	if (filter !== "default") {
		tempFilter = filter.toTitleCase();
	}

	template = _.template($('#chatroom').html());
	$('#main_container').html(template({filter : tempFilter, location : app.Session.event.name}));
	$('#back-chatmenu').on("click", function() {app.View.renderChatMenu(app.Session.event.name)});
	$('#chatbox-submit').on("click", function() {app.View.sendChat()});

	
	// Prevent form from sending when pressing enter. Send chat instead.
	$(document).on("keypress", 'form', function (e) {
    var code = e.keyCode || e.which;
    if (code == 13) {
        e.preventDefault();
        app.View.sendChat()
        return false;
    }
});
	
	app.Logic.getChat(app.View.renderMessage);
	console.log('rendering chat page');
}

app.View.sendChat = function() {
	//console.log("SEND CHAT!");
	app.Logic.addChat($('#chatbox-input').val());
	
	$('#chatbox-input').val("");
	
}

app.View.renderAttendeesPage = function( filter ){

	var template = _.template($('#attendeesListTemplate').html());
	$('#main_container').html('');
	$('#main_container').html( template() );
	$('#back-attendee-chatmenu').on("click", function() {app.View.renderChatMenu(app.Session.event.name)});
	app.Logic.getAttendees(app.Session.event.id, filter, function( attendee ){

		console.log(attendee);
		var t = _.template($('#attendeeTemplate').html());

		$('#attendeeList').append( t(attendee) );

	});

}

app.View.drawLocation = function() {
	template = _.template($('#locationPage').html());
	$('#main_container').html(template());

	console.log('HERE ');
	console.log( $('#main_container') );
	
}

app.View.getLocation = function() {
	//var x=document.getElementById("demo");
	console.log("in get loc");
	var foursquareData;

	function getLocation()
	{
	if (navigator.geolocation)
		{
		navigator.geolocation.getCurrentPosition(showPosition);
		}
	//else{ x.innerHTML="Geolocation is not supported by this browser."; }
	}
	function showPosition(position)
	{
		  var map = L.mapbox.map('map', 'mayakreidieh.map-kb1dxm8i')
      .setView([position.coords.latitude, position.coords.longitude], 15);
		var xhr = new XMLHttpRequest();
		xhr.open("GET", "https://api.foursquare.com/v2/venues/search?ll=" + position.coords.latitude + "," + position.coords.longitude + "&oauth_token=2ZBTC4SWH5UO1UTOPCXOARGZ5RXLFM3NFRVE1UNFDMNGLGPN&v=20130928", false);
		xhr.send();
		foursquareData = JSON.parse(xhr.responseText);

	//x.innerHTML= "Status: " + xhr.status + "<br/>" + "StatusText: " + xhr.responseText;
	
		var ul = document.getElementById("locations");
		console.log("Locations");
		console.log(ul);
		for (var i = 0;i<foursquareData.response.venues.length;i++) {
			var listItem = document.createElement("li");
			
			listItem.setAttribute("data-id", foursquareData.response.venues[i].id );
			listItem.setAttribute("onclick", "locationClicked(this)");
			listItem.appendChild(document.createTextNode(foursquareData.response.venues[i].name));
			ul.appendChild(listItem); 
		}
		//x.appendChild(ul);
	}	
	getLocation();

}

window.onload = app.View.initialize();

});

/*
insert following to init:
$('.chzn').chosen()

*/
