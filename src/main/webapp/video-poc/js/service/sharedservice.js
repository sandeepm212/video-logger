myAppModule.service('sharedService', function ($http) {
	
	var actions = [];    
    var video = null;
    var videoType = VIDEO_TYPE_WEB;
    var actionType = null;
    this.addAction = function (action) {
		actions.push(action);
	};
    this.getActions = function () {
    	if (this.actions == null) {
    		this.actions = [];
    	}
        return this.actions;
    };
    this.setActions = function(actions) {
    	if (this.video != null) {
    		this.video.actions = actions;
    	}
        this.actions = actions;
    };
    
    this.setVideo = function(video) {
    	this.video = video;
    	if (video != null) {
    		if (video.videoType == VIDEO_TYPE_LOCAL) {
        		this.video.thumbnailUrl = "../images/slider.png"; //videoPath;
        	}
    		this.setActions(video.actions);
    	}
    	
    };
    
    this.getVideo = function () {
        return this.video;
    };
    
    this.setVideoType = function(videoType) {
    	if (this.video != null) {
    		this.video.videoType = videoType;
    	}
        this.videoType = videoType;
    };
    
    this.getVideoType = function () {
        return this.videoType;
    };
    
    this.setActionType = function (aType) {
    	this.actionType = aType;
    }
    
    this.getActionType = function () {
    	if (this.actionType == null) {
    		this.actionType = 'custom-actions';
    	}
    	return this.actionType;
    }
    
    this.getSavedData = function () {
    	var promise = $http({method: 'GET', url: '/video-logger/getVideoLog'}).
				  	  	success(function(data, status, headers, config) {
				  		  if (data != null) {
				  			  angular.forEach(data, function(video) {
			  				  if (video.sourceType != null) {
			  					  video.mediaIcon = video.sourceType.toLowerCase() +  "-icon";
			  				  }
				  			  exisitngDataMap[video.projectName] = video;
				  			  });
				  			  //console.log(exisitngDataMap);
				  		  	}
				  		  	return data;
				  	  		}).
				  	  error(function(data, status, headers, config) {
				  		  	
				  	  });
        return promise; 
    };    
});