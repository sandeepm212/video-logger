/**
 * 
 */

(function ( Popcorn ) {
  Popcorn.plugin( "footnoteAnimated", { 
  _setup: function( options ) {

    var target = document.getElementById( options.target );

    options._container = document.createElement( "div" );
    options._container.style.display = "none";
    options._container.innerHTML  = options.text;

    if ( !target && Popcorn.plugin.debug ) {
      throw new Error( "target container doesn't exist" );
    }
    target && target.appendChild( options._container );
  },

  start: function( event, options ){
    $( options._container ).fadeIn(); 
  },

  end: function( event, options ){
    $( options._container ).fadeOut(); 
  },
  _teardown: function( options ) {
    document.getElementById( options.target ) && document.getElementById( options.target ).removeChild( options._container );
  }
});

})( Popcorn );




(function ( Popcorn ) {
  Popcorn.plugin( "highlightrow", { 
  _setup: function( options ) {
   
  },

  start: function( event, options ){
    $( options._container ).fadeIn(); 
  },

  end: function( event, options ){
    $( options._container ).fadeOut(); 
  },
  _teardown: function( options ) {
   
  }
});

})( Popcorn );