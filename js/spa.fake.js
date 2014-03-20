/*
 * spa.fake.js
 */

/*jslint browser : true, continue : true,
 devel : true, indent : 2, maxerr : 50,
 newcap : true, nomen : true, plusplus : true,
 regexp : true, sloppy : true, vars : false,
 white : true
 */
/*global $, spa:true */

spa.fake = (function () {
  'use strict';

  var getGameList, fakeBetId, makeFakeBetId, mockSio;

  getGameList = function () {
    return [
      { game_id : '700', round_id : '1', tourney_id : '1',
        team_fav: 'Colorado', team_dog : 'UCLA',
        spread : '17', over_under : '55', 
        tipoff_time : 'Mar 18, 2:30 pm EST' ,
      },
      { game_id : '701', round_id : '1', tourney_id : '1',
        team_fav: 'Gonzaga', team_dog : 'BYU',
        spread : '4', over_under : '75', 
        tipoff_time : 'Mar 18, 3:30 pm EST',
      },
    ];
  };

  
  fakeBetId = 13;
  makeFakeBetId = function () {
    return 'id_' + String(fakeBetId++);
  };


  mockSio = (function () {
    var on_sio, emit_sio, callback_map = {};
    on_sio = function ( msg_type, callback ) {
    callback_map[ msg_type ] = callback;
    };
    emit_sio = function ( msg_type /*, data*/ ) {
    // respond to 'adduser' event with 'userupdate'
    // callback after a 3s delay
    //
    if ( msg_type === 'makebet' && callback_map.betreply ) {
    setTimeout( function () {
      callback_map.betreply(
        [{ _id : makeFakeBetId(),
        result : 'ok',
        }]
        );
      }, 3000 );
    }
    };
    return { emit : emit_sio, on : on_sio };
  }());

  return {
    getGameList : getGameList,
    mockSio : mockSio,
  };
}());
