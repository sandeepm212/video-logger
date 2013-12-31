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
