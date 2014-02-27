
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var socket = require('socket.io');
var app = express();
var distance = require('google-distance');

// all environments
app.set('port', process.env.PORT || 4567);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));




// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// http.createServer(app).listen(app.get('port'), function(){
//   console.log('Express server listening on port ' + app.get('port'));
// });


app.get('/', routes.index);
app.get('/users', user.list);
app.get('/inject', routes.inject);


var reminders=[];
var usrInfo=[];
var proximity;


var server = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});











var io = socket.listen(server);

io.sockets.on('connection', function (socket) {
 

				//function to get location of a given user id.
		function getLocation (usrId) {
			for (i=0;i<usrInfo.length;i++){
				if(usrId==usrInfo[i].usrId)
					return usrInfo[i].loc;
			}

		}

		//function to get socket id of a fiven user
		function getSocketId (usrId) {
			for (i=0;i<usrInfo.length;i++){
				if(usrId==usrInfo[i].usrId)
					return usrInfo[i].socketId;
			}

		}

		

		//function to accept two locations and see how close they are
		function checkProximity (loc1,loc2) {
			
		//UNCOMMENT THIS!
		distance.get(
		    {    
		        origin: loc1.usrlat+','+loc1.usrlong, 
		        destination: loc2.usrlat+','+loc2.usrlong,
		        mode:'walking',
		        sensor:true 
		    }, 
		    function(err, data) { 
		        if (err) {
		            console.error(err);
		            return;
		        }
		       console.log(data);
		        // [0-9]+\s+min

		  //       var data={ 
				//     index: 1,
				//     distance: '13.6 mi',
				//     duration: '20 mins',
				//     origin: 'Octavia Boulevard, San Francisco, CA 94102, USA',
				//     destination: '2066-2070 University Avenue, Berkeley, CA 94704, USA',
				//     mode: 'driving',
				//     units: 'imperial',
				//     language: 'en',
				//     avoid: null,
				//     sensor: false 
				// };

				console.log(data);
		        var str = data.duration;
				var patt1 = /[0-9]+\s+min/;
				var result = str.match(patt1);
				console.log(result);
				var patt2 = /[0-9]+/;
				var minutesAway=String(result[0].match(patt2));
				console.log('MINUTES AWAY'+minutesAway);
				if (minutesAway<5){
					console.log('THEY ARE CLOSE BY!');
				   proximity=true;
				}
				else{
					console.log('NOPE. TOO FAR!');
					proximity=false;
				}
				// console.log(result);
		});
				console.log('WHAT IS WRONG WITH YOU '+proximity);
				return proximity;
		}

		//function to go through list of reminders and find those which belong to user.
		function testReminders (usrId) {
			
			for(i=0;i<reminders.length;i++){
				if(reminders[i].usr1==usrId || reminders[i].usr2==usrId){
					console.log(reminders[i]);
					var usr1=reminders[i].usr1;
					var usr2=reminders[i].usr2;
					var remId=reminders[i].remId;
					var proximity=checkProximity(getLocation(usr1),getLocation(usr2));
					console.log('proximity:'+proximity);
					if (proximity){
						var usrToNotify = getSocketId(usr1);
						console.log('Reminder triggered for'+usrToNotify);
						io.sockets.socket(usrToNotify).emit('reminderTriggered',remId);
						proximity = undefined;
					}
				}
			}

		}



		//socket.emit('connected','READY!');

		socket.on('newReminder',function (reminder){
			console.log(reminder);
			reminders.push(reminder);
			var usr2=getSocketId(reminder.usr2);
			socket.emit('addedReminder',usr2+' '+usrInfo.length);
			io.sockets.socket(usr2).emit('watchingNotification',reminder.usr1);
		});

		socket.on('userAuthenticated', function(data){
			var newUser={}
			newUser.usrId=data;
			newUser.socketId=socket.id;
			newUser.loc=null;
			usrInfo.push(newUser);
			console.log(newUser);
		});


		socket.on('locationUpdate',function (data){
			//loop through usrInfo. if user doesn't exist, add to array. else find user and update location
			console.log(data);
			console.log(usrInfo.length);
			for(i=0;i<usrInfo.length;i++)
			{
				if(usrInfo[i].usrId==data.usrId){
					usrInfo[i].loc=data.loc;
					//console.log(usrInfo[i].usrId+' updated location ');
					testReminders(data.usrId);
					break;
				}
			}
			
		});




			
});




