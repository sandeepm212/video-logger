//variable declaration
var CUE_IN = "IN";
var CUE_OUT = "OUT";

var VIDEO_TYPE_LOCAL = "LOCAL";
var VIDEO_TYPE_WEB = "WEB";

var videoPath = '',
		videoType = '',
		duration = 0,
		frameRate = 0,
		currentTime = 0,
		action = '',
		eachRow = '',
		urlInput = '',
		startInput = '',
		endInput = '',
		notesTextarea = '',
		logTable = '',
		clipAction = '',
		submitBtn = '',
		eachRowData,
		actionArray,
		existingHotkeys = [],
		videoData,
		finalVO,
		allowedKeysRegex = /[a-z0-9]/i,
		//localFilePath = 'http://localhost/projects/video-logger/assets/',
		slideTime = 300,
		fadeTime = 500,
		currentProfile,
		cricketActionProfile = [{"name":"Boundary","action":"Boundary","hotKeyChar":"B","hotKeyCode":66,"legend":"#FFFF00","style": {"backgroundColor" : "#FFFF00"}},
		                        {"name":"Over boundary","action":"Over boundary","hotKeyChar":"6","hotKeyCode":54,"legend":"#00CC00","style": {"backgroundColor" : "#00CC00"}},
		                        {"name":"3 runs","action":"3 runs","hotKeyChar":"3","hotKeyCode":51,"legend":"#0066FF","style": {"backgroundColor" : "#993300"}},
		                        {"name":"Out","action":"Out","hotKeyChar":"O","hotKeyCode":79,"legend":"#993300","style": {"backgroundColor" : "#993300"}},
		                        {"name":"One run","action":"One run","hotKeyChar":"1","hotKeyCode":49,"legend":"#FF0066","style": {"backgroundColor" : "#FF0066"}},
		                        {"name":"Two runs","action":"Two runs","hotKeyChar":"2","hotKeyCode":50,"legend":"#660066","style": {"backgroundColor" : "#660066"}}],
								
		soccerActionProfile = [	{"name":"Goal","action":"Goal","hotKeyChar":"G","hotKeyCode":71,"legend":"#660066","style": {"backgroundColor" : "#660066"}},
		                       	{"name":"Penalty","action":"Penalty","hotKeyChar":"P","hotKeyCode":80,"legend":"#FF0066","style": {"backgroundColor" : "#FF0066"}},
		                       	{"name":"Free kick","action":"Free kick","hotKeyChar":"F","hotKeyCode":70,"legend":"#993300","style": {"backgroundColor" : "#993300"}},
		                       	{"name":"Super save","action":"Super save","hotKeyChar":"S","hotKeyCode":83,"legend":"#0066FF","style": {"backgroundColor" : "#0066FF"}}];

function ActionProfile(id, name, actions) {
	this.name = name;
	this.id = id;
	this.actions = actions;
}

var actionProfiles = [];
actionProfiles.push(new ActionProfile("cricket", "Cricket", cricketActionProfile));
actionProfiles.push(new ActionProfile("soccer", "Soccer", soccerActionProfile));
	
/**
 * Styles to be applied for every Action 
 */
function Style (backgroundColor, fontColor, fontStyle, fontWeight, fontSize) {
	this.backgroundColor = backgroundColor;
	this.fontColor = fontColor;
	this.fontStyle = fontStyle;
	this.fontWeight = fontWeight;
	this.fontSize = fontSize;
}

/**
 * Actions details
 */
function Action (name, hotKeyChar, hotKeyCode, relativeX, relativeY, description) {
	this.name = name;
	this.hotKeyChar = hotKeyChar;
	this.hotKeyCode = hotKeyCode;
	this.description = description;
	this.style = new Style();
}


/**
 * Video log details.
 */
function VideoLog (action, eventType, startTime, endTime, eventType, note, relativeX, relativeY) {
	this.action = action;
	this.eventType = eventType;
	this.startTime = startTime;
	this.endTime = endTime;
	this.eventType = eventType;
	this.note = note;
	this.relativeX = relativeX;
	this.relativeY = relativeY;
}

