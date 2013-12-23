$(document).ready(function() {
	
	urlInput = $('#url-input'),
	startInput = $('#in-time-input'),
	endInput = $('#out-time-input'),
	notesTextarea = $('#clip-notes'),
	logTable = $('#clip-logger'),
	clipAction = $('#action-value'),
	submitBtn = $('#submit-log'),
	
	
	
	
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
		}else if(pressedKey=='L'){
			openLog();
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
		finalVO = null;
	}
	
	
});



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