myAppModule.controller('navigationController', function($scope, $http, $location, sharedService) {
	$scope.step1Handle = function () {
		console.log("step1Handle");
		if (videoObj) {
			if(confirm("If you select a new video, the current video logging will be lost. Are you sure to navigate away?")) {
				$location.path("step1");
				highlightCurrentTab(0);
				//resetLoggingScope();
			}
		}
	}
	
	$scope.step2Handle = function () {
		$location.path("step2");
		console.log("step2Handle");
	}

	$scope.step3Handle = function () {
		$location.path("step3");
		console.log("step3Handle");
	}
});