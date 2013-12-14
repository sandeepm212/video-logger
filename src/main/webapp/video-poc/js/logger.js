function ngVideoLogInfo($scope) {
	$scope.name = "John Smith";
	$scope.videoLogs = [];	 
	
	$scope.deleteLog = function(logToRemove) {
		var index = this.videoLogs.indexOf(logToRemove);
		this.videoLogs.splice(index, 1);
	};
}

ngVideoLogInfo.prototype.addVideoLog = function(log) {
	this.videoLogs.push(log);
};

function addVideoLog () {
	
}
