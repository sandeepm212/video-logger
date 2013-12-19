$(document).ready(function() {
	
	urlInput = $('#url-input'),
	startInput = $('#in-time-input'),
	endInput = $('#out-time-input'),
	notesTextarea = $('#clip-notes'),
	logTable = $('#clip-logger'),
	clipAction = $('#action-value'),
	submitBtn = $('#submit-log'),
	
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
		//$('.step-2 .added-action-list').html('').slideUp(slideTime);
	});
	
	//Carousel thumbnail click handler
	$('#video-carousel li').live('click', function() {
//		var liObj = $(this);
//		$('#video-carousel li').each(function () {
//			var locLiObj = $(this);
//			var savedId = locLiObj.data('video-id');
//			if (exisitngDataMap[savedId] == null) {
//				$('a', locLiObj).removeClass('active');				
//				//to-step-3-btn
//			}
//		});
//		$('a', liObj).addClass('active');
//		videoPath = liObj.data('video-path');
//		videoId = liObj.data('video-id');
//		if (exisitngDataMap[videoId] != null) {
//			showSavedVideo(exisitngDataMap[videoId]);			
//		}
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
		
	//Enter log button click handler - make entry of a row in the log table in UI, push new item in clipDataArray with new values
	$('#enter-log-btn,#enter-log2').on('click', function() {
		//addLog();
		$('#image').css('display','none');
	});
	
	
	//Submit log button handler - Generate final JSON data with all logged clip items
	submitBtn.on('click11', function()
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
	
	//Helper function to clear fields after logging
	function clearFields()
	{
		startInput.val('');
		endInput.val('');
		notesTextarea.val('');
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
	
	
});



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

//Helper function to return an array containing different filename versions of the media element
function getLocalFileNameArr(fileName)
{
	var fileNameArr = [], ogvFormat = localFilePath + fileName + OGV, mp4Format = localFilePath + fileName + MP4, webmFormat = localFilePath + fileName + WEBM;
		
	fileNameArr = [ogvFormat, mp4Format, webmFormat];
	return fileNameArr;
}