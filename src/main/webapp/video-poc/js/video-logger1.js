$(document).ready(function() {
	
	urlInput = $('#url-input'),
	startInput = $('#in-time-input'),
	endInput = $('#out-time-input'),
	notesTextarea = $('#clip-notes'),
	
	clipAction = $('#action-value'),
	submitBtn = $('#submit-log'),
	
	
	
	
	//loading the existing video carousel
	$('#video-carousel').jcarousel();
	
		
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
	
		
	
	//Handling hot key press events for each corresponding action
	$(document).keyup(function(e)
	{
		var pressedKey = String.fromCharCode(e.keyCode).toUpperCase();
		if(e.target.localName != 'input'){
		if(allowedKeysRegex.test(pressedKey) && $('.actions .added-action-list1').children().length > 0)
		{
				
			$('.actions .added-action-list1 li').filter(function() {
				if(this.children[0].textContent == pressedKey){
					$('#clip-notes').focus();
					return true;
				}else{
					return false;
				}
				
				 }).click();
		} 
		}else if(e.target.id == 'clip-notes'){
			if(e.keyCode==13){
				$('#enter-log-btn').click();
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