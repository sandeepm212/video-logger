//variable declaration
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

function Video (id, url, thumbnailUrl) {
	this.id = id;
	this.url = url;
	this.thumbnailUrl = thumbnailUrl;
	this.videoLogs = [];
	this.actions = [];
}

var videos = [new Video(1, "trailer", "../images/slider.png"),
              new Video(2, "trailer", "../images/slider.png"),
              new Video(3, "trailer", "../images/slider.png"),
              new Video(4, "trailer", "../images/slider.png"),
              new Video(5, "trailer", "../images/slider.png"),
              new Video(6, "trailer", "../images/slider.png"),
              new Video(7, "trailer", "../images/slider.png"),
              new Video(8, "trailer", "../images/slider.png"),
              new Video(9, "trailer", "../images/slider.png"),
              new Video(10, "trailer", "../images/slider.png"),
              new Video(11, "trailer", "../images/slider.png"),
              new Video(12, "trailer", "../images/slider.png")];

var myAppModule = angular.module('videoLoggerApp', []);

myAppModule.service('sharedService', function () {
    var actions = [];    
	this.addAction = function (action) {
		actions.push(action);
	};
    this.getActions = function () {
        return this.actions;
    };
    this.setActions = function(actions) {
        this.actions = actions;
    };

});

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


var ngVideoLogInfoScope = null;
myAppModule.controller('ngVideoLogInfoController', function($scope, sharedService) {
	
});

var selectedVideo = null;
myAppModule.controller('step1Controller', function($rootScope, $scope, sharedService) {
	$scope.videos = videos;
	
	$scope.selectVideo = function  (index, event) {
		var videoInfo = $scope.videos[index];
		videoPath = videoInfo.url;
		videoId = videoInfo.id;
		if (exisitngDataMap[videoId] != null) {
			console.log("SHOWING.....");
			$rootScope.$broadcast('SHOW_SAVED_VIDEO', exisitngDataMap[videoId]);
			this.$emit('SHOW_SAVED_VIDEO', exisitngDataMap[videoId]);
			//showSavedVideo(exisitngDataMap[videoId]);			
		}
		$('#video-carousel li').each(function () {
			$('a', this).removeClass('active');				
		});
		
		$('a', event.currentTarget).addClass('active');
	}
});

var actions = [];
myAppModule.controller('step2Controller', function($rootScope, $scope, sharedService) {
	$scope.actions = actions;
	$scope.actionProfiles = actionProfiles;
	$scope.selectedProfile = null;
	
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
	
	$scope.showSte3 = function () {
		if($scope.actions.length == 0) {		
			alert("Please set up at least 1 action in Step 2 to proceed to next step");
		} else {
			$rootScope.$broadcast('ACTIONS', "");
		}
	}
});

myAppModule.controller('step3Controller', function($scope, sharedService) {
		
	ngVideoLogInfoScope = $scope;
	$scope.videoLogs = videoLogs;	 
	
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
	
	$scope.showLogVideo = function  (index) {
		videoObj.play(videoLogs[index].startTime);
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
	
	
	$scope.actions = [];
	$scope.videoLogs = [];
	$scope.selectedVideoInfo = null;
	$scope.currentLog = new VideoLog();
	var actionsMap = [];
	
	$scope.$on('ACTIONS', function(value) {
		$scope.setActions(sharedService.getActions());		
	})
	
	$scope.setActions = function (actions) {
		$scope.actions = actions;
		for (var i = 0; i < $scope.actions.length; i++) {
			actionsMap[$scope.actions[i].name] = $scope.actions[i];
		}
	}
	
	$scope.hasHotKey = function (action) {
		return (action.hotKeyChar != '' && action.hotKeyChar != null);
	}
	$scope.applyAction = function (index, event) {
		var selectedAction = $scope.actions[index];
		$scope.currentLog.action = selectedAction.action;
		console.log($scope.currentLog);
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
	
	$scope.$on('SHOW_SAVED_VIDEO', function(event, data) {
		$scope.selectedVideoInfo = data;
		$scope.showSavedVideo(data);
	});
	
	$scope.saveVideoLog = function () {
		var vObject = new Object();
		vObject.id = videoId;
		vObject.url = videoPath;
		vObject.videoType = videoType; 
		
		var videoData = [vObject];
		var videoLog = [];
		vObject.videoLogs = $scope.videoLogs;
		
		var videoActions = [];
		vObject.actions = $scope.actions;
					
		//SaveDATA		
		$.ajax({
			  type: "POST",
			  url: "/video-logger/saveVideoLog",
			  data: JSON.stringify(videoData),
			  success: function (data) {
				  
			  },
			  dataType: "json"
		});
	}
		
	$scope.getLogHotKey = function (action) {
		return (action.hotKeyChar != '' && action.hotKeyChar != null);
	}
	
	$scope.addLog = function () {
		videoObj.play();
		console.log($scope.currentLog);
		$scope.videoLogs.push($scope.currentLog);
		$scope.currentLog = new VideoLog();
	}
	
	$scope.showSavedVideo = function(videoInfo) {
		if (videoInfo != null) {				
			if (videoPath != null && videoType != null) {
				loadVideo();
				$scope.setActions(videoInfo.actions);
				$scope.videoLogs = videoInfo.videoLogs;
				goToNextPage('.step-3');
			}
		}		
	}
});

function addLog() {
	if(validateFields()) {
		
		var eventTypeSelect = $( "#eventSelect" ).val();
		var relativeY = - $("#video-holder-div").offset().top + $("#image").offset().top;
		var relativeX = - $("#video-holder-div").offset().left + $("#image").offset().left;
		
		var log = new VideoLog (clipAction.data('action-value'), eventTypeSelect, startInput.val(), endInput.val(), notesTextarea.val(), relativeX, relativeY);
		addVideoLog(log);
		
		
//		clearFields();
		//alert("Clip entry successfully logged");
		$('section.right').removeClass('hide');
		videoObj.play();
		logTable.trigger("update");
		
		$('#enter-out-time').css('display','-moz-stack');
		$('#out-time-input').css('display','none');		
	}
}

function addVideoLog (logDetails) {
	if (logDetails != null) {
		ngVideoLogInfoScope.safeApply(function() {
			ngVideoLogInfoScope.addVideoLog(logDetails);
	    });
	}
}

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

//Pause the video if something notes textarea gets focus
//notesTextarea.focus(function() {
//	if (videoObj) {
//		videoObj.pause();
//	}
//});