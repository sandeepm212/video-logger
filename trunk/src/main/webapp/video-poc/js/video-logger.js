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

// Sample data format
var videoLogObject = [
    {
        "id": 6,
        "videoLogs": [
            {
                "action": "Boundary",
                "startTime": "00:00:03.04",
                "endTime": "00:00:13.06",
                "eventType": "Subtitle"
            },
            {
                "action": "Out",
                "startTime": "00:00:21.14",
                "endTime": "00:00:21.13",
                "eventType": "Pop"
            }
        ],
        "actions": [
            {
                "name": "Over boundary",
                "shortCutKey": "6",
                "description": "",
                "style": {
                    "backgroundColor": "",
                    "fontColor": "",
                    "fontStyle": "",
                    "fontWeight": "",
                    "fontSize": ""
                }
            }
        ]
    }
];


$(document).ready(function() {
	$('#helper').draggable({
        containment: "#video-holder-div",
        scroll: false
});
	
$('#eventSelect').on('change', function (e) {
    var optionSelected = $("option:selected", this);
    var valueSelected = this.value;
    if (valueSelected == "Pop") {
    	$('#image').css('display','block');
    }
});


	
	//variable declaration
	var videoObj,
		videoPath = '',
		videoType = '',
		duration = 0,
		frameRate = 0,
		currentTime = 0,
		action = '',
		eachRow = '',
		urlInput = $('#url-input'),
		startInput = $('#in-time-input'),
		endInput = $('#out-time-input'),
		notesTextarea = $('#clip-notes'),
		logTable = $('#clip-logger'),
		clipAction = $('#action-value'),
		submitBtn = $('#submit-log'),
		eachRowData,
		actionArray,
		clipDataArray = [],
		existingHotkeys = [],
		videoData,
		finalVO,
		allowedKeysRegex = /[a-z0-9]/i,
		//localFilePath = 'http://localhost/projects/video-logger/assets/',
		localFilePath = '../assets/',
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
		
	
	var exisitngData = [];
	var exisitngDataMap = [];
	$.get( "/video-logger/getVideoLog", function( data ) {
		exisitngData = eval(data);
		$(exisitngData).each(function( i ) {
			exisitngDataMap[this.id] = this;
		});
		$('#video-carousel li').each(function ( i ) {
				var liObj = $(this);
				var savedId = liObj.data('video-id');
				if (exisitngDataMap[savedId] != null) {
					$('a', liObj).addClass('saved-video');
					$('a', liObj).attr('saved', 'true');
				}
		});
	});
	
	//Constant declaration
	var MP4 = '.mp4',
		OGV = '.ogv',
		WEBM = '.webm';
	
	//loading the existing video carousel
	$('#video-carousel').jcarousel();
	
	//Calling the table sorter plugin
	logTable.tablesorter({
		headers:{ 3 : {sorter : false}, 4 : {sorter : false}}
	});
	
	//Handling selection radio buttons
	$('input[name="video-type-rdo"]').live('change', function() {
		$('input[name="video-type-rdo"]').parent('h2').next().slideUp(slideTime);
		$(this).is(':checked') ? $(this).parent('h2').next().slideDown(slideTime): $(this).parent('h2').next().slideUp(slideTime);
	});
	
	//Handling action radio buttons handler in step 2
	$('input[name="action-rdo"]').live('change', function() {
		$('input[name="action-rdo"]').parent('h2').next().slideUp(slideTime);
		$(this).is(':checked') ? $(this).parent('h2').next().slideDown(slideTime): $(this).parent('h2').next().slideUp(slideTime);
		$('.step-2 .added-action-list').html('').slideUp(slideTime);
	});
	
	//Carousel thumbnail click handler
	var videoId = null;
	$('#video-carousel li').live('click', function() {
		var liObj = $(this);
		$('#video-carousel li').each(function () {
			var locLiObj = $(this);
			var savedId = locLiObj.data('video-id');
			if (exisitngDataMap[savedId] == null) {
				$('a', locLiObj).removeClass('active');				
				//to-step-3-btn
			}
		});
		$('a', liObj).addClass('active');
		videoPath = liObj.data('video-path');
		videoId = liObj.data('video-id');
		if (exisitngDataMap[videoId] != null) {
			showSavedVideo(exisitngDataMap[videoId]);			
		}
	});
	
	//Step 1 button handler
	$('#to-step-2-btn').live('click', function() {
		var isPassed = false;
		if($('#exsting-video').is(':checked')) {
			if($('#video-carousel li a').hasClass('active')) {
				videoPath = $('#video-carousel li a.active').parent('li').data('video-path');
				videoType = 'stored';
				isPassed = true;
			} else {
				alert("Please select any video from the existing list to proceed");
				isPassed = false;
			}
		} else if($('#web-video').is(':checked')) {
			if($.trim(urlInput.val()) != '') {
				videoPath = urlInput.val();
				videoType = 'web-video';
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
	});
	
	//Step 2 button handler
	$('#to-step-3-btn').live('click', function() {
		//goToNextPage('.step-3');
		var isPassed = false;
			
		if($('#custom-actions').is(':checked')) {
			if($('.step-2 .added-action-list').children().length > 0) {
				isPassed = true;
			} else {
				isPassed = false;
				alert("Please set up at least 1 custom action in Step 2 to proceed to next step");
			}
		} else {
			if($('.step-2 .added-action-list').children().length > 0) {
				isPassed = true;
			} else {
				isPassed = false;
				alert("Please select from available action profile in Step 2 to proceed to next step");
			}
		}
		
		if (isPassed) {
			actionArray = [];
			$('.step-2 .added-action-list li').each(function() {
				var eachAction = new Object();
				eachAction.action = $(this).data('action');
				eachAction.hotKeyChar = $(this).data('hotKeyChar');
				eachAction.hotKeyCode = $(this).data('hotKeyCode');
				actionArray.push(eachAction);
				//$('.step-3 .added-action-list1').append(this);
			});
			//renderActionButtons();
			var actionClone = $('.step-2 .added-action-list').clone(true).removeClass('rounded-holder');
			$('.actions').html(actionClone).find('.delete-action').remove();
			goToNextPage('.step-3');
			highlightCurrentTab(2);
			
			if (!videoObj) {
				loadVideo();
				showExistingLog();
			}
			for(actionIndex in currentProfile) {
				var liStr = '<li>' + currentProfile[actionIndex].action + '</li>',
				liObj = $(liStr);
				if(currentProfile[actionIndex].hotKeyChar != '') {
					var spanObj = '<span class="hotkey" style="background-color:'+currentProfile[actionIndex].legend+'" title="Key board shortcut for this action is ' + currentProfile[actionIndex].hotKeyChar + '">' + 
									currentProfile[actionIndex].hotKeyChar + '</span>';
					liObj.append(spanObj).addClass('has-hot-key');
				}
				liObj.data({'action' : currentProfile[actionIndex].action, 
							'hotKeyChar' : currentProfile[actionIndex].hotKeyChar, 
							'hotKeyCode' : currentProfile[actionIndex].keyCode});		
				$('.step-3 .added-action-list1').append(liObj);
				
			}
		}
	});
	
	//Load button click handler
	$('#play-btn').on('click', function() {
		var videoPath = ($('#video-location').val() == 'local-video') ? getLocalFileNameArr($('#local-video-list').val()) : $('#url-input').val();
		//console.log(videoPath)
		if(videoObj) {
			Popcorn.destroy(videoObj);
			resetLoggingScope();
		}
		videoObj = Popcorn.smart('#video-holder-div', videoPath);
		$('#video-holder-div').slideDown(slideTime);
		//Caching media properties once the media metadata are loaded
		videoObj.on('loadedmetadata', function() {
			duration = videoObj.duration();
			frameRate = videoObj.options.framerate ? videoObj.options.framerate : 30;// TBD : Calculation of framerate needs to be accurate
			$('.panel-wrap.logger').slideDown(slideTime);
			$('.loading-wrap').addClass('hide');
		});
	});
	
	//In/out time click handler
	$('a.intime-btn, a.outtime-btn').on('click', function() {
		currentTime = videoObj.currentTime();
		if(currentTime > 0 && currentTime < duration) {
			var btnObj = $(this);
			videoObj.pause();			
			btnObj.prev('input[type="text"]').val(formatTime(currentTime));
		} else if(currentTime > duration) {
			alert("The video playing is over. You can't log time now. To log time, replay the video");
		} else {
			alert("The video has not yet started playing. Try logging after you have started playing the video");
		}
	});
	
	//Play the video
	$('.play-video').live('click', function() {
		videoObj.play();
	});
	
	$('#enter-out-time').live('click', function() {
		endTime = videoObj.currentTime();
		endInput.val(formatTime(endTime));
		$('#enter-out-time').css('display','none');
		$('#out-time-input').css('display','-moz-stack');
		videoObj.pause();
	});
	
	
	//Enter log button click handler - make entry of a row in the log table in UI, push new item in clipDataArray with new values
	$('#enter-log-btn,#enter-log2').on('click', function() {
		addLog();
		$('#image').css('display','none');
	});
	
	function addLog() {
		if(validateFields()) {
			legend="";
			
			for(actionIndex in currentProfile) {
				if(clipAction.data('action-value')==currentProfile[actionIndex].action){
					legend=currentProfile[actionIndex].legend;
				}				
			}
			spanText="";
			if(legend!="") {
				spanText='<span style="background-color:'+legend+'" class="hotkeyl" title="' + clipAction.data('action-value') + '">&nbsp;</span>'
			}
			
			var eventTypeSelect = $( "#eventSelect" ).val();
			var relativeY = - $("#video-holder-div").offset().top + $("#image").offset().top;
			var relativeX = - $("#video-holder-div").offset().left + $("#image").offset().left;
			
			var log = new VideoLog (clipAction.data('action-value'), eventTypeSelect, startInput.val(), endInput.val(), notesTextarea.val(), relativeX, relativeY);
			ngVideoLogInfo.addVideoLog(log);
			
			eachRowData = new Object();
			eachRowData.action = clipAction.data('action-value');
			eachRowData.startTime = startInput.val();
			eachRowData.endTime = endInput.val();
			eachRowData.eventType = eventTypeSelect;
			eachRowData.notes = notesTextarea.val();
			eachRowData.videoId = videoId;
			
			
			eachRowData.relX = relativeX;
			eachRowData.relY = relativeY;
			
			clipDataArray.push(eachRowData);
			clearFields();
			//alert("Clip entry successfully logged");
			$('section.right').removeClass('hide');
			videoObj.play();
			logTable.trigger("update");
			
			$('#enter-out-time').css('display','-moz-stack');
			$('#out-time-input').css('display','none');		
		}
	}
	
	function showExistingLog () {
		//asdf
		var logData = exisitngDataMap[videoId]; 
		if (logData != null) {
			$(logData.videoLogs).each(function( i ) {
				var notes = "";
				if (this.note != null) {
					notes = this.note;
				}
				
				legend="";
				
				for(actionIndex in currentProfile) {
					if(this.action==currentProfile[actionIndex].action){
						legend=currentProfile[actionIndex].legend;
					}				
				}
				spanText="";
				if(legend!=""){
					spanText='<span style="background-color:'+legend+'" class="hotkeyl" title="' + clipAction.data('action-value') + '">&nbsp;</span>'
				}
				
				eachRow = '<tr>' +
				
				'<td>' + spanText + '</td>' +
				'<td>' + this.startTime + '</td>' +						 
				'<td>' + this.endTime + '</td>' +
				'<td>' + notes + '</td>' +
				'<td>' + '<a href="javascript:void(0)" class="delete-cue hideText" title="Delete this log entry">Delete this log entry</a>'+ '</td>' +
			  '</tr>';
			  
				var eachRowObj = $(eachRow);				
				eachRowObj.data('stratTime', this.startTime);
				$('tbody', logTable).append(eachRowObj);
				//logTable.trigger("update");
				
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
	
	//Logger table row click handler
	$('tbody tr', logTable).live('click', function()
	{
		var rowIndex = $(this).index();
		videoObj.play(clipDataArray[rowIndex].startTime);
		/*videoObj.cue(clipDataArray[rowIndex].endTime, function() {
					videoObj.pause();
				});*/
	});
	
	//View log button handler
	$('#view-log').live('click', function()
	{
		if(videoData)
		{
			$('#log-preview-popup .video-meta-data').html(JSON.stringify(videoData));
		}
		else
		{
			$('#log-preview-popup .video-meta-data').html("Video meta data unavailable");
		}
		
		if(clipDataArray.length > 0)
		{
			$('#log-preview-popup .clip-data').html(JSON.stringify(clipDataArray));
		}
		else
		{
			$('#log-preview-popup .clip-data').html("Clip data unavailable");
		}
		
		if(actionArray.length > 0)
		{
			$('#log-preview-popup .action-data').html(JSON.stringify(actionArray));
		}
		else
		{
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
	});
	
	//Add custom action in step 2
	$('.add-action').live('click', function()
	{
		var action = $('#action-name').val();
		if(action != '')
		{
			var liStr = '<li>' + action + 
							'<a title="Delete this action" class="delete-action hideText" href="javascript:void(0)">Delete this action</a>' +
        				'</li>',
				liObj = $(liStr),
				hotKeyChar = $('#hot-key').val().toUpperCase(),
				keyCode = extractKeyCode(hotKeyChar);
				
			if(keyCode != '')
			{
				if($.inArray(hotKeyChar, existingHotkeys) == -1)
				{
					var spanObj = '<span class="hotkey" title="Key board shortcut for this action is ' + hotKeyChar + '">' + hotKeyChar + '</span>';
					liObj.append(spanObj).addClass('has-hot-key').attr('hotKeyCode');
					existingHotkeys.push(hotKeyChar);
				}
				else
				{
					alert("This hot key has already been used. Please choose another key for this action.");
					$('#hot-key').val('').focus();
					return;
				}
			}
			
			liObj.data({'action' : action, 'hotKeyChar' : hotKeyChar, 'hotKeyCode' : keyCode});		
			$('.step-2 .added-action-list').append(liObj).slideDown(slideTime);
		}
		else
		{
			alert("Please enter an action name");
		}
		$('#action-name').val('').focus();
		$('#hot-key').val('');
	});
	
	//Select from available action profile in step 2
	$('.add-popular-action').live('click', function()
	{
		var selectedProfile = $('#popular-action-list').val();
		switch (selectedProfile)
		{
			case 'cricket':
				populateSelectedActions(cricketActionProfile);
				break;
				
			case 'soccer':
				populateSelectedActions(soccerActionProfile);
				break;
				
			default:
				alert("Please select a valid action profile");
		}
	});
	
	//Delete an action in step 2
	$('.delete-action').live('click', function()
	{
		if($(this).parent('li').data('action') == clipAction.data('action-value'))
		{
			if(confirm("This is the current selected action for clip logging. Are you sure to delete this action?"))
			{
				removeAction($(this).parent('li'));
				clipAction.text('').data('action-value','').css('display', 'none');
			}
		}
		else
		{
			removeAction($(this).parent('li'));
		}
	});
	
	//Delete a logged entry
	$('.delete-cue').live('click', function(e)
	{
		if(confirm("Are you sure to delete this log entry?"))
		{
			var rowIndex = $(this).closest('tr').index();
			$(this).closest('tr').remove();
			clipDataArray.splice(rowIndex, 1);
		}
		e.stopPropagation();
		logTable.trigger("update");
		return false;
	});
	
	//Submit log button handler - Generate final JSON data with all logged clip items
	submitBtn.on('click', function()
	{
		var clipData = clipDataArray;
		var vObject = new Object();
		vObject.id = videoId;
		vObject.url = videoPath;
		vObject.videoType = videoType; 
		
		var videoData = [vObject];
		var videoLog = [];
		vObject.videoLogs = videoLog;
		
		var videoActions = [];
		vObject.actions = videoActions;
		
		$(clipDataArray).each(function () {
			var logObject = new Object();
			logObject = new VideoLog (this.action, this.eventType, this.startTime, this.endTime, this.notes);			
			videoLog.push(logObject);
		});
		
		$(actionArray).each(function () {
			var action = new Action (this.action, this.hotKeyChar, this.hotKeyCode);
			var style = new Style();
			style.backgroundColor = this.legend;
			action.style = style;
			videoActions.push(action);
		});
		
		//SaveDATA
		//clipDataArray
		$.ajax({
			  type: "POST",
			  url: "/video-logger/saveVideoLog",
			  data: JSON.stringify(videoData),
			  success: function (data) {
				  
			  },
			  dataType: "json"
		});
	});
		
	// Action click handler
	$('.actions .added-action-list li').live('click', function()
	{
		currentTime = videoObj.currentTime();
		if(currentTime > 0 && currentTime < duration)
		{
			var index = $(this).index();
			$('.actions li').removeClass('selected');
			$(this).addClass('selected');
			clipAction.text(actionArray[index].action).data('action-value', actionArray[index].action).css('display', 'inline-block');
			//videoObj.pause();
			startInput.val(formatTime(currentTime));
		}
		else if(currentTime >= duration)
		{
			alert("The video playing is over. You can't log time now. To log time, replay the video");
		}
		else
		{
			alert("The video has not yet started playing. Try logging after you have started playing the video");
		}
	});
	
	//Pause the video if something notes textarea gets focus
	notesTextarea.focus(function()
	{
		if(videoObj)
		{
			videoObj.pause();
		}
	});
	
	//navigation menu click handler
	$('ul.logging-nav li').live('click', function()
	{
		var liIndex = $(this).index();
		
		switch(liIndex)
		{
			case 0:
				if(videoObj)
				{
					if(confirm("If you select a new video, the current video logging will be lost. Are you sure to navigate away?"))
					{
						goToNextPage('.step-1');
						highlightCurrentTab(0);
						resetLoggingScope();
					}
				}
				else
				{
					goToNextPage('.step-1');
					highlightCurrentTab(0);
				}
				break;
			
			case 1:
				$('#to-step-2-btn').click();
				break;
				
			case 2:
				$('#to-step-3-btn').click();
				break;
				
			default:
				//
		}
	});
	
	//Handling hot key press events for each corresponding action
	$(document).keyup(function(e)
	{
		var pressedKey = String.fromCharCode(e.keyCode).toUpperCase();
		if(e.target.localName != 'textarea'){
		if(allowedKeysRegex.test(pressedKey) && $('.actions .added-action-list').children().length > 0)
		{
			$('.actions .added-action-list li').filter(function() { return $.data(this, 'hotKeyChar') == pressedKey; }).click();
		}
		}
	});
	
	//Preview button handler
	var timeStore; 
	$('#preview').live('click', function()
	{
		if(clipDataArray.length > 0)
		{
			$('.logger-holder, section.left, #preview, #view-log, #submit-log').hide();
			$('section.right').css('width', '100%');
			$('#back-to-logger').show();
			$('th:last-child, tr td:last-child', logTable).addClass('hide');
			if(videoObj)
			{
				timeStore = videoObj.currentTime(); 
				videoObj.currentTime(0).play();
				syncVideoWidLog();
			}
		}
		else
		{
			alert("At least one action should be captured to preview the logged video.");
		}
	});
	
	//Helper function to synchronize video with log record table
	function syncVideoWidLog()
	{
		var inTime;
		for(clipIndex in clipDataArray)
		{
			inTime = clipDataArray[clipIndex].startTime;
			videoObj.cue(inTime, cueCallback(inTime));
			
			if(clipDataArray[clipIndex].eventType == "Subtitle"){			
				videoObj.subtitle({
	    	         start: clipDataArray[clipIndex].startTime,
	    	          end: clipDataArray[clipIndex].endTime,
	    	          text: clipDataArray[clipIndex].notes
	    	       });
			}else if(clipDataArray[clipIndex].eventType == "Footnote"){
				videoObj.footnote({
					  start: clipDataArray[clipIndex].startTime,
		   	          end: clipDataArray[clipIndex].endTime,
		   	          text: clipDataArray[clipIndex].notes,
		   	          target:"previewData"  
		           });
			}else if(clipDataArray[clipIndex].eventType == "Pop"){
				videoObj.pop({
					start: clipDataArray[clipIndex].startTime,
	   	            end: clipDataArray[clipIndex].endTime,
	   	            text: clipDataArray[clipIndex].notes,
			        target:"video-holder-div",
			        top: ($("#video-holder-div").offset().top + clipDataArray[clipIndex].relY) + "px",
			        left: ($("#video-holder-div").offset().top + clipDataArray[clipIndex].relX - 120) + "px",
			        icon:"../css/images/pointer.png"
				});
				
				
			}
			
			/*videoObj.footnoteAnimated({
				  start: 2,
				  end: 6,
				  text: "Pop!",
				  target: "previewData"
				});*/
			
			
			/*videoObj.image({
				        start: 1,
				       end: 15,
				       href: "http://www.drumbeat.org/",
				     src: "https://www.drumbeat.org/media//images/drumbeat-logo-splash.png",
				       text: "DRUMBEAT",
				       target: "previewData"
				     });*/
			/*videoObj.wikipedia({
		        start: 1,
		        end: 10,
		        src: "http://en.wikipedia.org/wiki/India",
		        title: "this is an article about india",
		        target: "wikidiv"
		      });*/
		}
	}
	
	//Cue event callback function
	function cueCallback(inTime)
	{
		return function()
		{
			$('tbody tr', logTable).removeClass('row-highlight').filter(function() {return $.data(this, 'stratTime') == inTime;}).addClass('row-highlight');
		};
	}
	
	//Back from preview screen
	$('#back-to-logger').live('click', function()
	{
		videoObj.pause().currentTime(timeStore);
		$('.logger-holder, section.left, #preview, #view-log, #submit-log').show();
		$('section.right').css('width', '85%');
		$('#back-to-logger').hide();
		$('th:last-child, tr td:last-child', logTable).removeClass('hide');
		$('tbody tr', logTable).removeClass('row-highlight');
	});
		
	//helper function to remove an action and associated hotkey, also delete corresponding item from actionArray[]
	function removeAction(liObj)
	{
		var liIndex = liObj.index();
		if(liObj.data('hotKeyChar') != '')
		{
			var itemIndex = existingHotkeys.indexOf(liObj.data('hotKeyChar'));
			existingHotkeys.splice(itemIndex, 1);
		}
		liObj.remove();		
		actionArray.splice(liIndex, 1);
	}
	

	
	//Helper function to load a video either from local resource or from web
	function loadVideo(videoURL) {
		url = videoURL;
		if (url == null) {
			url = $('#exsting-video').is(':checked') ? getLocalFileNameArr(videoPath) : videoPath;			
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
	
	//Helper function to validate intime, outtime and notes field
	function validateFields()
	{
		var isValid = false;
		
		if($.trim(clipAction.text()) == '')
		{
			alert("To log a clip in the video, 'Action' must be specified");
		}		
		else if(startInput.val() == '')
		{
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
		else
		{
			isValid = true;
		}
		return isValid;
	}
	
	//Helper function to clear fields after logging
	function clearFields()
	{
		startInput.val('');
		endInput.val('');
		notesTextarea.val('');
	}
	
	//Helper function to format the timestamp values (from seconds to SMPTE formatted string i.e. HH:MM:SS.FF)
	function formatTime(sec) {
		var d = new Date(Number(sec * 1000)),
			HH = d.getUTCHours(),
			MM = d.getUTCMinutes(),
			SS = d.getUTCSeconds(),
			FF = ((d.getUTCMilliseconds() * frameRate) / 1000).toFixed(0),
			timecode = [ pad(HH), pad(MM), pad(SS) ];
			
		return timecode.join(':') + '.' + pad(FF); // HH:MM:SS.FF
	}
	
	//Helper function of formatTime() function to add 0 before single digit number
	function pad(num) {
		if (num > 9) {
			return num;
		} else {
			return '0' + num;
		}	
	}
	
	//Helper function to return an array containing different filename versions of the media element
	function getLocalFileNameArr(fileName)
	{
		var fileNameArr = [],
			ogvFormat = localFilePath + fileName + OGV,
			mp4Format = localFilePath + fileName + MP4,
			webmFormat = localFilePath + fileName + WEBM;
			
		fileNameArr = [ogvFormat, mp4Format, webmFormat];
		
		return fileNameArr;
	}
	
	//Helper function to render the UI for actions in Logger section
	function renderActionButtons()
	{
		var liStr = ''
		for(actionIndex in actionArray)
		{
			liStr += '<li>' + actionArray[actionIndex].action + '</li>';
		}
		$('ul.actions').html(liStr);
	}
	
	//Helper function to render the action list in step 2 with pre existing action profiles
	function populateSelectedActions(actionProfile)
	{
		currentProfile = actionProfile;
		$('.step-2 .added-action-list').html('');
		for(actionIndex in actionProfile)
		{
			var liStr = '<li>' + actionProfile[actionIndex].action + '</li>',
			liObj = $(liStr);
			if(actionProfile[actionIndex].hotKeyChar != '')
			{
				var spanObj = '<span class="hotkey" style="background-color:'+actionProfile[actionIndex].legend+'" title="Key board shortcut for this action is ' + actionProfile[actionIndex].hotKeyChar + '">' + 
								actionProfile[actionIndex].hotKeyChar + '</span>';
				liObj.append(spanObj).addClass('has-hot-key');
			}
			liObj.data({'action' : actionProfile[actionIndex].action, 
						'hotKeyChar' : actionProfile[actionIndex].hotKeyChar, 
						'hotKeyCode' : actionProfile[actionIndex].keyCode});		
			$('.step-2 .added-action-list').append(liObj);
			
		}
		$('.step-2 .added-action-list').slideDown(slideTime);
	}
	
	//Resetting the UI and flushing the stored objects on loading a new instance of video
	function resetLoggingScope()
	{
		if(videoObj)
		{
			Popcorn.destroy(videoObj);
			videoObj = null;
		}
		$('#video-holder-div video').eq(0).remove();
		$('#video-holder-div iframe').eq(0).remove();
		$('.actions').html('');
		$('#popular-action-list').val('select');
		$('#log-preview-popup .action-data').html('');
		$('#log-preview-popup .clip-data').html('');
		$('ul.added-action-list').html('').hide();
		$('#custom-actions').attr('checked', true).change();
		$('#exsting-video').attr('checked', true).change();
		$('#video-carousel li a').removeClass('active');
		$('tbody', logTable).html('');
		urlInput.val('');
		clearFields();
		clipAction.text('').data('action-value','').css('display', 'none');
		actionArray = [],
		clipDataArray = [],
		videoData = null;	
		finalVO = null;
	}
	
	//Helper function for navigating from one step to another
	function goToNextPage(panelName)
	{
		$('.panels > .panel-wrap').addClass('hide');
		$('.panels').children(panelName).removeClass('hide');
	}
	
	//Helper function to highlight current tab
	function highlightCurrentTab(liIndex)
	{
		$('ul.logging-nav li').removeClass('selected').eq(liIndex).addClass('selected');
	}
		
	//Helper function to show error
	function showMessage(msg)
	{
		alert(msg);
	}
	
	//helper function to extract hot key code of a corresponding action
	function extractKeyCode(keyVal)
	 {
		return (keyVal != '' && allowedKeysRegex.test(keyVal)) ? keyVal.charCodeAt(0) : '';
	 }
	
	function showSavedVideo (videoInfo) {
		if (videoInfo != null) {
			actionArray = [];
			var videoActions = videoInfo.actions;
						
			videoPath = videoInfo.url;
			videoType = videoInfo.videoType;
			if (videoPath != null && videoType != null) {
				loadVideo();
				showExistingLog();			
				$(videoInfo.actions).each(function () {
					
					var eachAction = new Object();
					eachAction.action = this.name;
					eachAction.hotKeyChar = this.hotKeyChar;
					eachAction.keyCode = this.hotKeyCode;
					actionArray.push(eachAction);
					
					var liStr = '<li>' + this.name + '</li>',
					liObj = $(liStr);
					if(this.hotKeyChar != '') {
						var spanObj = '<span class="hotkey" style="background-color:'+this.legend+'" title="Key board shortcut for this action is ' + this.hotKeyChar + '">' + 
						this.hotKeyChar + '</span>';
						liObj.append(spanObj).addClass('has-hot-key');
					}
					liObj.data({'action' : this.action,
								'hotKeyChar' : this.hotKeyChar, 
								'hotKeyCode' : this.hotKeyCode});		
					$('.step-3 .added-action-list1').append(liObj);
					//$('.step-2 .added-action-list').append(liObj);			
									
				});
				
				populateSelectedActions(actionArray);					
				var actionClone = $('.step-2 .added-action-list').clone(true).removeClass('rounded-holder hide').attr("style", "display: block;");
				var ss = $(actionClone).html();
				$('.actions').html(actionClone).find('.delete-action').remove();
				goToNextPage('.step-3');
				
			}
		}		
	}
});



