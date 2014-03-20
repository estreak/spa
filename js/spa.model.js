/*
 * spa.model.js
 */

/*jslint browser : true, continue : true,
 devel : true, indent : 2, maxerr : 50,
 newcap : true, nomen : true, plusplus : true,
 regexp : true, sloppy : true, vars : false,
 white : true
 */
/*global $, spa:true */


spa.model = (function () {
  'use strict';
  var
    //configMap = {
    //},
    stateMap = {
      game_id_map : {}
      //game_db : TAFFY(),
    },

    isFakeData = true,

    // API
    games,
    makeGame,
    initModule
  ;

  function Game(obj) {
    var key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        this[key] = obj[key];
      }
    }
  }

  games = {
    //get_db : function() { return stateMap.game_db; },
    get_game_id_map : function () { return stateMap.game_id_map; }
  };

  makeGame = function (game_map) {
    var game = new Game(game_map);
    console.log("made game %s", game);

    stateMap.game_id_map[game.game_id] = game;
    //stateMap.game_db.insert(game);
    return game;
  };


  initModule = function() {
    var i, game_list;

    if (isFakeData) {
      console.log("populating fake data");
      game_list = spa.fake.getGameList();
      for (i = 0; i < game_list.length; i++) {
        makeGame(game_list[i]);
      }
    }
  };

  return {
    initModule : initModule,
    games : games
  };
}());