function Video (id, url, thumbnailUrl, videoType, projectName) {
	this.id = id;
	this.url = url;
	this.videoType = videoType;
	this.thumbnailUrl = thumbnailUrl;
	this.videoLogs = [];
	this.actions = [];
	this.projectName = projectName;
}

var videos = [new Video(1, "trailer", "../images/slider.png", VIDEO_TYPE_LOCAL),
              new Video(2, "trailer", "../images/slider.png", VIDEO_TYPE_LOCAL),
              new Video(3, "trailer", "../images/slider.png", VIDEO_TYPE_LOCAL),
              new Video(4, "trailer", "../images/slider.png", VIDEO_TYPE_LOCAL),
              new Video(5, "trailer", "../images/slider.png", VIDEO_TYPE_LOCAL),
              new Video(6, "trailer", "../images/slider.png", VIDEO_TYPE_LOCAL),
              new Video(7, "trailer", "../images/slider.png", VIDEO_TYPE_LOCAL),
              new Video(8, "trailer", "../images/slider.png", VIDEO_TYPE_LOCAL),
              new Video(9, "trailer", "../images/slider.png", VIDEO_TYPE_LOCAL),
              new Video(10, "trailer", "../images/slider.png", VIDEO_TYPE_LOCAL),
              new Video(11, "trailer", "../images/slider.png", VIDEO_TYPE_LOCAL),
              new Video(12, "trailer", "../images/slider.png", VIDEO_TYPE_LOCAL)];

var myAppModule = angular.module('videoLoggerApp', ['ngRoute']);

myAppModule.service('sharedService', function ($http) {

	var exisitngDataMap = [];
	
	var actions = [];    
    var video = null;
    var videoType = VIDEO_TYPE_WEB;
    this.addAction = function (action) {
		actions.push(action);
	};
    this.getActions = function () {
        return this.actions;
    };
    this.setActions = function(actions) {
    	if (this.video != null) {
    		this.video.actions = actions;
    	}
        this.actions = actions;
    };
    
    this.setVideo = function(video) {
        this.video = video;
    };
    
    this.getVideo = function () {
        return this.video;
    };
    
    this.setVideoType = function(videoType) {
        this.videoType = videoType;
    };
    
    this.getVideoType = function () {
        return this.videoType;
    };
    
    this.getSavedData = function () {
    	var promise = $http({method: 'GET', url: '/video-logger/getVideoLog'}).
				  	  	success(function(data, status, headers, config) {
				  		  if (data != null) {
				  			  angular.forEach(data, function(video) {
				  				  exisitngDataMap[video.projectName] = video;
				  			  });
				  			  //console.log(exisitngDataMap);
				  		  	}
				  		  	return data;
				  	  		}).
				  	  error(function(data, status, headers, config) {
				  		  	
				  	  });
        return promise; 
    };
    
    
});

myAppModule.config(function($routeProvider, $locationProvider) {
          $routeProvider.when('/', {
        	  templateUrl: "/video-logger/video-poc/html/template/selectVideo.html",
        	  controller: "step1Controller"
          });
          $routeProvider.when('/step2', {
        	  	controller: "step2Controller",
   		   		templateUrl: "/video-logger/video-poc/html/template/videoActions.html"
          });
          $routeProvider.when('/step3', {
        	  	controller: "step3Controller",
   		   		templateUrl: "/video-logger/video-poc/html/template/logActions.html"
          });
          $routeProvider.otherwise({
        	  redirectTo: '/'
          });
          // configure html5 to get links working on jsfiddle
          //$locationProvider.html5Mode(true);
});

myAppModule.directive('repeatDone', function () {
	  return function (scope, element, iAttrs) {
          var parentScope = element.parent().scope();
          if (scope.$last){
        	  if (("saved-video-carousel" === element.parent()[0].id) || ("video-carousel" === element.parent()[0].id)) {
        		  $('#' + element.parent()[0].id).jcarousel();
        	  }
          }
	  };
});

