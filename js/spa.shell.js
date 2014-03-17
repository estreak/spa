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
      + '<div class="spa-shell-chat"></div>'
      + '<div class="spa-shell-modal"></div>',

      chat_extend_time    : 1000,
      chat_retract_time   : 300,
      chat_extend_height  : 450,
      chat_retract_height : 15,
      chat_extended_title : 'click to retract',
      chat_retracted_title : 'click to extend',

      anchor_schema_map : {
        chat : { open : true, closed : true }
      },

    },
    stateMap = {
      $container        : null,
      is_chat_retracted : true,
      anchor_map        : {},
    },
    jqueryMap = {},
    setJqueryMap,
    onHashChange,
    copyAnchorMap, changeAnchorPart,
    toggleChat, onClickChat,
    initModule;

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
        $chat : $container.find('.spa-shell-chat'),
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

    toggleChat = function (do_extend, callback) {
      //
      // extend or retracts the chat slider
      //
      var
        px_chat_ht = jqueryMap.$chat.height(),
        is_open    = px_chat_ht === configMap.chat_extend_height,
        is_closed  = px_chat_ht === configMap.chat_retract_height,
        is_sliding = !is_open && !is_closed;

      if (is_sliding) { return false; } // avoid race condition

      if (do_extend) {
        jqueryMap.$chat.animate(
          { height : configMap.chat_extend_height },
          configMap.chat_extend_time,
          function () {
            jqueryMap.$chat.attr(
              'title', configMap.chat_extended_title
            );
            stateMap.is_chat_retracted = false;
            if (callback) { callback(jqueryMap.$chat); }
          }
        );
      } else {
        jqueryMap.$chat.animate(
          { height : configMap.chat_retract_height },
          configMap.chat_retract_time,
          function () {
            jqueryMap.$chat.attr(
              'title', configMap.chat_extended_title
            );
            stateMap.is_chat_retracted = true;
            if (callback) { callback(jqueryMap.$chat); }
          }
        );
      }
      return true;
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
                            anchor_map_proposed,
                            _s_chat_previous, _s_chat_proposed,
                            s_chat_proposed;

      console.log("hi from hashChange %s", stateMap.anchor_map);
      // attempt to parse anchor
      try {
        anchor_map_proposed = $.uriAnchor.makeAnchorMap(); 
      } catch (error) {
        $.uriAnchor.setAnchor(anchor_map_previous, null, true);
        return false;
      }
      stateMap.anchor_map = anchor_map_proposed;

      // convenience vars
      _s_chat_previous = anchor_map_previous._s_chat;
      _s_chat_proposed = anchor_map_proposed._s_chat;

      if (!anchor_map_previous || _s_chat_previous !== _s_chat_proposed
      ) {
        s_chat_proposed = anchor_map_proposed.chat;
        switch (s_chat_proposed) {
          case 'open':
            toggleChat(true);
            break;
          case 'closed':
            toggleChat(false);
            break;
          default:
            toggleChat(false);
            delete anchor_map_proposed.chat;
            $.uriAnchor.setAnchor(anchor_map_proposed, null, true);
        }
      }

      return false;
    };


    onClickChat = function (/*event*/) {
      //
      // trigger a toggle via the anchor URI event (onHashChange)
      //
      changeAnchorPart(
            { chat : (stateMap.is_chat_retracted ? 'open' : 'closed') }
        );
      return false; // false indicates we're done and no more
                    // handlers should run, and prevents default
                    // jquery action (also can use:
                    //    1. event.preventDefault()
                    //    2. event.stopPropagation()
                    //    3. event.preventImmediatePropagation()
    };



    /////////// PUBLIC
    //
    initModule = function ($container) {
      stateMap.$container = $container;
      $container.html(configMap.main_html);
      setJqueryMap();

      // init and bind chat slider
      stateMap.is_chat_retracted = true;
      jqueryMap.$chat
        .attr('title', configMap.chat_retracted_title)
        .click(onClickChat);

      // setup a schema to test anchors against
      $.uriAnchor.configModule(
          { schema_map : configMap.anchor_schema_map }
      );

      // setup URI change events _after_ all feature modules
      // this triggers the hashchange event so the module considers
      // the bookmark on initial load
      $(window)
        .bind('hashchange', onHashChange)
        .trigger('hashchange');

      //
      // test
      //
      //setTimeout(function () { toggleChat(true);},  3000 );
      //setTimeout(function () { toggleChat(false);}, 8000 );

    };

    return { initModule : initModule };
}());
