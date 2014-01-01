myAppModule.controller('publicVideosController', function($scope, $http, $location, sharedService) {
	$scope.videoUrl = null;
	$scope.publicVideos = [];
	$scope.publicVideosSources = [];
	var Time = new time();
	
	function onSuccess( data ) {
		var source = data.source;
	    if ( !$scope.publicVideosSources[source] ) {
	    	$scope.publicVideosSources[ source ] = data;
	    	data.videoType = VIDEO_TYPE_WEB;
	    	data.formattedDuration = Time.toTimecode(data.duration, 0 )
			data.mediaIcon = data.sourceType.toLowerCase() +  "-icon";
	    	
	    	if ( data.type === "image" ) {
	    		//TODO
	    	} else {
	    		$scope.$apply(function(){
	    			$scope.publicVideos.push(data);
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
	
	$scope.selectVideo = function (index) {
		var videoInfo = $scope.publicVideos[index];
		if (videoInfo != null) {
			sharedService.setVideo(videoInfo);
			$location.path("step2");
		}
	}
	
	
});