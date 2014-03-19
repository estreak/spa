/*
 * spa.chat.js
 * chat module
 */

///////////////// JSLINT
/*jslint browser : true, continue : true,
  devel : true, indent : 2, maxerr : 50,
  newcap : true, nomen : true, plusplus : true,
  regexp : true, sloppy : true, vars : false,
  white : true
 */
/*global $, spa:true, getComputedStyle */

///////////////// MODULE SPA.CHAT
spa.chat= (function () {

  var configMap = {
      main_html : String()
      + '<div class="spa-chat">'
      + '<div class="spa-chat-head">'
      + '<div class="spa-chat-head-toggle">+</div>'
      + '<div class="spa-chat-head-title">'
      + 'Chat'
      + '</div>'
      + '</div>'
      + '<div class="spa-chat-closer">x</div>'
      + '<div class="spa-chat-sizer">'
      + '<div class="spa-chat-msgs"></div>'
      + '<div class="spa-chat-box">'
        + '<input type="text"/>'
        + '<div>send</div>'
      + '</div>'
      + '</div>'
      + '</div>',

      // defines the allowable setters (for util.setConfigMap)
      settable_map : {
        set_chat_anchor : true,
        chat_model : true
      },

      slider_open_time : 250,
      slider_close_time : 250,
      slider_opened_em : 18,
      slider_closed_em : 2,
      slider_opened_min_em : 10,
      window_height_min_em : 20,
      slider_opened_title : 'Click to close',
      slider_closed_title : 'Click to open',

      chat_model : null,
      set_chat_anchor : null,
    },
    stateMap = {
      $container : null,
      position_type : 'closed',
    },
    jqueryMap = {},
    setJqueryMap,

    // local
    onClickToggle,
    getEmSize,
    setPxSizes,

    // external
    setSliderPosition,
    removeSlider,
    setAnchor,

    // module boiler plate
    handleResize,
    configModule,
    initModule
  ;
  //////////// UTILS
  //
  getEmSize = function ( elem ) {
    //
    // converts the 'em' display unit to pixels so can use JQuery measurements
    //
    return Number(
        getComputedStyle( elem, '' ).fontSize.match(/\d*\.?\d*/)[0]
        );
  };

  //////////// DOM
  //

  setJqueryMap = function (){
    var $container = stateMap.$container,
        $slider = $container.find('.spa-chat');

    jqueryMap = {
      $slider : $slider,
      $head : $slider.find( '.spa-chat-head' ),
      $toggle : $slider.find( '.spa-chat-head-toggle' ),
      $title : $slider.find( '.spa-chat-head-title' ),
      $sizer : $slider.find( '.spa-chat-sizer' ),
      $msgs : $slider.find( '.spa-chat-msgs' ),
      $box : $slider.find( '.spa-chat-box' ),
      $input : $slider.find( '.spa-chat-input input[type=text]')
    };
  };

  setSliderPosition = function (position_type, callback){
    var
      height_px, animate_time, slider_title, toggle_text;

    if ( stateMap.position_type === position_type ){
      return true;
    }
    switch ( position_type ){
      case 'opened' :
        height_px = stateMap.slider_opened_px;
        animate_time = configMap.slider_open_time;
        slider_title = configMap.slider_opened_title;
        toggle_text = '=';
        break;
      case 'hidden' :
        height_px = 0;
        animate_time = configMap.slider_open_time;
        slider_title = '';
        toggle_text = '+';
        break;
      case 'closed' :
        height_px = stateMap.slider_closed_px;
        animate_time = configMap.slider_close_time;
        slider_title = configMap.slider_closed_title;
        toggle_text = '+';
        break;
      default : return false; // bail if unknown position
    }
    stateMap.position_type = '';
    jqueryMap.$slider.animate(
      { height : height_px },
      animate_time,
      function () {
          jqueryMap.$toggle.prop( 'title', slider_title );
          jqueryMap.$toggle.text( toggle_text );
          stateMap.position_type = position_type;
          if ( callback ) { callback( jqueryMap.$slider ); }
      }
    );
    return true;
  };

  setPxSizes = function () {
    //
    // calcs the pixel sizes for elements in this module
    //
    var px_per_em, window_height_em;

    px_per_em = getEmSize( jqueryMap.$slider.get(0) );

    window_height_em = Math.floor(
        ($(window).height() / px_per_em) + 0.5
    );

    // set the height of chat based on window min size
    configMap.slider_opened_em
      = window_height_em > configMap.window_height_min_em
      ? configMap.slider_opened_em
      : configMap.slider_opened_min_em;
    console.log("slider height = %d", configMap.slider_opened_em);

    stateMap.px_per_em = px_per_em;
    stateMap.slider_closed_px = configMap.slider_closed_em * px_per_em;
    stateMap.slider_opened_px = configMap.slider_opened_em * px_per_em;
    jqueryMap.$sizer.css({
      height : ( configMap.slider_opened_em - 2 ) * px_per_em
    });
  };

  removeSlider = function (){
    //
    // Kill the slider from DOM and revert to initial state
    //
    if (jqueryMap.$slider) {
      jqueryMap.$slider.remove();
      jqueryMap = {};
    }
    stateMap.$container = null;
    stateMap.position_type = 'closed';

    configMap.chat_model = null;
    configMap.set_chat_anchor = null;

    return true;
  };

  handleResize = function (){
    //
    // on window resize, adjust based on current window height
    //
    if ( ! jqueryMap.$slider ) { return false; }
    setPxSizes();
    if ( stateMap.position_type === 'opened' ){
      jqueryMap.$slider.css({ height : stateMap.slider_opened_px });
    }
    return true;
  };


  //////////// EVENT
  //
  onClickToggle = function (/*event*/){
    if (stateMap.position_type === 'opened') {
      configMap.set_chat_anchor('closed');
    }
    else if (stateMap.position_type === 'closed'){
      configMap.set_chat_anchor('opened');
    }
    return false;
  };

  setAnchor = function (anchor_map_previous, anchor_map_proposed,
      set_uri_func){
    var is_ok;

    if (!anchor_map_previous ||
        anchor_map_previous._s_chat !== anchor_map_proposed._s_chat
    ) {
      switch (anchor_map_proposed.chat) {
        case 'opened':
        case 'closed':
          is_ok = setSliderPosition(anchor_map_proposed.chat);
          break;
        default:
          setSliderPosition('closed');
          delete anchor_map_proposed.chat;
          set_uri_func(anchor_map_proposed);
      }
    }
    if ( ! is_ok ){
      if ( anchor_map_previous ){
        set_uri_func(anchor_map_previous);
      } else {
        delete anchor_map_proposed.chat;
        set_uri_func(anchor_map_proposed);
      }
    }
  };


  //////////// MODULE
  //

  configModule = function (input_map) {
    //
    // all external config occurs thru here
    //
    spa.util.setConfigMap({
      input_map : input_map,
      settable_map : configMap.settable_map,
      config_map : configMap
    });
    return true;
  };

  initModule = function ( $container ) {
    //
    // init all functionality and append to the given container
    //
    $container.append( configMap.main_html );
    stateMap.$container = $container;
    setJqueryMap();
    setPxSizes();

    jqueryMap.$toggle.prop('title', configMap.slider_closed_title);
    jqueryMap.$head.click(onClickToggle);

    return true;
  };

  //////////// API
  //
  return {
    setSliderPosition : setSliderPosition,
    removeSlider : removeSlider,
    handleResize : handleResize,
    setAnchor : setAnchor,
    configModule : configModule,
    initModule : initModule
  };

}());
