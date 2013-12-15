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

function Video (id) {
	this.id = id;
	this.videoLogs = [];
	this.actions = [];
}

var myAppModule = angular.module('videoLoggerApp', []);

var videoLogs = [];
var exisitngData = [];
var exisitngDataMap = [];
var videoId = null;
var clipDataArray = [];
var videoObj = null;

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
});


function addVideoLog (logDetails) {
	if (logDetails != null) {
		ngVideoLogInfoScope.$apply(function() {
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