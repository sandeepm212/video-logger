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