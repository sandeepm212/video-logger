(function(window, angular, undefined) {
	'use strict';
	var ngRouteModule = angular.module('ngRoute', [ 'ng' ]).provider('$route',
			$RouteProvider);

	function $RouteProvider() {
		function inherit(parent, extra) {}

		var routes = {};

		this.when = function(path, route) {};

		function pathRegExp(path, opts) {}

		this.otherwise = function(params) {};

		this.$get = [
				'$rootScope',
				'$location',
				'$routeParams',
				'$q',
				'$injector',
				'$http',
				'$templateCache',
				'$sce',
				function($rootScope, $location, $routeParams, $q, $injector,
						$http, $templateCache, $sce) {

					var forceReload = false, $route = {};

					$rootScope.$on('$locationChangeSuccess', updateRoute);

					return $route;

					function switchRouteMatcher(on, route) {}

					function updateRoute() {}

					function parseRoute() {}

					function interpolate(string, params) {}
				} ];
	}

	
	ngRouteModule.directive('ngView', ngViewFactory);

	ngViewFactory.$inject = [ '$route', '$anchorScroll', '$compile',
			'$controller', '$animate' ];
	function ngViewFactory($route, $anchorScroll, $compile, $controller,
			$animate) {
		
	}

})(window, window.angular);
