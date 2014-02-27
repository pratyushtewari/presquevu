var socket=io.connect('/');
$(document).ready(function(){

	navigator.geolocation.getCurrentPosition(function (position){
			$('#currentLocation').html(position.coords.latitude+','+position.coords.longitude);
	})

	$('#add').click(function(){
		var loc={'usrlat':$('#lat').val(),'usrlong':$('#lng').val()};
		socket.emit('locationUpdate',{'usrId':$('#usrId').val(),'loc':loc});
	});
});