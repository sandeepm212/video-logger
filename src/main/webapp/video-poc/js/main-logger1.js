//variable declaration
var CUE_IN = "IN";
var CUE_OUT = "OUT";
var previewCount=0;
var isVimeo = false;

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
		finalVO,
		allowedKeysRegex = /[a-z0-9]/i,
		//localFilePath = 'http://localhost/projects/video-logger/assets/',
		slideTime = 300,
		fadeTime = 500,
		currentProfile;
		

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

function Video (id, url, thumbnailUrl, videoType, projectName, projectId, duration, title, sourceType) {
	this.id = id;
	this.url = url;
	this.videoType = videoType;
	this.thumbnailUrl = thumbnailUrl;
	this.duration = duration;
	this.title = title;
	this.sourceType = sourceType;
	this.videoLogs = [];
	this.actions = [];
	this.projectName = projectName;
	this.projectId = projectId;
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

var exisitngDataMap = [];


myAppModule.config(function($routeProvider, $locationProvider) {
          $routeProvider.when('/', {
        	  templateUrl: "/video-logger/video-poc/html/template/selectVideo1.html",
        	  controller: "step1Controller"
          });
          $routeProvider.when('/step2', {
        	  	controller: "step2Controller",
   		   		templateUrl: "/video-logger/video-poc/html/template/videoActions1.html"
          });
          $routeProvider.when('/step3', {
        	  	controller: "step3Controller",
   		   		templateUrl: "/video-logger/video-poc/html/template/logActions1.html"
          });
          $routeProvider.otherwise({
        	  redirectTo: '/'
          });
          // configure html5 to get links working on jsfiddle
          //$locationProvider.html5Mode(true);
});
myAppModule.run( function($rootScope, $location, sharedService) {
    // register listener to watch route changes
    $rootScope.$on( "$routeChangeStart", function(event, next, current) {
    	var video = sharedService.getVideo();
    	if (video == null) {
    		//alert("test" + next.templateUrl);
			// no logged user, we should be going to #login
	        if ( next.templateUrl == "/video-logger/video-poc/html/template/logActions1.html" || next.templateUrl == "/video-logger/video-poc/html/template/videoActions1.html" ) {
	        		// not going to #step3, we should redirect now
		          $location.path( "step1" );
	        }
	    } else if (sharedService.getActions().length == 0) {
	    	$location.path( "step2" );
	    }
    });
 })

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
var clipDataArray = [];
var videoObj = null;
var videoPath = '';
var localFilePath = '../assets/';
//Constant declaration
var MP4 = '.mp4',
	OGV = '.ogv',
	WEBM = '.webm';

var selectedVideo = null;


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
function loadVideo(videoURL, isPublic) {
	if(isPublic){
		if(videoURL.contains('vimeo')){
			isVimeo = true;
		}
	}
	
	url = videoURL;
	videoObj = Popcorn.smart('#video-holder-div', url);
	
	$('#video-holder-div').slideDown(slideTime);
	//setVideoParentDimentions();
	
	//Caching media properties once the media metadata are loaded
	if (isPublic) {
		$('.loading-wrap').addClass('hide');
	} else {
		videoObj.on('loadedmetadata', function() {
			duration = videoObj.duration();
			frameRate = videoObj.options.framerate ? videoObj.options.framerate : 30;// TBD : Calculation of framerate needs to be accurate
			$('.loading-wrap').addClass('hide');
			videoObj.controls(true);
			
		});
	}
}

/*$( window ).resize(function() {
	setVideoParentDimentions1();
});*/

function setVideoParentDimentions () {
	var width = $("#videoDivNorth").width()-10;;
	var height = $("#videoDivNorth").height();
	$("#video-holder-div").height(height);
	
	if(isVimeo){
		$("#video-holder-div").width(width);
	}else{
		$("#video-holder-div").width('auto');
	}
	
	$("#video-holder-div video").height(height);

	
	
}

