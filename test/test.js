/**
* @namespace
* @fileOverview 
	A simple node unit test tool.
* @author deathsteps
* @email lovely_dreamer@126.com
* @version 0.1
* @date 2013-5-8
* @example
*/

var sys = {};
sys.assert = require('assert');
var formatter = require('../lib/console_formatter');

// format the $\d width the args
function format(str) {
	var args = arguments;
	if (args.length == 0)
		return str;
	return str.replace(/\$(\d)/g, function (w, d) {
		return args[d] == undefined ? '' : args[d];
	});
}

var symbols = {
	failed: '× ',
	passed: '√ ',
	tab: '	',
	space: ' '
};

var lines = [], passed = 0, failed = 0;

// warp sys.assert
var assert = (function(sys_assert){
	
	var _this = {};
	
	function warp(func, msgIndex){
		return function(){
			// the message is the last argument
			var args = [].slice.call(arguments),
				msg  = args[msgIndex] || '',
				ok 	 = false;
			try{
				func.apply(sys_assert, args);
				ok = true;
				passed++;
			}catch(e){
				ok = false;
			}
			lines.push(ok ? 
				formatter.colour('green', symbols.tab +  symbols.passed + msg) :
				formatter.colour('red', symbols.tab +  symbols.failed + msg));
		}
	}
	
	['equal', 'notEqual', 'deepEqual', 'notDeepEqual', 'strictEqual', 'notStrictEqual']
		.forEach(function(func, i){
			_this[func] = warp(sys_assert[func], 2);
		});
	
	return _this;
})(sys.assert);

function test(title, func){
	func(assert);
	
	failed = lines.length - passed;
	title = failed > 0 ?
		formatter.colour('red', 
			format('$1[$2] passed: $3, failed: $4', symbols.failed, title, passed, failed)) :
		formatter.colour('green', 
			format('$1[$2] passed: $3, failed: $4', symbols.passed, title, passed, failed));
	lines.unshift(title);
	
	console.log(lines.join('\n'));
	console.log('-------------------------------');
	// resume
	lines = []; passed = 0; failed = 0;
}

exports.test = test;

