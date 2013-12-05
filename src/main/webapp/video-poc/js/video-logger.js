$(document).ready(function()
{
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
		cricketActionProfile = [{"action":"Boundary","hotKeyChar":"B","hotKeyCode":66},
								{"action":"Over boundary","hotKeyChar":"6","hotKeyCode":54},
								{"action":"3 runs","hotKeyChar":"3","hotKeyCode":51},
								{"action":"Out","hotKeyChar":"O","hotKeyCode":79},
								{"action":"One run","hotKeyChar":"1","hotKeyCode":49},
								{"action":"Two runs","hotKeyChar":"2","hotKeyCode":50}],
								
		soccerActionProfile = [	{"action":"Goal","hotKeyChar":"G","hotKeyCode":71},
								{"action":"Penalty","hotKeyChar":"P","hotKeyCode":80},
								{"action":"Free kick","hotKeyChar":"F","hotKeyCode":70},
								{"action":"Super save","hotKeyChar":"S","hotKeyCode":83}];
		
	//Constant declaration
	var MP4 = '.mp4',
		OGV = '.ogv',
		WEBM = '.webm';
	
	//loading the existing video carousel
	$('#video-carousel').jcarousel();
	
	//Calling the table sorter plugin
	logTable.tablesorter({
		headers:{ 2 : {sorter : false}, 3 : {sorter : false}}
	});
	
	//Handling selection radio buttons
	$('input[name="video-type-rdo"]').live('change', function()
	{
		$('input[name="video-type-rdo"]').parent('h2').next().slideUp(slideTime);
		$(this).is(':checked') ? $(this).parent('h2').next().slideDown(slideTime): $(this).parent('h2').next().slideUp(slideTime);
	});
	
	//Handling action radio buttons handler in step 2
	$('input[name="action-rdo"]').live('change', function()
	{
		$('input[name="action-rdo"]').parent('h2').next().slideUp(slideTime);
		$(this).is(':checked') ? $(this).parent('h2').next().slideDown(slideTime): $(this).parent('h2').next().slideUp(slideTime);
		$('.step-2 .added-action-list').html('').slideUp(slideTime);
	});
	
	//Carousel thumbnail click handler
	$('#video-carousel li').live('click', function()
	{
		var liObj = $(this);
		$('#video-carousel li a').removeClass('active');
		$('a', liObj).addClass('active');
		videoPath = liObj.data('video-path');
	});
	
	//Step 1 button handler
	$('#to-step-2-btn').live('click', function()
	{
		var isPassed = false;
		if($('#exsting-video').is(':checked'))
		{
			if($('#video-carousel li a').hasClass('active'))
			{
				videoPath = $('#video-carousel li a.active').parent('li').data('video-path');
				videoType = 'stored';
				isPassed = true;
			}
			else
			{
				alert("Please select any video from the existing list to proceed");
				isPassed = false;
			}
		}
		else if($('#web-video').is(':checked'))
		{
			if($.trim(urlInput.val()) != '')
			{
				videoPath = urlInput.val();
				videoType = 'web-video';
				isPassed = true;
			}
			else
			{
				alert("Please type a URL of a video in the input box to proceed");
				isPassed = false;
			}
		}
		else
		{
			alert("You should either select from existing video or type a URL to proceed to next step");
			isPassed = false;
		}
		
		if(isPassed)
		{
			goToNextPage('.step-2');
			if(videoObj)
			{
				videoObj.pause();
			}
			$('#video-name').text(videoPath);
			$('#action-name').focus();
			highlightCurrentTab(1);
		}
	});
	
	//Step 2 button handler
	$('#to-step-3-btn').live('click', function()
	{
		//goToNextPage('.step-3');
		var isPassed = false;
			
		if($('#custom-actions').is(':checked'))
		{
			if($('.step-2 .added-action-list').children().length > 0)
			{
				isPassed = true;
			}
			else
			{
				isPassed = false;
				alert("Please set up at least 1 custom action in Step 2 to proceed to next step");
			}
		}
		else
		{
			if($('.step-2 .added-action-list').children().length > 0)
			{
				isPassed = true;
			}
			else
			{
				isPassed = false;
				alert("Please select from available action profile in Step 2 to proceed to next step");
			}
		}
		
		if(isPassed)
		{
			actionArray = [];
			$('.step-2 .added-action-list li').each(function() {
				var eachAction = new Object();
				eachAction.action = $(this).data('action');
				eachAction.hotKeyChar = $(this).data('hotKeyChar');
				eachAction.hotKeyCode = $(this).data('hotKeyCode');
				actionArray.push(eachAction);
			});
			//renderActionButtons();
			var actionClone = $('.step-2 .added-action-list').clone(true).removeClass('rounded-holder');
			$('.actions').html(actionClone).find('.delete-action').remove();
			goToNextPage('.step-3');
			highlightCurrentTab(2);
			if(!videoObj)
			{
				loadVideo();
			}
		}
	});
	
	//Load button click handler
	$('#play-btn').on('click', function()
	{
		var videoPath = ($('#video-location').val() == 'local-video') ? getLocalFileNameArr($('#local-video-list').val()) : $('#url-input').val();
		//console.log(videoPath)
		if(videoObj)
		{
			Popcorn.destroy(videoObj);
			resetLoggingScope();
		}
		videoObj = Popcorn.smart('#video-holder-div', videoPath);
		$('#video-holder-div').slideDown(slideTime);
		//Caching media properties once the media metadata are loaded
		videoObj.on('loadedmetadata', function()
		{
			duration = videoObj.duration();
			frameRate = videoObj.options.framerate ? videoObj.options.framerate : 30;// TBD : Calculation of framerate needs to be accurate
			$('.panel-wrap.logger').slideDown(slideTime);
			$('.loading-wrap').addClass('hide');
		});
	});
	
	//In/out time click handler
	/*$('a.intime-btn, a.outtime-btn').on('click', function()
	{
		currentTime = videoObj.currentTime();
		if(currentTime > 0 && currentTime < duration)
		{
			var btnObj = $(this);
			videoObj.pause();
			
			btnObj.prev('input[type="text"]').val(formatTime(currentTime));
		}
		else if(currentTime > duration)
		{
			alert("The video playing is over. You can't log time now. To log time, replay the video");
		}
		else
		{
			alert("The video has not yet started playing. Try logging after you have started playing the video");
		}
	});*/
	
	//Play the video
	$('.play-video').live('click', function()
	{
		videoObj.play();
	});
	
	$('#enter-out-time').live('click', function()
	{
		endTime = videoObj.currentTime();
		endInput.val(formatTime(endTime));
		$('#enter-out-time').css('display','none');
		$('#out-time-input').css('display','-moz-stack');
		videoObj.pause();
	});
	
	
	//Enter log button click handler - make entry of a row in the log table in UI, push new item in clipDataArray with new values
	$('#enter-log-btn').on('click', function()
	{
		if(validateFields())
		{
			eachRow = '<tr>' +
						'<td>' + startInput.val() + '</td>' +
						'<td>' + clipAction.data('action-value') + '</td>' + 
						'<td>' + endInput.val() + '</td>' +
						'<td>' + notesTextarea.val() + '</td>' +
						'<td>' + '<a href="javascript:void(0)" class="delete-cue hideText" title="Delete this log entry">Delete this log entry</a>'+ '</td>' +
					  '</tr>';
					  
			var eachRowObj = $(eachRow);
			eachRowObj.data('stratTime', startInput.val());
			$('tbody', logTable).append(eachRowObj);
			
			eachRowData = new Object();
			eachRowData.action = clipAction.data('action-value');
			eachRowData.startTime = startInput.val();
			eachRowData.endTime = endInput.val();
			eachRowData.notes = notesTextarea.val();
			clipDataArray.push(eachRowData);
			clearFields();
			alert("Clip entry successfully logged");
			$('section.right').removeClass('hide');
			videoObj.play();
			logTable.trigger("update");
			
			$('#enter-out-time').css('display','-moz-stack');
			$('#out-time-input').css('display','none');
			
			
		}
	});
	
	 
	
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
		finalVO = new Object();
		finalVO.videoData = videoData;
		finalVO.actions = actionArray;
		finalVO.clipData = clipDataArray;
		console.log(JSON.stringify(finalVO));	
		
		/*var sample = {"videoData":{"type":"stored","url":"trailer","duration":64.541666},"actions":["Goal","Penalty","Free kick","Super save"],"clipData":[{"action":"Penalty","startTime":"00:00:01.01","endTime":"00:00:02.06","notes":"test note 1111"}]}
		$.ajax({
			url : '../services/video-logger-save-data.php',
			type : 'POST',
			data : {jsonData : JSON.stringify(sample)},
			//dataType : 'json',
			success : function(response, textStatus)
			{
				if(textStatus === 'success' && response)
				{
					//showMessage(response);
				}
				else
				{
					//showMessage("Some error has occurred. Please try after sometime.");
				}
			},
			error : function(jqXHR, textStatus, errorThrown)
			{
				//showMessage("Some error has occurred. Please try after sometime.");
				//TBD : Refinement of error messages according to different error conditions
			}
		});*/
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
		if(allowedKeysRegex.test(pressedKey) && $('.actions .added-action-list').children().length > 0)
		{
			$('.actions .added-action-list li').filter(function() { return $.data(this, 'hotKeyChar') == pressedKey; }).click();
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
	
	//Helper function to synchronize video with log record table
	function syncVideoWidLog()
	{
		var inTime;
		for(clipIndex in clipDataArray)
		{
			inTime = clipDataArray[clipIndex].startTime;
			videoObj.cue(inTime, cueCallback(inTime));
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
	
	//Helper function to load a video either from local resource or from web
	function loadVideo()
	{
		url = $('#exsting-video').is(':checked') ? getLocalFileNameArr(videoPath) : videoPath;
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
	function formatTime(sec)
	{
		var d = new Date(Number(sec * 1000)),
			HH = d.getUTCHours(),
			MM = d.getUTCMinutes(),
			SS = d.getUTCSeconds(),
			FF = ((d.getUTCMilliseconds() * frameRate) / 1000).toFixed(0),
			timecode = [ pad(HH), pad(MM), pad(SS) ];
			
		return timecode.join(':') + '.' + pad(FF); // HH:MM:SS.FF
	}
	
	//Helper function of formatTime() function to add 0 before single digit number
	function pad(num)
	{
		if (num > 9)
			return num;
		else
			return '0' + num;
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
		$('.step-2 .added-action-list').html('');
		for(actionIndex in actionProfile)
		{
			var liStr = '<li>' + actionProfile[actionIndex].action + '</li>',
			liObj = $(liStr);
			if(actionProfile[actionIndex].hotKeyChar != '')
			{
				var spanObj = '<span class="hotkey" title="Key board shortcut for this action is ' + actionProfile[actionIndex].hotKeyChar + '">' + 
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
});
