angular.module('chatRoom')
.controller('chatCtrl', ['$scope','$timeout', function($scope, $timeout){

	var TYPING = false;
	var timer = null;
	$scope.isLogin = false;
	$scope.messagesList = [];
	$scope.inputMessage = '';
	var COLORS = [
		'#e21400', '#91580f', '#f8a700', '#f78b00',
	    '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
	    '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
	];

	var getUsernameColor =function(username) {
	    // Compute hash code
	    if( username == 'log'){
	    	return 'gray';
	    }else{
	    	var hash = 7;
		    for (var i = 0; i < username.length; i++) {
		       hash = username.charCodeAt(i) + (hash << 5) - hash;
		    }
		    // Calculate color
		    var index = Math.abs(hash % COLORS.length);
		    return COLORS[index];
	    }
	}; 

	var updateList = function(msg){
		$scope.messagesList.push(msg);
		if($scope.messagesList.length > 10){
			$scope.messagesList.shift();
			//console.log($scope.messagesList); 
		}
		$scope.$apply();
	}; 

	var socket = io();
	
	socket.on('someone joned', function(data){
		updateList({usr:"log", ctn:data.username+" has come in", color:getUsernameColor(data.username)});
		updateList({usr: "log", ctn: "Now current users number :"+ data.numUsers, color:'gray'});
		//console.log($scope.messagesList);
		//console.log(data.username+" has come in.");
		//console.log("Now current users number :"+ data.numUsers);
	});
	
	socket.on('someone left', function(data){
		updateList({usr: 'log', ctn: data.username+" has left", color:getUsernameColor(data.username)});
		updateList({usr: 'log', ctn: "Now current users number :"+data.numUsers, color:getUsernameColor("log")});
		//console.log(data.username+" has left.");
		//console.log("Now current users number :"+ data.numUsers);
	});

	socket.on('someone typing', function(username){
		var sameIndex = -1;
		for(var i=0;i<$scope.messagesList.length;i++){
			if($scope.messagesList[i].ctn == " is typing" && $scope.messagesList[i].usr == username){
				sameIndex = i;
			}
		}
		if(sameIndex == -1){
			updateList({usr:username, ctn:" is typing",color:getUsernameColor(username)});
		}	
	});

	socket.on('someone stop typing', function(username){//while stop typing,delete the '..is typing'
		var sameIndex = -1;
		for(var i=0;i<$scope.messagesList.length;i++){
			if($scope.messagesList[i].ctn == " is typing" && $scope.messagesList[i].usr == username){
				sameIndex = i;
			}
		}
		if(sameIndex != -1){
			for(var j=i;j<$scope.messagesList.length;j++){
				$scope.messagesList[j] = $scope.messagesList[j+1];
			}

			$scope.messagesList.length = $scope.messagesList.length -1;
			$scope.$apply();
		}


		//console.log(username+" stops typing");
	});

	socket.on('add message', function(data){
		updateList({usr:data.usr, ctn:data.ctn, color:getUsernameColor(data.usr)});
		//console.log($scope.messagesList);
	});

	socket.on('login status', function(data){
		$scope.isLogin = data.status;
		if(!data.status){
			alert('The nickname has been used!');
			$scope.$apply();
		}else{
			updateList({usr:'log', ctn:'Welcome! May the force be with u.', color:'gray'});
			updateList({usr: "log", ctn: "Now current users number :"+ data.numUsers, color:'gray'});
		}
		
	});

	$scope.stopTyping = function(){
		TYPING = false;
		socket.emit('stop typing');
	};

	$scope.keyUp = function(e){
		var keycode = window.event?e.keyCode:e.which;
		TYPING = true;
		//console.log(timer);
		if(timer){
			$timeout.cancel(timer);
			timer = null;
			//console.log(timer);
		}
		timer = $timeout(function(){
			if(TYPING){
				socket.emit('stop typing');
				TYPING = false;
			}
		}, 4000);

        if(keycode==13){
            socket.emit('stop typing');
            socket.emit('input message', $scope.inputMessage );
            $scope.inputMessage = '';
            TYPING = false;
        }else{
        	socket.emit('typing');
        }
	};

	$scope.login = function(e){//ng-if 有隔离scope不能直接$scope.nickname
		
		var keycode = window.event? e.keyCode: e.witch;
		if(keycode==13){
			//console.log($scope.nickname);
			socket.emit('comein', {username: $scope.nickname});
		}
	};

}]);
