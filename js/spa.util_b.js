/**
 * spa.util_b.js
 * JavaScript browser utilities
 *
 * Compiled by Michael S. Mikowski
 * These are routines I have created and updated
 * since 1998, with inspiration from around the web.
 * MIT License
 */

/*jslint browser : true, continue : true,
 devel : true, indent : 2, maxerr : 50,
 newcap : true, nomen : true, plusplus : true,
 regexp : true, sloppy : true, vars : false,
 white : true
 */
/*global $, spa:true, getComputedStyle */

spa.util_b = (function () {
    'use strict';
  var
    configMap = {
      regex_encode_html : /[&"'><]/g,
      regex_encode_noamp : /["'><]/g,
      html_encode_map : {
        '&' : '&#38;',
        '"' : '&#34;',
        "'" : '&#39;',
        '>' : '&#62;',
        '<' : '&#60;'
      }
    },
    decodeHtml, encodeHtml, getEmSize
  ;

  configMap.encode_noamp_map = $.extend(
        {}, configMap.html_encode_map
  );

  delete configMap.encode_noamp_map['&'];

  decodeHtml = function ( str ) {
    //
    // decodes HTML entities in a browser-friendly way
    //
    return $('<div/>').html(str || '').text();
  };

  encodeHtml = function ( input_arg_str, exclude_amp ) {
    //
    // single pass encoder for html entities and arbitrary # of chars
    //
    var
      input_str = String( input_arg_str ),
                regex, lookup_map
    ;
    if ( exclude_amp ) {
      lookup_map = configMap.encode_noamp_map;
      regex = configMap.regex_encode_noamp;
    }
    else {
      lookup_map = configMap.html_encode_map;
      regex = configMap.regex_encode_html;
    }
    return input_str.replace(regex,
        function ( match /*, name*/ ) {
          return lookup_map[ match ] || '';
        }
    );
  };

  getEmSize = function ( elem ) {
    //
    // returns size of ems in pixels
    //
    return Number(
        getComputedStyle( elem, '' ).fontSize.match(/\d*\.?\d*/)[0]
        );
  };

  return {
    decodeHtml : decodeHtml,
    encodeHtml : encodeHtml,
    getEmSize : getEmSize
  };
}());
