myAppModule.controller('step3Controller', function($scope, sharedService, $location, $http) {
	console.log("------ step3Controller ---------");
	$scope.selectedVideo = null;
	$scope.currentLog = new VideoLog();
	var actionsMap = [];
	$scope.vObject = new Video();
	$scope.projectName = null;
	
	$scope.init = function () {
		console.log("intializing step3Controller...");
		$scope.selectedVideo = sharedService.getVideo();		
//		console.log($scope.selectedVideo);
		$('#navi').hide();
		if (!videoObj) {
			// Play Selected Video
			if ($scope.selectedVideo != null) {
				var videoURL = $scope.selectedVideo.url;
				var isPublic = true;
				if ($scope.selectedVideo.videoType !== VIDEO_TYPE_WEB) {
					videoURL = getLocalFileNameArr($scope.selectedVideo.url);
					isPublic = false;
				} else {
					duration = $scope.selectedVideo.duration;
				}
				loadVideo(videoURL, isPublic);
				videoObj.on('pause', function() {
					$('#outtime-btn').click();	
				});
				//js actions
				//$('#navi-menu').sidr({side: 'right',name: 'navi'});
				$('#eventSelect').on('change', function (e) {
				    var optionSelected = $("option:selected", this);
				    var valueSelected = this.value;
				    if (valueSelected == "Pop") {
				    	$('#image').css('display','block');
				    }else{
				    	$('#image').css('display','none');
				    }
				});
				$('#helper').draggable({
			        containment: "#video-holder-div",
			        scroll: false
				});
				
				$("#ClosePanel").click(function () {
			        $("#content-box").animate({'width': 0},1,function(){
			           $("#content-box").css('display','none');
			         /*  $('#in-time-input').val('');
			           $('#out-time-input').val('');
			           $('#actionSpan').html('');
			           */
			           logOpened = false;
			        });
				});		
				 $('#dvview').layout();
				var pageLayout = $('#layoutdiv').layout({	
			        spacing_open:2,
			        onresize : setVideoParentDimentions,
					north :{
						resizable: false,
						slidable:false,
						closable:false
					},
					south :{
						resizable: false,
						slidable:false,
						closable:false
					},		
					west__size: .55, 		
					west__minSize: .55,
					west__maxSize: .55,
					west__childOptions: {
						spacing_open:2,		
						north__size:.65,
						north__minSize:.65,
						north__maxSize:.65
					}
				});
				
				//$('#layoutdiv').css("position","");
				
				setVideoParentDimentions();
				// $scope.syncVideoWidLog();
				
				  $('#clip-logger').tablesorter({
						headers:{ 3 : {sorter : false}, 4 : {sorter : false}},
						sortList: [
						          
						           [0, 0]
						       ],
						       selectorHeaders: '> thead th, > thead td',

						       // jQuery selector of content within selectorHeaders
						       // that is clickable to trigger a sort.
						       selectorSort: "th, td",
						       debug:true
					});
			}
		}
	}
	
	$scope.selectedLogIndex = -1;
	$scope.deleteLog = function(index) {
		if(confirm("Are you sure to delete this log entry?")) {
			$scope.selectedVideo.videoLogs.splice(index, 1);
			if ($scope.selectedLogIndex == index) {
				$scope.cancelUpdate();
			}
		}
	}
	
	$scope.addVideoLog = function  (logDetails) {
		if (logDetails != null) {
			$scope.selectedVideo.videoLogs.push(logDetails);
		}
	}
	
	$scope.playVideo = function () {
		videoObj.play();
	}
	
	$scope.lastSelectedRow = null;
	$scope.showLogVideo = function  (index, $event) {
		videoObj.play($scope.selectedVideo.videoLogs[index].startTime);
		if ($scope.lastSelectedRow != null) {
			$($scope.lastSelectedRow).removeClass("selected");
		}
		$scope.lastSelectedRow = $event.currentTarget;
		$($event.currentTarget).addClass("selected");
		$scope.selectedLogIndex = index;
		
		$('#cancel-log-btn, #update-log-btn').show();
		$('#enter-log-btn').hide();
		
		$scope.currentLog = $scope.copyLog($scope.selectedVideo.videoLogs[index]);
		
		$('#actionList li').each(function(i, element) {
			if (element.dataset.actionname === $scope.currentLog.action) {
				$(element).addClass("selected");
			} else {
				$(element).removeClass("selected");
			}
		});
	}
	
	$scope.selectRow = function  (index, $event) {
		videoObj.play($scope.selectedVideo.videoLogs[index].startTime);
		
	}
	
	$scope.copyLog = function (log) {
		var newLog = new VideoLog();
		newLog.action = log.action;
		newLog.note = log.note;
		newLog.startTime = log.startTime;
		newLog.endTime = log.endTime;
		newLog.relativeX = log.relativeX;
		newLog.relativeY = log.relativeY;
		newLog.eventType = log.eventType;
		
		return newLog;
	}
	
	$scope.cancelUpdate = function () {
		$('#cancel-log-btn, #update-log-btn').hide();
		$('#enter-log-btn').show();
		$scope.currentLog = new VideoLog();
		$('#actionList li').each(function(i) {
			$(this).removeClass("selected");
		});
		if ($scope.lastSelectedRow != null) {
			$($scope.lastSelectedRow).removeClass("selected");
		}
	}
	
	$scope.updateLog = function () {
		$('#cancel-log-btn, #update-log-btn').hide();
		$('#enter-log-btn').show();
		$scope.selectedVideo.videoLogs[$scope.selectedLogIndex] = $scope.currentLog; 
		
		$scope.currentLog = new VideoLog();
	}
		
	$scope.hasHotKey = function (action) {
		return (action.hotKeyChar != '' && action.hotKeyChar != null);
	}
	
	// Handle the action selection during video playback
	$scope.applyAction = function (index, event) {
		videoObj.pause();
		var selectedAction = $scope.selectedVideo.actions[index];
		$scope.currentLog.action = selectedAction.name;
		
		currentTime = videoObj.currentTime();
//		console.log("currentTime:: " + currentTime);
		if(currentTime > 0 && currentTime < duration) {
			$scope.currentLog.startTime = formatTime(currentTime);
			$scope.currentLog.endTime = formatTime(currentTime);
			$('.actions li').removeClass('selected');
			$(event.currentTarget).addClass('selected');
			$scope.currentLog.eventType = "Subtitle";
		} else if(currentTime >= duration) {
			alert("The video playing is over. You can't log time now. To log time, replay the video");
		} else {
			alert("The video has not yet started playing. Try logging after you have started playing the video");
		}
	}
	
	$scope.publishVideoLog = function (type) {
		var d = new Date();
		var pid = d.getTime();
//		console.log(JSON.stringify($scope.selectedVideo));
		$.ajax({
			  contentType:"text/plain;charset=UTF-8",
			  type: "POST",
			  url: '/video-logger/getVideoLog?publish=true&pid='+pid,
			  data: JSON.stringify($scope.selectedVideo),
			  success: function (data) {
				  console.log(data);
				  window.open('/video-logger/getVideoLog?publish=true&show=y&pid='+pid,'_blank');
			  },
			  error: function (data) {
				  console.log("error");
				  window.open('/video-logger/getVideoLog?publish=true&show=y&pid='+pid,'_blank');
			  },
			  dataType: "json"
		});
	}
		
	// Save the video logs
	$scope.saveVideoLog = function (type) {
		if (type === 'save') {
			if ($scope.selectedVideo.projectName.length === 0) {
				alert("Please enter project name.");
			} else {
				$.ajax({
					  type: "POST",
					  url: "/video-logger/validater",
					  data: {FILTER_TYPE:'PROJECT_NAME', FILTER_VALUE: $scope.selectedVideo.projectName, OBJECT_ID: $scope.selectedVideo.projectId},
					  success: function (data) {
						  if (data.valid == true) {
							  $scope.saveValidatedVideoLog();
					    	} else {
					    		alert("Project name already exists.");
					    	}
					  },
					  error: function (data) {
//						  console.log(data);
					  },
					  dataType: "json"
				});
			}			
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
	
	
	$scope.saveValidatedVideoLog = function () {
		//SaveDATA		
		$.ajax({
			  type: "POST",
			  url: "/video-logger/saveVideoLog",
			  data: JSON.stringify($scope.selectedVideo),
			  success: function (savedStatus) {
				  if (savedStatus != null && savedStatus.projectId != null && savedStatus.projectId.length > 0) {
					  alert("Saved Successfully.");
					  $scope.selectedVideo.projectId = savedStatus.projectId;
					  $('#project-name-popup').dialog('close');
				  } else {
					  alert("Failed to Save.");
				  }
			  },
			  error: function (data) {
//				  console.log(data);
			  },
			  dataType: "json"
		});
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
		$scope.currentLog.trackId="";
		if ($scope.selectedVideo.videoLogs == null) {
			$scope.selectedVideo.videoLogs = [];
		}
		$scope.selectedVideo.videoLogs.push($scope.currentLog);		
		$('.actions li').removeClass('selected');
		$('#image').css('display','none');		 
		 sortTable();
		 $scope.syncVideoWidLog();
		 $scope.currentLog = new VideoLog();
		 
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
		if ($scope.selectedVideo.videoLogs != null) {				
			var logObj = $scope.selectedVideo.videoLogs[index];
			var action = actionsMap[logObj.action];
			if (action != null && action.style != null) {
				return action.style.backgroundColor;
			}
		}
		return "";
	}
	
	
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
		
		if($scope.selectedVideo.videoLogs.length > 0) {
			$('.logger-holder, section.left, #preview, #view-log, #submit-log').hide();
			$('section.right').css('width', '100%');
			$('#back-to-logger').show();
			$('th:nth-child(5), tr td:nth-child(5)', logTable).addClass('hide');
			$('th:last-child, tr td:last-child', logTable).addClass('hide');
			if (videoObj) {
				timeStore = videoObj.currentTime(); 
				videoObj.currentTime(0).play();
				$scope.syncVideoWidLog();
				$('#video-holder-div div').css("position","fixed");
				if(isVimeo || isYout){
					$('#'+$('#videoDivNorth').children()[$('#videoDivNorth').children().length-1].id).css("position","fixed");
				}
			}
		} else {
			alert("At least one action should be captured to preview the logged video.");
		}		
	}
	
	//Helper function to synchronize video with log record table
	$scope.syncVideoWidLog = function () {
		
		//$('#'+$('#videoDivNorth').children()[$('#videoDivNorth').children().length-1].id).html("");
		
		videoObj.highlightrow({
			start:1,
			end:10,
			index:0
		});
			
		angular.forEach($scope.selectedVideo.videoLogs, function(log, index) {
			var outTime = log.endTime;
			var inTime = log.startTime;
			videoObj.highlightrow({
				start:inTime,
				end:outTime,
			});	
			if(typeof log.trackId == 'undefined'){
				log.trackId = "";
			}else{
				videoObj.removeTrackEvent(log.trackId);
				log.trackId="";
			}
			if(log.trackId == ""){
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
			log.trackId = videoObj.getLastTrackEventId();
			}
		});	
		
		
	}
	
	$scope.backToLogger = function () {
		//videoObj.pause().currentTime(timeStore);
		$('.logger-holder, section.left, #preview, #view-log, #submit-log').show();
		//$('section.right').css('width', '85%');
		$('#back-to-logger').hide();
		$('th:last-child, tr td:last-child', logTable).removeClass('hide');
		$('th:nth-child(5), tr td:nth-child(5)', logTable).removeClass('hide');
		$('tbody tr', logTable).removeClass('row-highlight');
		
	}
	
	$scope.viewLog = function () {
		//View log button handler
		if($scope.selectedVideo) {
			$('#log-preview-popup .video-meta-data').html(JSON.stringify($scope.selectedVideo));
		} else {
			$('#log-preview-popup .video-meta-data').html("Video meta data unavailable");
		}
			
		if ($scope.selectedVideo.videoLogs.length > 0) {
				$('#log-preview-popup .clip-data').html(JSON.stringify($scope.selectedVideo.videoLogs));
		} else {
			$('#log-preview-popup .clip-data').html("Clip data unavailable");
		}
			
		if ($scope.selectedVideo.actions.length > 0) {
			$('#log-preview-popup .action-data').html(JSON.stringify($scope.selectedVideo.actions));
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

function sortTable(){
	logTable = $('#clip-logger');
	logTable.trigger("update"); 
     // set sorting column and direction, this will sort on the first and third column 
//     var sorting = [[2,1],[0,0]]; 
//     // sort on the first column 
//     logTable.trigger("sorton",[sorting]); 
	
	
	//Calling the table sorter plugin
   
}