myAppModule.controller('publicVideosController', function($scope, $http, sharedService) {
	$scope.videoUrl = null;
	$scope.publicVideos = [];
	$scope.publicVideosSources = [];
	
	
	function onSuccess( data ) {
		var source = data.source;
	    if ( !$scope.publicVideosSources[source] ) {
	    	$scope.publicVideosSources[ source ] = data;
	    	if ( data.type === "image" ) {
	    		//TODO
	    	} else {
	    		$scope.$apply(function(){
	    			$scope.publicVideos.push(data);
	    			data.mediaIcon = data.type.toLowerCase() +  "-icon";
	    		});
	    		console.log(data);
	    	}
	    } else {
	      onDenied("Your gallery already has that media added to it");
	    }
	  }
	
	function onDenied( error, preventFieldHightlight ) {
		alert(error);
	}
	
	$scope.loadVideoDetails = function  () {
		var MediaUtils = new mediaTypes();
		MediaUtils.getMetaData( $scope.videoUrl, onSuccess, onDenied );
	}
	
	
});