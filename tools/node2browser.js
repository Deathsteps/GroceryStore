/**
* @namespace
* @fileOverview 
	This is a tool for changing a node module to a browser plugin.
* @author deathsteps
* @email lovely_dreamer@126.com
* @version 0.1
* @date 2013-4-8
* @example
*/

"use strict";

var sys = {}; // namespace to organsize the sys module
sys.fs = require('fs');
sys.readline = require('readline');
sys.path = require('path');

var NS_START_TMPL = 
'window.$ns = {};\r\n\
(function(exports){\r\n';
var NS_END_TMPL  = '\r\n})(window.$ns);';

var WINDOW_NS_START_TMPL = '(function(exports){\r\n';
var WINDOW_NS_END_TMPL  = '\r\n})(window);';

var TAB = '    ';

var EXTNAME = '.js';

var rl = sys.readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

rl.question('Please input the file name with path.\r\n', function (filename){
	rl.question('Please input the lib name.\r\n', function (ns){
		sys.fs.readFile(filename, 'utf8', function (err, data){
			if(err){
				console.log('Sorry, read file failed.');
				return;
			}
			data = switchEnv(data, ns);
			filename = get_savename(filename);
			sys.fs.writeFile(filename, data, 'utf8', function (err){
				if(err){
					console.log('Sorry, write file failed.');
					return;
				}
				console.log('Switch Complete.');
			});
		});
	});
});

function switchEnv(data, ns){
	var codepart1, codepart2;
	if(ns){
		codepart1 = NS_START_TMPL.replace('$ns', ns);
		codepart2 = NS_END_TMPL.replace('$ns', ns);
	}else{
		codepart1 = WINDOW_NS_START_TMPL;
		codepart2 = WINDOW_NS_END_TMPL;
	}
	
	var contents = data.split(/[\"\']use strict[\"\'];/);
	
	if(contents.length == 1)
		return codepart1 + data + codepart2;
	else{
		return contents[0] + codepart1 + TAB + '"use strict";' + '\r\n' + TAB +
			contents[1].replace(/(\r|\n)+/g, '$1' + TAB) + codepart2;
	}
} 

function get_savename(filename){
	var dirname = sys.path.dirname(filename),
		savename = sys.path.basename(filename, EXTNAME);
	savename += '.plugin' + EXTNAME;
	return dirname + '\\' + savename;
}