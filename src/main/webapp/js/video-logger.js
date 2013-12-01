$(document).ready(
		function() {
			$('#createLog').click(
					function() {
						createVideoLog();	
					});
		});
$('#video-source').bind('input propertychange', function() {
	$('#create-log').show();
});


function createVideoLog () {
	var paused = true, popcorn;
	var videoURL = $('#video-source').val();
	var type = checkUrl (videoURL);
	alert("TYPE:: " + type);
	
	var id,
    parsedUri,
    xhrURL,
    type = this.checkUrl( baseUrl ),
    videoElem;
	
	if ( type === "YouTube" ) {
		parsedUri = URI.parse( baseUrl );
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
		parsedUri = URI.parse( baseUrl );
        var splitUriDirectory = parsedUri.directory.split( "/" );
        id = splitUriDirectory[ splitUriDirectory.length - 1 ];
        var userId = splitUriDirectory[ splitUriDirectory.length - 2 ];
        xhrURL = "https://api.soundcloud.com/tracks/" + id + ".json?callback=?&client_id=PRaNFlda6Bhf5utPjUsptg&user_id=" + userId;
        Popcorn.getJSONP( xhrURL, function( respData ) {
          if ( !respData ) {
            return;
          }

          if ( respData.sharing === "private" || respData.embeddable_by === "none" ) {
            errorCallback( SOUNDCLOUD_EMBED_DISABLED );
            return;
          }
          successCallback({
            source: baseUrl,
            type: type,
            thumbnail: respData.artwork_url || "../../resources/icons/soundcloud-small.png",
            duration: respData.duration / 1000,
            title: respData.title,
            hidden: true
          });
        });
        
		popcorn = Popcorn.soundcloud( "#video-container", videoURL);
	} else if ( type === "Vimeo" ) {
		parsedUri = URI.parse( baseUrl );
        var splitUriDirectory = parsedUri.directory.split( "/" );
        id = splitUriDirectory[ splitUriDirectory.length - 1 ];
        xhrURL = "https://vimeo.com/api/v2/video/" + id + ".json?callback=?";
        Popcorn.getJSONP( xhrURL, function( respData ) {
          respData = respData && respData[ 0 ];
          if ( !respData ) {
            return;
          }
          successCallback({
            source: baseUrl,
            type: type,
            thumbnail: respData.thumbnail_small,
            duration: respData.duration,
            title: respData.title
          });
        });
		
		
		popcorn = Popcorn.vimeo( "#video-container", videoURL)
	} else if ( type === "Archive" ) {
        // We don't accept direct MP4/OGV links to videos since Archive.org doesn't want to directly
        // expose the main video's. Until noted, keep it this way and don't change this.
        if ( baseUrl.indexOf( "details" ) === -1 ) {
          return errorCallback( ARCHIVE_EMBED_DISABLED );
        }

        xhrURL = "https://archive.org/services/maker.php?callback=caller&url=" + encodeURIComponent( baseUrl );

        Popcorn.getJSONP( xhrURL, function( respData ) {

          if ( !respData || respData.error || !respData.title || !respData.duration ) {
            return errorCallback( ARCHIVE_EMBED_DISABLED );
          }

          videoElem = document.createElement( "video" );
          videoElem.addEventListener( "error", function() {
            var options = {
              source: respData.media,
              type: type,
              title: respData.title,
              thumbnail: respData.thumb,
              linkback: respData.linkback
            };
            jwPlayerFallback( options, successCallback, errorCallback );
          }, false );
          videoElem.addEventListener( "loadedmetadata", function() {
            successCallback({
              source: respData.media,
              type: type,
              title: respData.title,
              thumbnail: respData.thumb,
              linkback: respData.linkback,
              duration: videoElem.duration
            });
          }, false );
          videoElem.src = URI.makeUnique( respData.media ).toString();
        });
	} else if ( type === "HTML5" ) {
		
	} else if ( type === "null" ) {
		
	}
	
	
	
}
