var app = angular.module('chatRoom', ['ui.router']);

app.config(
	['$stateProvider', '$urlRouterProvider','$locationProvider',
		function($stateProvider, $urlRouterProvider, $locationProvider){
			$urlRouterProvider.when('/', '/chatroom');
			
			$stateProvider
				.state('login', {
					url: '/login',
					templateUrl: '../pages/login.html',
					controller: 'loginCtrl'
				})
				.state('chatroom', {
					url: '/chatroom',
					templateUrl: '../pages/chatroom.html',
					controller: 'chatCtrl'
				});
			
			$locationProvider.html5Mode(true);

		}
	]
);