/*
 * $rootScope.safeApply = function(fn) {
    var phase = this.$root.$$phase;
    if(phase == '$apply' || phase == '$digest') {
        if(fn && (typeof(fn) === 'function')) {
            fn();
        }
    } else {
        this.$apply(fn);
    }
};
 */

var videoLogs = [];
var exisitngData = [];
var exisitngDataMap = [];
var videoId = null;
var clipDataArray = [];
var videoObj = null;
var videoPath = '';
var videoId = '';
var localFilePath = '../assets/';
//Constant declaration
var MP4 = '.mp4',
	OGV = '.ogv',
	WEBM = '.webm';

var selectedVideo = null;

myAppModule.controller('step1Controller', function($rootScope, $scope, $location, sharedService) {
	
	console.log("------ step1Controller ---------");
	$scope.videoType = VIDEO_TYPE_WEB;
	$scope.savedData = [];
	$scope.selectVideo = function  (index, event, projectName) {
		var videoInfo = $scope.videos[index];
		videoPath = videoInfo.url;
		videoId = videoInfo.id;
		if (exisitngDataMap[projectName] != null) {
			console.log("SAVED VIDEO SELECTED");
			sharedService.setVideo(exisitngDataMap[videoId]);
			$location.path("step3");
		} else {
			sharedService.setVideo(videoInfo);
		}
		$('#video-carousel li').each(function () {
			$('a', this).removeClass('active');				
		});
		$scope.videoType = VIDEO_TYPE_LOCAL;
		sharedService.setVideoType($scope.videoType);		
		$('a', event.currentTarget).addClass('active');
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
			 console.log($scope.savedData);
	     });
    });
	
	$scope.showStep2 = function () {
		var isPassed = false;
		if($('#exsting-video').is(':checked')) {
			if($('#video-carousel li a').hasClass('active')) {
				isPassed = true;
			} else {
				alert("Please select any video from the existing list to proceed");
				isPassed = false;
			}
		} else if($('#web-video').is(':checked')) {
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
	}
	
	$scope.init();
});

myAppModule.controller('step2Controller', function($rootScope, $scope, sharedService, $location) {
	console.log("------ step2Controller ---------");
	$scope.actions = [];
	$scope.actionProfiles = actionProfiles;
	$scope.selectedProfile = null;
	$scope.customActions = 'custom-actions';
	
	$scope.addLogAction = function (action) {
		if (action.name != '') {
			var hasError = false;
			if (action.hotKeyChar != null && action.hotKeyChar != '') {
				action.keyCode = extractKeyCode(action.hotKeyChar.toUpperCase());
				if(action.keyCode != '') {
					if($.inArray(action.hotKeyChar.toUpperCase(), existingHotkeys) == -1) {
						existingHotkeys.push(action.hotKeyChar.toUpperCase());
					} else {
						hasError = true;
						alert("This hot key has already been used. Please choose another key for this action.");
					}
				}
			}
			if (!hasError) {
				$scope.actions.push(action);
				sharedService.setActions($scope.actions);
				$scope.action = {};
			}
		} else {
			alert("Please enter an action name");
		}
		$('#action-name').focus();
	}
	
	$scope.hasHotKey = function (action) {
		return (action.hotKeyChar != '' && action.hotKeyChar != null);
	}
	
	$scope.loadSavedProfile = function () {
		$scope.actions = [];
		if ($scope.selectedProfile != null && $scope.selectedProfile.actions != null) {			
			$scope.actions = $scope.selectedProfile.actions;			
		} else {
			alert("Please select a valid action profile");
		}
		sharedService.setActions($scope.actions);
	}
		
	$scope.showStep3 = function () {
		if($scope.actions.length == 0) {	
			if($scope.customActions === 'custom-actions') {
				alert("Please set up at least 1 custom action in Step 2 to proceed to next step");
			} else {
				alert("Please select from available action profile in Step 2 to proceed to next step");
			}
		} else {
			goToNextPage('.step-3');
			highlightCurrentTab(2);
			$rootScope.$broadcast('ACTIONS', "");
		}		
		$location.path("step3");
	}
	
	$scope.resetActions = function () {
		$scope.actions = [];
	}
	
	$scope.deleteAction = function(index) {
		if(confirm("This is the current selected action for clip logging. Are you sure to delete this action?")) {
			$scope.actions.splice(index, 1);
		}
	}
});

