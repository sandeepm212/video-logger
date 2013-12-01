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