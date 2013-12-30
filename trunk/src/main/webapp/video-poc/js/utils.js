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

//helper function to extract hot key code of a corresponding action
function extractKeyCode(keyVal) {
	return (keyVal != '' && allowedKeysRegex.test(keyVal)) ? keyVal.charCodeAt(0) : '';
}

var REGEX_MAP = {
	YouTube : /(?:https?:\/\/www\.|https?:\/\/|www\.|\.|^)youtu/,
	Vimeo : /https?:\/\/(www\.)?vimeo.com\/(\d+)($|\/)/,
	SoundCloud : /(?:https?:\/\/www\.|https?:\/\/|www\.|\.|^)(soundcloud)/,
	Archive : /(?:https?:\/\/www\.|https?:\/\/|www\.|\.|^)archive\.org\/(details|download)\/((.*)start(\/|=)[\d\.]+(.*)end(\/|=)[\d\.]+)?/,
	// supports #t=<start>,<duration>
	// where start or duration can be: X, X.X or XX:XX
	"null" : /^\s*#t=(?:\d*(?:(?:\.|\:)?\d+)?),?(\d+(?:(?:\.|\:)\d+)?)\s*$/,
	Flickr : /https?:\/\/(www\.)flickr.com/
};

function checkUrl(url) {
	for ( var type in REGEX_MAP) {
		if (REGEX_MAP.hasOwnProperty(type)) {
			if (REGEX_MAP[type].test(url)) {
				return type;
			}
		}
	}
	return "HTML5";
}

var URI = {
	    // Allow overriding the initial seed (mostly for testing).
	    set seed( value ){
	      seed = value|0;
	    },
	    get seed(){
	      return seed;
	    },

	    // Parse a string into a URI object.
	    parse: function( uriString ){
	      var uri = parseUri( uriString );
	      uri.toString = function(){
	        return uriToString( this );
	      };
	      return uri;
	    },

	    // Make a URI object (or URI string, turned into a URI object) unique.
	    // This will turn http://foo.com into http://foo.com?<UID_KEY_NAME>=<seed number++>.
	    makeUnique: function( uriObject ){
	      if( typeof uriObject === "string" ){
	        uriObject = this.parse( uriObject );
	      }

	      var queryKey = uriObject.queryKey;
	      queryKey[ UID_KEY_NAME ] = seed++;
	      return updateQuery( uriObject );
	    },

	    // Remove the butteruid unique identifier from a URL, that is, undo makeUnique
	    stripUnique: function( uriObject ) {
	      if( typeof uriObject === "string" ){
	        uriObject = this.parse( uriObject );
	      }

	      var queryKey = uriObject.queryKey;
	      if( queryKey ) {
	        delete queryKey[ UID_KEY_NAME ];
	      }
	      return updateQuery( uriObject );
	    }
	  };