myAppModule.controller('step3Controller', function($scope, sharedService) {
	console.log("------ step3Controller ---------");
	$scope.videoLogs = videoLogs;	 
	$scope.actions = [];
	$scope.videoLogs = [];
	$scope.selectedVideoInfo = null;
	$scope.currentLog = new VideoLog();
	var actionsMap = [];
	$scope.vObject = new Video();
	$scope.projectName = null;
	
	$scope.init = function () {
		console.log("intializing step3Controller...");
		var video = sharedService.getVideo();
		$scope.projectName = video.projectName;
//		console.log("Video.....");
//		console.log(video);
		
		$scope.actions = sharedService.getVideo().actions;
		$scope.videoLogs = sharedService.getVideo().videoLogs;
		
//		console.log("ACTIONS:::");
//		console.log($scope.actions);
		if (!videoObj) {
			// Play Selected Video
			var video = sharedService.getVideo();
			if (video != null) {
				var videoURL = getLocalFileNameArr(video.url);
//				console.log("videoURL:::");
//				console.log(videoURL);
				loadVideo(videoURL);
			}
		}
	}
	
	$scope.deleteLog = function(logToRemove) {
		if(confirm("Are you sure to delete this log entry?")) {
			var index = this.videoLogs.indexOf(logToRemove);
			this.videoLogs.splice(index, 1);
			clipDataArray.splice(rowIndex, 1);
		}
	}
	
	$scope.addVideoLog = function  (logDetails) {
		if (logDetails != null) {
			$scope.videoLogs.push(logDetails);
		}
	}
	
	$scope.playVideo = function () {
		videoObj.play();
	}
	
	$scope.showLogVideo = function  (index) {
		videoObj.play($scope.videoLogs[index].startTime);
	}
	
	$scope.$on('ACTIONS', function(value) {
		$scope.setActions(sharedService.getActions());		
	})
	
	$scope.setActions = function (actions) {
		$scope.actions = actions;
		angular.forEach($scope.actions, function(action, index) {
			actionsMap[action.name] = action;
		});
	}
	
	$scope.hasHotKey = function (action) {
		return (action.hotKeyChar != '' && action.hotKeyChar != null);
	}
	
	// Handle the action selection during video playback
	$scope.applyAction = function (index, event) {
		var selectedAction = $scope.actions[index];
		$scope.currentLog.action = selectedAction.name;
		currentTime = videoObj.currentTime();
		if(currentTime > 0 && currentTime < duration) {
			$scope.currentLog.startTime = formatTime(currentTime);
			$('.actions li').removeClass('selected');
			$(event.currentTarget).addClass('selected');
		} else if(currentTime >= duration) {
			alert("The video playing is over. You can't log time now. To log time, replay the video");
		} else {
			alert("The video has not yet started playing. Try logging after you have started playing the video");
		}
	}
		
	// Save the video logs
	$scope.saveVideoLog = function (type) {
		if (type === 'save') {
			$scope.vObject = new Video();
			$scope.vObject.id = videoId;
			$scope.vObject.url = videoPath;
			$scope.vObject.thumbnailUrl = "../images/slider.png"; //videoPath;
			$scope.vObject.type = sharedService.getVideoType(); 
			$scope.vObject.projectName = $scope.projectName; 
			var videoData = [$scope.vObject];
			var videoLog = [];
			$scope.vObject.videoLogs = $scope.videoLogs;
			
			var videoActions = [];
			$scope.vObject.actions = $scope.actions;
								
			//SaveDATA		
			$.ajax({
				  type: "POST",
				  url: "/video-logger/saveVideoLog",
				  data: JSON.stringify(videoData),
				  success: function (data) {
					  alert("Saved Successfully...");
					  $('#project-name-popup').dialog('close');
				  },
				  dataType: "json"
			});
		} else {
			$('#project-name-popup').dialog({
				title: 'Project Name',
				resizable: false,
				dialogClass: 'video-log-modal',
				autoOpen: false,
				width: 600,
				minHeight: 300,
				maxHeight: 600,
				modal: true
			});
			
			$('#project-name-popup').dialog('open');
		}
	}
		
	$scope.getLogHotKey = function (action) {
		return (action.hotKeyChar != '' && action.hotKeyChar != null);
	}
	
	// Add the log to the table.
	$scope.addLog = function () {
		var relativeY = - $("#video-holder-div").offset().top + $("#image").offset().top;
		var relativeX = - $("#video-holder-div").offset().left + $("#image").offset().left;
		
		videoObj.play();
		$scope.currentLog.relativeX = relativeX;
		$scope.currentLog.relativeY = relativeY;
		$scope.videoLogs.push($scope.currentLog);
		$scope.currentLog = new VideoLog();
		$('.actions li').removeClass('selected');
	}
	
	// Populate the out time in the input field
	$scope.logOutTime = function () {
		endTime = videoObj.currentTime();
		$scope.currentLog.endTime = formatTime(endTime);
		$('#enter-out-time').css('display','none');
		$('#out-time-input').css('display','-moz-stack');
		videoObj.pause();
	}	
	
	// 
	$scope.hotKeyCharStyle = function(index) {
		if ($scope.videoLogs != null) {				
			var logObj = $scope.videoLogs[index];
			var action = actionsMap[logObj.action];
			if (action != null && action.style != null) {
				return action.style.backgroundColor;
			}
		}
		return "";
	}
	
	// 
	$scope.logCurrentTime = function (param) {
		currentTime = videoObj.currentTime();
		if(currentTime > 0 && currentTime < duration) {
			videoObj.pause();
			var time = formatTime(currentTime);
			if (CUE_IN == param) {
				$scope.currentLog.startTime = time;				
			} else {
				$scope.currentLog.endTime = time;
			}
		} else if(currentTime > duration) {
			alert("The video playing is over. You can't log time now. To log time, replay the video");
		} else {
			alert("The video has not yet started playing. Try logging after you have started playing the video");
		}
	}
	
	$scope.preview = function () {
		//Preview button handler
		var timeStore; 
		
		if($scope.videoLogs.length > 0) {
			$('.logger-holder, section.left, #preview, #view-log, #submit-log').hide();
			$('section.right').css('width', '100%');
			$('#back-to-logger').show();
			$('th:last-child, tr td:last-child', logTable).addClass('hide');
			if (videoObj) {
				timeStore = videoObj.currentTime(); 
				videoObj.currentTime(0).play();
				$scope.syncVideoWidLog();
			}
		} else {
			alert("At least one action should be captured to preview the logged video.");
		}		
	}
	
	//Helper function to synchronize video with log record table
	$scope.syncVideoWidLog = function () {
		
		videoObj.highlightrow({
			start:1,
			end:10,
			index:0
		});
			
		angular.forEach($scope.videoLogs, function(log, index) {
			var outTime = log.endTime;
			var inTime = log.startTime;
			videoObj.highlightrow({
				start:inTime,
				end:outTime,
				index:index
			});			
			if (log.eventType == "Subtitle") {
				videoObj.subtitle({
	    	         start: log.startTime,
	    	          end: log.endTime,
	    	          text: log.note
	    	       });
			} else if(log.eventType == "Footnote") {
				videoObj.footnote({
					  start: log.startTime,
		   	          end: log.endTime,
		   	          text: log.note,
		   	          target:"previewData"  
		           });
			} else if(log.eventType == "Pop") {
				videoObj.pop({
					start: log.startTime,
	   	            end: log.endTime,
	   	            text: log.note,
			        target:"video-holder-div",
			        top: ($("#video-holder-div").offset().top +  parseInt(log.relativeY)) + "px",
			        left: ($("#video-holder-div").offset().top +  parseInt(log.relativeX - 120)) + "px",
			        icon:"../css/images/pointer.png"
				});
			}
		
		});	
		
	}
	
	$scope.backToLogger = function () {
		//videoObj.pause().currentTime(timeStore);
		$('.logger-holder, section.left, #preview, #view-log, #submit-log').show();
		$('section.right').css('width', '85%');
		$('#back-to-logger').hide();
		$('th:last-child, tr td:last-child', logTable).removeClass('hide');
		$('tbody tr', logTable).removeClass('row-highlight');
	}
	
	$scope.viewLog = function () {
		//View log button handler
		if(videoData) {
			$('#log-preview-popup .video-meta-data').html(JSON.stringify($scope.vObject));
		} else {
			$('#log-preview-popup .video-meta-data').html("Video meta data unavailable");
		}
			
		if ($scope.videoLogs.length > 0) {
				$('#log-preview-popup .clip-data').html(JSON.stringify($scope.videoLogs));
		} else {
			$('#log-preview-popup .clip-data').html("Clip data unavailable");
		}
			
		if ($scope.actions.length > 0) {
			$('#log-preview-popup .action-data').html(JSON.stringify($scope.actions));
		} else {
			$('#log-preview-popup .action-data').html("Action data unavailable");
		}
			
		$('#log-preview-popup').dialog({
		  title: 'Preview generated log',
		  resizable: false,
		  dialogClass: 'video-log-modal',
		  autoOpen: false,
		  width: 600,
		  minHeight: 300,
		  maxHeight: 600,
		  modal: true
		});
		
		$('#log-preview-popup').dialog('open');
		
	}
	
	$scope.init();
});

