/**
* @fileOverview 
	an imitation of handlebars
	most keywords and syntax are from it
	but it can do more than a html template
* @author deathsteps
* @email lovely_dreamer@126.com
* @version 1.0
* @date 2012-10-11
*/
window.Template = {};
(function(exports){
    "use strict";
    
    // syntax expression boundary
    var openTag = '{{', closeTag = '}}';
    var funcCode = '(function ($data){',
    	dataCode = '$data', 
    	exprCode = '$expr',
    	paramsCode = ')($data, $expr);',
    	outCode = '$out+='; // out add code
    	
    // code stack for compile template
    var codeStack = [];
    // regexp for parse
    var rExpression = /^([#\/]*)\s*(\w+)\s*(.*)$/,
    	rProp = /[a-zA-Z_\$][0-9a-zA-Z_\$\.]*/g;
    // compile helper codes dictionary
    // due to template parse mode,
    // there can be at most two code parts in each helper.
    var helperCodes = {};
    /*
     * @function make params code
     * @param {string} expression to set the actual value of the specified param
     * @param {string} which param to replace
     */
    function toParamsCode(expr, which){
    	//which = which || exprCode;
    	if(which == dataCode)
    		return paramsCode.replace(dataCode, expr);
    	else
    		return paramsCode.replace(exprCode, toCtxExpr(expr));
    }
    // fix the expression with data context
    function toCtxExpr(expr){
    	expr = expr.trim();
    	
    	return expr.replace(rProp, function(prop){
    		if(prop.indexOf(exprCode) > -1 || prop.indexOf(dataCode) > -1)
    			return prop;
    		else
    			return dataCode + '.' + prop;
    	});
    }
    // escape code to a html string
    function escape(code){
    	code = code
    		//.replace(/[\s\t]+/g, '') // �ո���Tab
            .replace(/('|"|\\)/g, '\\$1')// ��˫�����뷴б��ת��
            .replace(/\r/g, '\\r')// ���з�ת��(windows + linux)
            .replace(/\n/g, '\\n');
    	return outCode + '"' + code + '";';
    }
    // parse template expression to js code
    function parse(code){
    	// _ type helper expr
    	var matches = code.match(rExpression);
    	if(matches[1] == '#'){
    		codeStack.push(toParamsCode( matches[3] ));
    		//eg: (function(){ ....
    		return helperCodes[matches[2]][0];
    	}
    	
    	if(matches[1] == '/'){
    		// to do keyword match check
    		//eg: .... })($data, $expr);
    		return helperCodes[matches[2]][1] + codeStack.pop();
    	}
    	
    	if(matches[1] == ''){
    		//eg: $out+=$data.abc;
    		return outCode + toCtxExpr(matches[2]) + ';';
    	}
    	
    	throw new Error('[template syntax error] parse');
    }
    // compile template source to function
    function compile(source){
    	
    	codeStack = []; // init code stack
    	
    	var code = 'var $out = "";', codeparts;
    	
    	// word segment and process
    	source.split(openTag).forEach(function (part, index){
    		codeparts = part.split(closeTag);
    		
    		if (codeparts.length==1){
    			code += escape(part);
    		} else {
    			code += parse(codeparts[0]);
    			code += escape(codeparts[1]);
    		}
    	});
    	
    	//remove reduntant \r \n in $out
    	code += '$out = $out.replace(/\\r\\s*\\r/g,"\\r").replace(/\\n\\s*\\n/g,"\\n");';
    	code += 'return $out;';
    	
    	return new Function('$data', '$expr', code);
    }
    // template functions that can be called in helpers
    var tmplFuncs = {
    	write: {
    		reg: /\$write\s*\(([^\)]*)\)\s*;*/g,
    		process: function (source){
    			return source.replace(this.reg, function (_, params){
    				return outCode + params + ';';
    			});
    		}
    	},
    	parse: {
    		reg: /\$parse\s*\(([^\)]*)\)\s*;*/,
    		process: function (source){
    			var ret = ['', ''];
    			// codepart1 data codepart2
    			var codeparts = source.split(this.reg);
    			if (codeparts.length>1){
    				var code = '';
    				if(codeparts[1]){
    					// change data ctx
    					codeparts[0] += funcCode;
    					code += '}';
    					code += codeparts[1] ? toParamsCode(codeparts[1], dataCode) : '';
    				}
    				code += codeparts[2];
    				ret[1] = code;
    			}
    			ret[0] = '(' + codeparts[0];
    			return ret;
    		}
    	}
    }
    // register helper to do more source parse
    function registerHelper(keyword, func){
    	// compile helper func to helper code
    	codeStack = [];
    	var source = func.toString(), codes;
    	source = tmplFuncs.write.process(source);
    	codes = tmplFuncs.parse.process(source); 
    	helperCodes[keyword] = codes;
    }
    registerHelper('each', 
    	function($data, $expr){
    		for(var i=0, len = $expr.length; i<len; i++){
    			$parse($expr[i]);
    		}
    	});
    registerHelper('if', 
    	function($data, $expr){
    		if ($expr){
    			$parse();
    		}
    	});
    	
    exports.compile = compile;
    exports.registerHelper = registerHelper;
})(window.Template);