$(document).ready(
		function() {
			$('#createLog').click(
					function() {
						loadVideo();	
					});
			$('.link').click(
					function() {
						$('#video-source').val($(this).children( "span:first").html());
					});
		});
$('#video-source').bind('input propertychange', function() {
	$('#create-log').show();
});

var popcorn, cuePoint;
function loadVideo () {
	var paused = true;
	var videoURL = $('#video-source').val();
	var type = checkUrl (videoURL);
	
	var id,
    parsedUri,
    xhrURL,
    videoElem;
	
	if ( type === "YouTube" ) {
		parsedUri = URI.parse( videoURL );
        // youtube id can either be a query under v, example:
        // http://www.youtube.com/watch?v=p_7Qi3mprKQ
        // Or at the end of the url like this:
        // http://youtu.be/p_7Qi3mprKQ
        id = parsedUri.queryKey.v || parsedUri.directory.replace( "/", "" );
        if ( !id ) {
          return;
        }

        xhrURL = "https://gdata.youtube.com/feeds/api/videos/" + id + "?v=2&alt=jsonc&callback=?";
        Popcorn.getJSONP( xhrURL, function( resp ) {
          var respData = resp.data,
              from = parsedUri.queryKey.t,
              popcorn,
              div = document.createElement( "div" ),
              source;

          div.style.height = "400px";
          div.style.width = "400px";
          div.style.left = "-400px";
          div.style.position = "absolute";

          document.body.appendChild( div );

          if ( resp.error ) {
            if ( resp.error.code === 403 ){
              return errorCallback( YOUTUBE_EMBED_PRIVATE );
            }
            errorCallback( YOUTUBE_EMBED_UNPLAYABLE );
          }

          if ( !respData ) {
            return;
          }

          if ( respData.accessControl.embed === "denied" ) {
            errorCallback( YOUTUBE_EMBED_DISABLED );
            return;
          }

          function errorEvent() {
            popcorn.off( "loadedmetadata", readyEvent );
            popcorn.off( "error", errorEvent );
            errorCallback( YOUTUBE_EMBED_UNPLAYABLE );
            popcorn.destroy();
          }

          function readyEvent() {
            popcorn.off( "loadedmetadata", readyEvent );
            popcorn.off( "error", errorEvent );
            document.body.removeChild( div );
            popcorn.destroy();

            successCallback({
              source: source,
              title: respData.title,
              type: type,
              thumbnail: respData.thumbnail.hqDefault,
              author: respData.uploader,
              duration: popcorn.duration(),
              from: from
            });
          }

          if ( from ) {
            from = from.replace( /(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/, function( all, hours, minutes, seconds ) {
              // Make sure we have real zeros
              hours = hours | 0; // bit-wise OR
              minutes = minutes | 0; // bit-wise OR
              seconds = seconds | 0; // bit-wise OR
              return ( +seconds + ( ( ( hours * 60 ) + minutes ) * 60 ) );
            });
          }

          source = "http://www.youtube.com/watch?v=" + id;
          popcorn = Popcorn.smart( div, source );
          popcorn.on( "error", errorEvent );
          if ( popcorn.media.readyState >= 1 ) {
            readyEvent();
          } else {
            popcorn.on( "loadedmetadata", readyEvent );
          }
        });
		popcorn = Popcorn.youtube('#video-container', videoURL);
	} else if ( type === "SoundCloud" ) {
		parsedUri = URI.parse( videoURL );
        var splitUriDirectory = parsedUri.directory.split( "/" );
        id = splitUriDirectory[ splitUriDirectory.length - 1 ];
        var userId = splitUriDirectory[ splitUriDirectory.length - 2 ];
        xhrURL = "https://api.soundcloud.com/tracks/" + id + ".json?callback=?&client_id=PRaNFlda6Bhf5utPjUsptg&user_id=" + userId;
        Popcorn.getJSONP( xhrURL, function( respData ) {
          if ( !respData ) {
            return;
          }

          if ( respData.sharing === "private" || respData.embeddable_by === "none" ) {
            //errorCallback( SOUNDCLOUD_EMBED_DISABLED );
            return;
          }
          //alert(respData.title);
          popcorn = Popcorn.soundcloud( "video-container", videoURL);
          //popcorn = Popcorn.soundcloud( "video-container", "http://soundcloud.com/lilleput/popcorn" );
          //popcorn = Popcorn.soundcloud( "media_1", "http://soundcloud.com/rhymesayers/brother-ali-us" );
//            source: videoURL,
//            type: type,
//            thumbnail: respData.artwork_url || "../../resources/icons/soundcloud-small.png",
//            duration: respData.duration / 1000,
//            title: respData.title,
//            hidden: true
          
        });
        
		
	} else if ( type === "Vimeo" ) {
		parsedUri = URI.parse( videoURL );
        var splitUriDirectory = parsedUri.directory.split( "/" );
        id = splitUriDirectory[ splitUriDirectory.length - 1 ];
        xhrURL = "https://vimeo.com/api/v2/video/" + id + ".json?callback=?";
        Popcorn.getJSONP( xhrURL, function( respData ) {
          respData = respData && respData[ 0 ];
          if ( !respData ) {
            return;
          }
          popcorn = Popcorn.vimeo( "#video-container", videoURL)
          
//            source: videoURL,
//            type: type,
//            thumbnail: respData.thumbnail_small,
//            duration: respData.duration,
//            title: respData.title
          
        });
		
	} else if ( type === "Archive" ) {
        
	} else if ( type === "HTML5" ) {
		
	} else if ( type === "null" ) {
		
	}
	
}


function logVideo () {
	
}


function videoLogForm($scope) {
    $scope.video = {
    		logs: []
    };

    $scope.types = [{key:"", value:"-- Select One --"},
                    {key:"Text", value:"Text"},
                    {key:"Image", value:"Image"}];
    

    $scope.addItem = function() {
    	if (popcorn != null) {
    		var currentTime = popcorn.currentTime();
    		$scope.video.logs.push({
                startTime: currentTime,
                endTime: currentTime + 5
            });
    	} else {
    		alert('Please load Video');
    	}
    },

    $scope.removeItem = function(index) {
        $scope.video.logs.splice(index, 1);
    }
    
    $scope.logElementType = function() {
        alert("----");
    }
}