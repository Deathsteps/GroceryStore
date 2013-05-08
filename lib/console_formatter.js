/**
* @namespace
* @fileOverview 
	A lib to make console log better for reading.
* @author deathsteps
* @email lovely_dreamer@126.com
* @version 0.1
* @date 2013-5-8
* @example
*/

//ANSI escape codes
var codes = {
	'red'		  :'\u001B[31m',
	'green'		  :'\u001B[32m',
	'blue'		  :'\u001B[34m',
	'yellow'	  :'\u001B[33m',
	'magenta'	  :'\u001B[35m',
	'cyan'		  :'\u001B[36m',
	'color_suffix':'\u001B[39m',
	'bold_prefix' :'\u001B[1m',
	'bold_suffix' :'\u001B[22m',
}

exports.bold = function (str) {
	return codes.bold_prefix + str + codes.bold_suffix;
};

exports.colour = function (color, str){
	return (codes[color] ||'') + str + codes.color_suffix;
};

exports.bright_colour = function(color, str){
	return exports.bold(exports.colour(color, str));
};