angular.module('exceptionOverride', []).factory('$exceptionHandler', function () {
	  return function (exception, cause) {
	    exception.message += ' (caused by "' + cause + '")';
	    throw exception;
	  };
});

//Helper function to validate intime, outtime and notes field
function validateFields() {
	var isValid = false;
	
	if($.trim(clipAction.text()) == '')	{
		alert("To log a clip in the video, 'Action' must be specified");
	} else if(startInput.val() == '') {
		alert("To log a clip in the video, 'In time' must be captured");
	}
	/*else if(endInput.val() == '')
	{
		alert("To log a clip in the video, 'Out time' must be captured");
	}
	else if(notesTextarea.val() == '')
	{
		alert("To log a clip in the video, 'Notes' must be entered");
	}
	else if(startInput.val() > endInput.val())
	{
		alert("'Out time' must be greater than 'In time'. Please replay the video and log time properly");
	}*/
	else {
		isValid = true;
	}
	return isValid;
}

//Helper function for navigating from one step to another
function goToNextPage(panelName) {
	$('.panels > .panel-wrap').addClass('hide');
	$('.panels').children(panelName).removeClass('hide');
}

//Helper function to highlight current tab
function highlightCurrentTab(liIndex) {
	$('ul.logging-nav li').removeClass('selected').eq(liIndex).addClass('selected');
}
	
//Helper function to show error
function showMessage(msg) {
	alert(msg);
}

//Helper function to load a video either from local resource or from web
function loadVideo(videoURL, isLocal) {
	url = videoURL;
//	console.log(videoURL);
	if (url == null) {
		// TODO
		url = true ? getLocalFileNameArr(videoPath) : videoPath;			
	}
	videoObj = Popcorn.smart('#video-holder-div', url);
	$('#video-holder-div').slideDown(slideTime);
	//Caching media properties once the media metadata are loaded
	videoObj.on('loadedmetadata', function()
	{
		duration = videoObj.duration();
		frameRate = videoObj.options.framerate ? videoObj.options.framerate : 30;// TBD : Calculation of framerate needs to be accurate
		$('.loading-wrap').addClass('hide');
		videoData = new Object();
		videoData.type = videoType;
		videoData.url = videoPath;
		videoData.duration = duration;
		videoObj.controls(true);
	});
}