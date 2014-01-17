myAppModule.controller('step2Controller', function($rootScope, $scope, sharedService, $location) {
	console.log("------ step2Controller ---------");
	$scope.actions = [];
	$scope.actionProfiles = actionProfiles;
	$scope.selectedProfile = null;
	$scope.customActions = 'custom-actions';
	
	$scope.addLogAction = function (action) {
		if (action.name != '') {
			var hasError = false;
			if (action.hotKeyChar != null && action.hotKeyChar != '') {
				action.keyCode = extractKeyCode(action.hotKeyChar.toUpperCase());
				if(action.keyCode != '') {
					if($.inArray(action.hotKeyChar.toUpperCase(), existingHotkeys) == -1) {
						existingHotkeys.push(action.hotKeyChar.toUpperCase());
					} else {
						hasError = true;
						alert("This hot key has already been used. Please choose another key for this action.");
					}
				}
			}
			if (!hasError) {
				$scope.actions.push(action);
				sharedService.setActions($scope.actions);
				$scope.action = {};
			}
		} else {
			alert("Please enter an action name");
		}
		$('#action-name').focus();
	}
	
	$scope.hasHotKey = function (action) {
		return (action.hotKeyChar != '' && action.hotKeyChar != null);
	}
	
	$scope.loadSavedProfile = function () {
		$scope.actions = [];
		if ($scope.selectedProfile != null && $scope.selectedProfile.actions != null) {			
			$scope.actions = $scope.selectedProfile.actions;			
		} else {
			alert("Please select a valid action profile");
		}
		sharedService.setActions($scope.actions);
	}
		
	$scope.showStep3 = function () {
		if($scope.actions.length == 0) {	
			if($scope.customActions === 'custom-actions') {
				alert("Please set up at least 1 custom action in Step 2 to proceed to next step");
			} else {
				alert("Please select from available action profile in Step 2 to proceed to next step");
			}
		} else {
			$.modal.close();
			goToNextPage('.step-3');
			highlightCurrentTab(2);
			$location.path("step3");
		}
	}
	
	$scope.resetActions = function () {
		$scope.actions = [];
		$('input[type="radio"]:checked').val();
		var actionType = $('input[name="action-rdo"]:checked').val();
		$scope.customActions = actionType;
		sharedService.setActions($scope.actions);
		sharedService.setActionType(actionType);
		toggleActions();
	}
	
	$scope.deleteAction = function(index) {
		if(confirm("This is the current selected action for clip logging. Are you sure to delete this action?")) {
			$scope.actions.splice(index, 1);
		}
	}
	
	function toggleActions () {
		if ($scope.customActions === 'popular-actions') {
			$('#actions-custom').slideUp(slideTime);
			$('#actions-popular').slideDown(slideTime);
		} else {
			$('#actions-custom').slideDown(slideTime);
			$('#actions-popular').slideUp(slideTime);
		}
	}
		
	$scope.init = function () {
		$scope.customActions = sharedService.getActionType();
		$scope.actions = sharedService.getActions();
		toggleActions();
		$('#basic-modal-content').modal({escClose :false});
	}
	
	$scope.init();
});