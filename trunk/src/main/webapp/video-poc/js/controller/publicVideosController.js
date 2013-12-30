myAppModule.controller('publicVideosController', function($scope, $http, sharedService) {
	$scope.videoUrl = null;
	$scope.publicVideos = [];
	$scope.publicVideosSources = [];
	
	
	function onSuccess( data ) {
		var source = data.source;
	    if ( !$scope.publicVideosSources[ source ] ) {
	      if ( data.type === "image" ) {
	        //TODO
	      } else {
	    	  $scope.publicVideos.push(data);
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