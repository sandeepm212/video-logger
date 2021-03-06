/* This Source Code Form is subject to the terms of the MIT license
 * If a copy of the MIT license was not distributed with this file, you can
 * obtain one at https://raw.github.com/mozilla/butter/master/LICENSE */

function mediaTypes() {
  var URI = new uri();
  var REGEX_MAP = {
        YouTube: /(?:https?:\/\/www\.|https?:\/\/|www\.|\.|^)youtu/,
        Vimeo: /https?:\/\/(www\.)?vimeo.com\/(\d+)($|\/)/,
        SoundCloud: /(?:https?:\/\/www\.|https?:\/\/|www\.|\.|^)(soundcloud)/,
        Archive: /(?:https?:\/\/www\.|https?:\/\/|www\.|\.|^)archive\.org\/(details|download|stream)\/((.*)start(\/|=)[\d\.]+(.*)end(\/|=)[\d\.]+)?/,
        // supports #t=<start>,<duration>
        // where start or duration can be: X, X.X or XX:XX
        "null": /^\s*#t=(?:\d*(?:(?:\.|\:)?\d+)?),?(\d+(?:(?:\.|\:)\d+)?)\s*$/,
        Flickr: /https?:\/\/(www\.)flickr.com/
      },
      YOUTUBE_EMBED_DISABLED = "Embedding of this YouTube video is disabled",
      YOUTUBE_EMBED_UNPLAYABLE = "This YouTube video is unplayable",
      YOUTUBE_EMBED_PRIVATE = "Private Video",
      ARCHIVE_EMBED_DISABLED = "Embedding of this Archive item is not available yet",
      EMBED_UNPLAYABLE = "This media source is unplayable",
      SOUNDCLOUD_EMBED_DISABLED = "Embedding of this SoundCloud audio source is disabled";

  function jwPlayerFallback( options, successCallback, errorCallback ) {
    // We hit an error trying to load HTML5, try the jwplayer instead
    var media,
        div = document.createElement( "div" ),
        container = document.createElement( "div" );

    div.style.height = "400px";
    div.style.width = "400px";
    div.style.left = "-400px";
    div.style.position = "absolute";
    container.style.height = "100%";
    container.style.width = "100%";

    document.body.appendChild( div );
    div.appendChild( container );

    function errorEvent() {
      media.removeEventListener( "loadedmetadata", readyEvent, false );
      media.removeEventListener( "error", errorEvent, false );
      errorCallback( EMBED_UNPLAYABLE );
      document.body.removeChild( div );
    }

    function readyEvent() {
      media.removeEventListener( "loadedmetadata", readyEvent, false );
      media.removeEventListener( "error", errorEvent, false );
      document.body.removeChild( div );
      successCallback({
        url: options.source,
        title: options.title || options.source,
        sourceType: options.type,
        thumbnailUrl: options.thumbnail || "",
        linkback: options.linkback,
        duration: media.duration
      });
    }
    container.id = Popcorn.guid( "popcorn-jwplayer-" );
    media = Popcorn.HTMLJWPlayerVideoElement( container );
    media.addEventListener( "error", errorEvent, false );
    media.addEventListener( "loadedmetadata", readyEvent, false );
    media.src = options.source;
  }

  return {
    checkUrl: function( url ) {
      for ( var type in REGEX_MAP ) {
        if ( REGEX_MAP.hasOwnProperty( type ) ) {
          if ( REGEX_MAP[ type ].test( url ) ) {
            return type;
          }
        }
      }
      return "HTML5";
    },
    getMetaData: function( baseUrl, successCallback, errorCallback ) {
      var id,
          userId,
          parsedUri,
          splitUriDirectory,
          xhrURL,
          type = this.checkUrl( baseUrl ),
          videoElem;

      successCallback = successCallback || function(){};
      errorCallback = errorCallback || function(){};

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
              source;
          
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
            errorCallback( YOUTUBE_EMBED_UNPLAYABLE );
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
          successCallback({
        	  url: source,
              title: respData.title,
              sourceType: type,
              thumbnailUrl: respData.thumbnail.hqDefault,
              author: respData.uploader,
              duration: respData.duration,
              from: from
          });
        });
      } else if ( type === "SoundCloud" ) {
        parsedUri = URI.parse( baseUrl );
        splitUriDirectory = parsedUri.directory.split( "/" );
        id = splitUriDirectory[ splitUriDirectory.length - 1 ];
        userId = splitUriDirectory[ splitUriDirectory.length - 2 ];
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
        	  url: baseUrl,
            sourceType: type,
            thumbnailUrl: respData.artwork_url || "../../resources/icons/soundcloud-small.png",
            duration: respData.duration / 1000,
            title: respData.title,
            hidden: true
          });
        });
      } else if ( type === "Vimeo" ) {
        parsedUri = URI.parse( baseUrl );
        splitUriDirectory = parsedUri.directory.split( "/" );
        id = splitUriDirectory[ splitUriDirectory.length - 1 ];
        xhrURL = "https://vimeo.com/api/v2/video/" + id + ".json?callback=?";
        Popcorn.getJSONP( xhrURL, function( respData ) {
          respData = respData && respData[ 0 ];
          if ( !respData ) {
            return;
          }
          successCallback({
        	  url: baseUrl,
            sourceType: type,
            thumbnailUrl: respData.thumbnail_small,
            duration: respData.duration,
            title: respData.title
          });
        });
      } else if ( type === "Archive" ) {
        // We don't accept direct MP4/OGV links to videos since Archive.org doesn't want to directly
        // expose the main video's. Until noted, keep it this way and don't change this.
        // Basically always check that any valid types are not included so we can continue to
        // prevent direct video links being pasted in and attributed as HTML5 video.
        if ( baseUrl.indexOf( "details" ) === -1 && baseUrl.indexOf( "stream" ) === -1 ) {
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
            		url: respData.media,
              sourceType: type,
              title: respData.title,
              thumbnailUrl: respData.thumb,
              linkback: respData.linkback
            };
            jwPlayerFallback( options, successCallback, errorCallback );
          }, false );
          videoElem.addEventListener( "loadedmetadata", function() {
            successCallback({
            	url: respData.media,
              sourceType: type,
              title: respData.title,
              thumbnailUrl: respData.thumb,
              linkback: respData.linkback,
              duration: videoElem.duration
            });
          }, false );
          videoElem.src = URI.makeUnique( respData.media ).toString();
        });
      } else if ( type === "null" ) {
        successCallback({
        	url: baseUrl,
          sourceType: type,
          title: baseUrl,
          duration: +REGEX_MAP[ "null" ].exec( baseUrl )[ 1 ]
        });
      } else if ( type === "HTML5" ) {
        videoElem = document.createElement( "video" );
        videoElem.addEventListener( "loadedmetadata", function() {
          successCallback ({
        	  url: baseUrl,
            sourceType: type,
            title: baseUrl.substring( baseUrl.lastIndexOf( "/" ) + 1 ),
            thumbnailUrl: URI.makeUnique( baseUrl ).toString(),
            duration: videoElem.duration
          });
        }, false );
        videoElem.addEventListener( "error", function() {
          var options = {
        		  url: baseUrl,
            sourceType: type,
            title: baseUrl
          };
          jwPlayerFallback( options, successCallback, errorCallback );
        }, false );
        videoElem.src = URI.makeUnique( baseUrl ).toString();
      }
    }
  };
}
