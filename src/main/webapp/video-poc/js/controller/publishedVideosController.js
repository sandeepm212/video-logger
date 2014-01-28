myAppModule.controller('publishedVideosController', function($scope, $http, $location, sharedService) {
	$scope.readBlob = function () {
	    var files = document.getElementById('logFile').files;
	    if (!files.length) {
	      alert('Please select a file!');
	      return;
	    }
	 
	    var file = files[0];
	    var regExp = /(\.json)$/i;
	    // Only process json files.
	    console.log(regExp.exec(file.name));
	    
	    if (!regExp.exec(file.name)) {
	    	alert("Please select valid video log file.");
	        return;
	    }
	    var start = 0;
	    var stop = file.size - 1;
	 
	    $scope.reader = new FileReader();
	 
	    // If we use onloadend, we need to check the readyState.
	    $scope.reader.onloadend = function(evt) {
	      if (evt.target.readyState == FileReader.DONE) { // DONE == 2
	    	  var videoLogs = evt.target.result;
	    	  //console.log("Data: " + videoLogs);
	    	  
	    	  var jsonData = null;
	    	  try {
	    		  jsonData = jQuery.parseJSON(videoLogs);
	    	  } catch (e) {
	    		  alert("Please select valid video log file.");
	    		  return;
	    	  }
	    	  if (jsonData != null && jsonData.videoLogs != null &&
	    			  jsonData.videoLogs.length > 0 && jsonData.actions != null
	    			  && jsonData.actions.length > 0) {
	    		  console.log("Proj Name: " + jsonData.projectName);
	    		  jsonData.projectName = "";
	    		  jsonData.projectId = "";
	    		  console.log("Go to Step3");
	    		  
	    		  $scope.safeApply(function () {
	    			  sharedService.setVideo(jsonData);
	    			  $location.path("step3");
	    			  $.modal.close();
	    			  sharedService.setVideoType(jsonData.videoType);			 
	    		  });
	    	  } else {
	    		  alert("Please select valid video log file.");
	    	  }
			  //$('a', event.currentTarget).addClass('active');
	      }
	    };
	 
	    var blob = file.slice(start, stop + 1);
	    $scope.reader.readAsBinaryString(blob);
	}
	
	$scope.safeApply = function(fn) {
		  var phase = this.$root.$$phase;
		  if(phase == '$apply' || phase == '$digest') {
		    if(fn && (typeof(fn) === 'function')) {
		      fn();
		    }
		  } else {
		    this.$apply(fn);
		  }
	};
	
	$scope.showPublishedVideo = function  () {
		$scope.readBlob();
	}
	
	$scope.completed = function  () {
		console.log("Completed.....");
	}
	
});