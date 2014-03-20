/*
 * sp.shell.js
 * Shell module for SPA
 */

///////////////// JSLINT
/*jslint browser : true, continue : true,
  devel : true, indent : 2, maxerr : 50,
  newcap : true, nomen : true, plusplus : true,
  regexp : true, sloppy : true, vars : false,
  white : true
 */
/*global $, spa:true */

///////////////// MODULE SPA.SHELL
spa.shell = (function () {
  var configMap = {
    main_html : String()
      + '<div class="spa-shell-head">'
        + '<div class="spa-shell-head-logo"></div>'
        + '<div class="spa-shell-head-acct"></div>'
        + '<div class="spa-shell-head-search"></div>'
      + '</div>'
      + '<div class="spa-shell-main">'
        + '<div class="spa-shell-main-nav"></div>'
        + '<div class="spa-shell-main-content"></div>'
      + '</div>'
      + '<div class="spa-shell-foot"></div>'
      + '<div class="spa-shell-modal"></div>',

      chat_extend_time    : 1000,
      chat_retract_time   : 300,
      chat_extend_height  : 450,
      chat_retract_height : 15,
      chat_extended_title : 'click to retract',
      chat_retracted_title : 'click to extend',

      anchor_schema_map : {
        chat : { opened : true, closed : true }
      },

      resize_interval : 200,  // interval to consider resize events

    },
    stateMap = {
      $container        : null,
      is_chat_retracted : true,
      anchor_map        : {},
      resize_timeout_id : undefined,
    },
    jqueryMap = {},
    setJqueryMap,

    onHashChange,
    copyAnchorMap,
    changeAnchorPart,
    setChatAnchor,

    onResize,
    initModule
  ; // end configMap

  //////////// UTILS
  //
  copyAnchorMap = function () {
    //
    // returns a copy of stored anchor map (use jquery helper)
    //
    return $.extend( true, {}, stateMap.anchor_map);
  };


  //////////// DOM
  //

  setJqueryMap = function () {
    //
    // cache of jquery related objects
    //
    var $container = stateMap.$container;
    jqueryMap = {
      $container : $container,
    };
  };

  changeAnchorPart = function (arg_map) {
    //
    // (attempts to) update the anchor map and change the URI.
    // note: keys are dependent and independent encoded by AnchorURI
    //
    var
      anchor_map_revise = copyAnchorMap(),
      bool_return = true,
      key_name, key_name_dep;

    // Merge changes into anchor map
    KEYVAL:
    for (key_name in arg_map) {
      if (arg_map.hasOwnProperty(key_name)) {
        // skip dependent keys during iteration
        if (key_name.indexOf('_') === 0) { continue KEYVAL; }

        // update independent key value
        anchor_map_revise[key_name] = arg_map[key_name];

        // update matching dependent key
        key_name_dep = '_' + key_name;
        if (arg_map[key_name_dep]) {
          anchor_map_revise[key_name_dep] = arg_map[key_name_dep];
        } else {
          delete anchor_map_revise[key_name_dep];
          delete anchor_map_revise['_s' + key_name_dep];
        }
      }
    }
    // Attempt to update URI (revert if unsuccessful)
    try {
      $.uriAnchor.setAnchor(anchor_map_revise);
    } catch (error) {
      $.uriAnchor.setAnchor(stateMap.anchor_map, null, true);
      bool_return = false;
    }

    return bool_return;
  };

  /////////// EVENT HNDLRS
  //

  onHashChange = function (/*event*/) {
    //
    // compare proposed state change with current and
    // adjust only necessary components that differ
    //
    var
      anchor_map_previous = copyAnchorMap(),
      anchor_map_proposed
    ;

    // attempt to parse anchor
    try {
      anchor_map_proposed = $.uriAnchor.makeAnchorMap();
    } catch (error) {
      $.uriAnchor.setAnchor(anchor_map_previous, null, true);
      return false;
    }

    // call each module to deal with its anchor
    spa.chat.parseAnchor(anchor_map_previous, anchor_map_proposed,
        function(anchor_map) {
          $.uriAnchor.setAnchor(anchor_map, null, true);
          stateMap.anchor_map = anchor_map;
        }
    );
    return false;

  };


  onResize = function (){
    // 
    // call each feature module to resize (if timer has expired)
    //
    if (stateMap.resize_timeout_id) { return true; }

    spa.chat.handleResize();
    stateMap.resize_timeout_id = setTimeout(
        function (){ stateMap.resize_timeout_id = undefined; },
        configMap.resize_interval
    );
    return true;
  };

  /////////// CALLBACKS
  //
  setChatAnchor = function(position_type){
    //
    // called by the chat module to set the anchor
    //
    return changeAnchorPart({ chat : position_type });
  };


  /////////// PUBLIC
  //
  initModule = function ($container) {
    stateMap.$container = $container;
    $container.html(configMap.main_html);
    setJqueryMap();

    // init and bind chat slider
    stateMap.is_chat_retracted = true;

    // setup a schema to test anchors against
    $.uriAnchor.configModule(
        { schema_map : configMap.anchor_schema_map }
    );

    // load the feature modules
    spa.chat.configModule({
      set_chat_anchor : setChatAnchor,
      chat_model      : spa.model.chat,
    });
    spa.chat.initModule(jqueryMap.$container);

    // setup URI change events _after_ all feature modules
    // this triggers the hashchange event so the module considers
    // the bookmark on initial load
    $(window)
      .bind('hashchange', onHashChange)
      .bind('resize', onResize)
      .trigger('hashchange');

    //
    // test
    //
    //setTimeout(function () { toggleChat(true);},  3000 );
    //setTimeout(function () { toggleChat(false);}, 8000 );

  };

  return { initModule : initModule };
}());
