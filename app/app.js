(function(){
	'use strict';

	angular.module('uhero', [ 'ngRoute','uhero-main','templates' ])
	  .config(function ($routeProvider) {
	    $routeProvider
	      .otherwise({
	        redirectTo: '/'
	      });
	  });
	  
})();