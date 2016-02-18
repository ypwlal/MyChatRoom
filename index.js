var express = require('express');
var path = require('path');


var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(path.join(__dirname, 'app')));

app.get('/', function(req, res){
	res.sendFile(__dirname + 'index.html');
});
app.get('/chatroom', function(req, res){
	res.sendFile(__dirname + '/app/index.html');//__dirname is index.js's dir
});

var UsersList = [];

var checkUsrRepeat = function(username){
	for(var i = 0;i<UsersList.length;i++){
		if( username == UsersList[i] ){
			return false;
		}
	}
	return true;
};

io.on('connection', function(socket){
	console.log('[socket.id]:'+socket.id+' a user connected');
	
	
	socket.on('comein', function(data){
		console.log(checkUsrRepeat(data.username));
		if ( checkUsrRepeat(data.username) ){
			socket.username = data.username;
			UsersList.push(data.username);
			console.log('currentUser number:'+UsersList.length);
			console.log(UsersList);
			socket.emit('login status', {
				status:true,
				numUsers: UsersList.length
			});
			socket.broadcast.emit('someone joned', {
				username: data.username,
				numUsers: UsersList.length
			});
		}else{
			socket.emit('login status', { status:false });
		}
		
	});

	socket.on('disconnect', function(){
		if(UsersList.length >= 1 ){
			var index = -1;
			for(var i=0;i<UsersList.length;i++){
				if(UsersList[i] == socket.username){
					index = i;
				}
			}
			console.log(index);
			if( index != -1 ){
				for(var j=index;j<UsersList.length;j++){
					UsersList[j] = UsersList[j+1];
				}
				UsersList.length = UsersList.length -1;
				console.log(UsersList);
				console.log('user disconnected');
				console.log('currentUser number:'+UsersList.length);
				socket.broadcast.emit('someone left', {
					username: socket.username,
					numUsers: UsersList.length
				});
			}else{
				return
			}
			
		}else{
			UsersList = [];
		}

	});



	socket.on('input message', function(msg){
	    console.log('message: ' + msg);
	    io.emit('add message', {usr:socket.username, ctn:msg});
	});

	socket.on('typing', function(){
		console.log(socket.username+" is typing");
		socket.broadcast.emit('someone typing', socket.username);
	});

	socket.on('stop typing', function(){
		console.log(socket.username+" stops typing");
		socket.broadcast.emit('someone stop typing', socket.username);
	});
});

http.listen(3000, function(){
	console.log('listening on *:3000');
});


