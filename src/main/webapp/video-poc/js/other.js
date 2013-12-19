$scope.safeApply = function(fn) {
		  var phase = this.$root.$$phase;
		  if(phase == '$apply' || phase == '$digest') {
		    if(fn && (typeof(fn) === 'function')) {
		      fn();
		    }
		  } else {
		    this.$apply(fn);
		  }
	};
	
	// Sample data format
	var videoLogObject = [
	    {
	        "id": 6,
	        "videoLogs": [
	            {
	                "action": "Boundary",
	                "startTime": "00:00:03.04",
	                "endTime": "00:00:13.06",
	                "eventType": "Subtitle"
	            },
	            {
	                "action": "Out",
	                "startTime": "00:00:21.14",
	                "endTime": "00:00:21.13",
	                "eventType": "Pop"
	            }
	        ],
	        "actions": [
	            {
	                "name": "Over boundary",
	                "shortCutKey": "6",
	                "description": "",
	                "style": {
	                    "backgroundColor": "",
	                    "fontColor": "",
	                    "fontStyle": "",
	                    "fontWeight": "",
	                    "fontSize": ""
	                }
	            }
	        ]
	    }
	];	