$(document).ready(function(e) {
	triggerTooltip();	
});

//global variable for showing tooltip
var tooltip,
    screenHeight = $(window).height(),
    screenWidth = $(window).width(),
    xOffset = 15,
    yOffset = 15,
    fadeTime = 200;

//helper function to bind the events related to tooltip
function triggerTooltip()
{
	$('.tip-trigger').each(function(){ 
        if($(this).next().hasClass('tooltip-content')){
            $(this).mouseenter(function(evt){
            if ( $(".tooltip").size() == 0 ) {
                tooltip = $('<div class="tooltip" />'),
                tooltipContent = $(this).next('.tooltip-content').clone().removeClass('hide');
            }
            
            tooltip.append(tooltipContent);
            appendTooltip($(this), evt);
            })
            .mousemove(function(evt){
                positionTooltip($(this), evt);
            })
            .mouseleave(function(){
                hideTooltip($(this));
            });
        }
        else {
           return;
        }
     });
}

//append tooltip dynamically to document body
function appendTooltip(triggerObj, hoverEvent){
	if(tooltip){
       tooltip.prependTo('body');
       positionTooltip(triggerObj, hoverEvent);
    } else {
       return;
    }
}

//display tooltip after positioning it
function displayTooltip(){
    if(tooltip){
       tooltip.fadeIn(fadeTime);
    }
    else{
       return;
    }
}

//hide the tooltip on mouseleave
function hideTooltip(triggerObj){
    if(tooltip){
        tooltip.fadeOut(fadeTime).remove();
    }
    else {
       return;
    }
}

//position the tooltip according to cursor position
function positionTooltip(triggerObj, hoverEvent){
    var scrollLeft = $(window).scrollLeft(),
    scrollTop = $(window).scrollTop(),
    cursorX = hoverEvent.pageX,
    cursorY = hoverEvent.pageY,
    tipWidth = $('.tooltip').outerWidth(),
    tipHeight = $('.tooltip').outerHeight();
    
    if((cursorY - scrollTop + tipHeight + yOffset) >= screenHeight){
		$('.tooltip').css('top', cursorY - tipHeight);
    }
    else{
		$('.tooltip').css('top', cursorY + yOffset);
    }
    if((cursorX - scrollLeft + tipWidth + xOffset) >= screenWidth){
		$('.tooltip').css('left', cursorX - tipWidth);
    }
    else{
		$('.tooltip').css('left', cursorX + xOffset);
    }
    
    displayTooltip();
}
