myAppModule.controller('step1Controller', function($rootScope, $scope, $location, sharedService) {
	
	console.log("------ step1Controller ---------");
	$scope.videoType = VIDEO_TYPE_LOCAL;
	$scope.savedData = [];
	$scope.selectVideo = function  (index, event, projectName) {
		var videoInfo = null;
		if (projectName != null && projectName.length > 0) {
			videoInfo = exisitngDataMap[projectName];
			$scope.videoType = videoInfo.videoType;
		} else {
			videoInfo = $scope.videos[index];
		}
		videoPath = videoInfo.url;
		if (exisitngDataMap[projectName] != null) {
			console.log("SAVED VIDEO SELECTED");
			sharedService.setVideo(exisitngDataMap[projectName]);
			$location.path("step3");
		} else {
			sharedService.setVideo(videoInfo);
		}
		$('#video-carousel li').each(function () {
			$('a', this).removeClass('active');				
		});
		sharedService.setVideoType($scope.videoType);		
		$('a', event.currentTarget).addClass('active');
		$.modal.close();
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
	
	sharedService.getSavedData().then(function(response){
		//console.log(response);
		 $scope.safeApply(function () {
			 $scope.savedData = response.data;			 
	     });
    });
	
	$scope.showStep2 = function () {
		var isPassed = false;
		var active = $( "#accordion" ).accordion( "option", "active" );
		var text= $("#accordion h3").eq(active).text();
		
		if(active=='0') {
			if($('#video-carousel li a').hasClass('active')) {
				isPassed = true;
			} else {
				alert("Please select any video from the existing list to proceed");
				isPassed = false;
			}
		} else if(active=='2') {
			urlInput = $('#url-input');
			if($.trim(urlInput.val()) != '') {
				videoPath = urlInput.val();
				isPassed = true;
			} else {
				alert("Please type a URL of a video in the input box to proceed");
				isPassed = false;
			}
		} else {
			alert("You should either select from existing video or type a URL to proceed to next step");
			isPassed = false;
		}
		
		
		if (isPassed) {
			goToNextPage('.step-2');
			if (videoObj) {
				videoObj.pause();
			}
			$('#video-name').text(videoPath);
			$('#action-name').focus();
			highlightCurrentTab(1);
		}
		
		$location.path("step2");
	}
	
	$scope.init = function () {
		$scope.videos = videos;
		$( "#accordion" ).accordion({
			autoHeight: false,
			navigation: true
		});
	}
	
	$scope.init();
});
