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
		cricketActionProfile = [{"action":"Boundary","hotKeyChar":"B","hotKeyCode":66,"legend":"#FFFF00"},
								{"action":"Over boundary","hotKeyChar":"6","hotKeyCode":54,"legend":"#00CC00"},
								{"action":"3 runs","hotKeyChar":"3","hotKeyCode":51,"legend":"#0066FF"},
								{"action":"Out","hotKeyChar":"O","hotKeyCode":79,"legend":"#993300"},
								{"action":"One run","hotKeyChar":"1","hotKeyCode":49,"legend":"#FF0066"},
								{"action":"Two runs","hotKeyChar":"2","hotKeyCode":50,"legend":"#660066"}],
								
		soccerActionProfile = [	{"action":"Goal","hotKeyChar":"G","hotKeyCode":71,"legend":"#660066"},
								{"action":"Penalty","hotKeyChar":"P","hotKeyCode":80,"legend":"#FF0066"},
								{"action":"Free kick","hotKeyChar":"F","hotKeyCode":70,"legend":"#993300"},
								{"action":"Super save","hotKeyChar":"S","hotKeyCode":83,"legend":"#0066FF"}];

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
function VideoLog (action, eventType, startTime, endTime, note, relativeX, relativeY) {
	this.action = action;
	this.eventType = eventType;
	this.startTime = startTime;
	this.endTime = endTime;
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
myAppModule.controller('ngVideoLogInfoController', function($scope) {
	ngVideoLogInfoScope = $scope;
	$scope.videoLogs = videoLogs;	 
	
	$scope.deleteLog = function(logToRemove) {
		if(confirm("Are you sure to delete this log entry?")) {
			var index = this.videoLogs.indexOf(logToRemove);
			this.videoLogs.splice(index, 1);
			clipDataArray.splice(rowIndex, 1);
		}
	};
	
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
});

var selectedVideo = null;
myAppModule.controller('step1Controller', function($scope) {
	$scope.videos = videos;
	
	$scope.selectVideo = function  (index, event) {
		var videoInfo = $scope.videos[index];
		videoPath = videoInfo.url;
		videoId = videoInfo.id;
		if (exisitngDataMap[videoId] != null) {
			showSavedVideo(exisitngDataMap[videoId]);			
		}
		$('#video-carousel li').each(function () {
			$('a', this).removeClass('active');				
		});
		$('a', event.currentTarget).addClass('active');
	}
});

var actions = [];
myAppModule.controller('step2Controller', function($scope) {
	$scope.actions = actions;
	
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
	
	$scope.loadProfileActions = function () {
		
	}
});

//helper function to extract hot key code of a corresponding action
function extractKeyCode(keyVal) {
	return (keyVal != '' && allowedKeysRegex.test(keyVal)) ? keyVal.charCodeAt(0) : '';
}

myAppModule.controller('step3Controller', function($scope) {
	$scope.actions = actions;
});


function addVideoLog (logDetails) {
	if (logDetails != null) {
		ngVideoLogInfoScope.safeApply(function() {
			ngVideoLogInfoScope.addVideoLog(logDetails);
	    });
	}
}

function showExistingLog () {
	var logData = exisitngDataMap[videoId]; 
	if (logData != null) {
		$(logData.videoLogs).each(function( i ) {
			var log = new VideoLog ("", "", this.startTime, this.endTime, this.note, "", "");
			addVideoLog(log);
			
			var eachRData = new Object();
			eachRData.action = this.action;
			eachRData.startTime = this.startTime;
			eachRData.endTime = this.endTime;
			eachRData.eventType = this.eventType;
			eachRData.notes = this.note;
			eachRData.videoId = this.videoId;
			clipDataArray.push(eachRData);
		});
	}
}

angular.module('exceptionOverride', []).factory('$exceptionHandler', function () {
	  return function (exception, cause) {
	    exception.message += ' (caused by "' + cause + '")';
	    throw exception;
	  };
});