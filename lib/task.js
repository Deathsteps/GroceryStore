/**
* @namespace Deathsteps
* @fileOverview 
	A tool for you to improve the async coding experience.
	It will provide Task class for you to manage every task with an unique queue.
	Notice that the task will start when the main process is idle by using the setTimeout.
	The only thing needed taking into account is the signature of the async function, 
	should be kept with the following patterns:
		function (other params, success_callback [, fail_callback])
* @author deathsteps
* @email lovely_dreamer@126.com
* @version 0.1
* @date 2013-1-30
* @example
1.
	var task = new Task(); // constructor mode
	task.wait(funcA)	// wait for async funcA to execute
		.done(funcB)	// then funcB will execute when funcA succeed
		.done(funcC)	// then funcB will execute when funcA succeed
		.wait(funcD)	// then wait for async funcD to execute
		.done(funcE)	// then funcE will execute when funcD succeed
		.fail(funcX)	// funcX will execute when funcD fail
2.	
	Task() // factory mode
		.wait(obj.methodA, obj, args..)		// obj.methodA excutes async on the obj(context) with args
		.done(obj.methodB, obj, args..)		// then obj.methodB excutes async on the obj(context) with args
*/

"use strict";

function toArray(args){
	return Array.prototype.slice.call(args);
}

if(!Array.prototype.forEach)
	Array.prototype.forEach = function (f, _this){
		for (var i=0,n=this.length;i<n;i++)
			f.call(_this,this[i],i,this);
		return this;
	};
	
if(!Array.prototype.map)
	Array.prototype.map = function (f, _this){
		var result = [];
		for (var i=0,n=this.length;i<n;i++)
			result.push(f.call(_this,this[i],i,this));
		return this;
	};

///////////////////////////////////////

// constructor / factory method
var Task = function (){
	if(this instanceof Task)
		this._queue = [];
	else
		return new Task();
}

var proto = Task.prototype,
	tuples = ['done', 'fail'];

function createCallbacks(task){
	//Cause node treat the last argument as callback and there is no fail callback in it.
	//So ... ...
	return tuples.map(function (item, i){
			return function (){
				var queue = task._queue,
					args = toArray(arguments);
				var execute = queue.shift();
				
				while(execute){
					if(item == execute.type){
						args = execute.args.concat(args);
						execute.fn.apply(execute.ctx, args);
					}
					execute = queue.shift();
				}
			}
		});
}
	
proto.wait = function (func, ctx){

	var callbacks = createCallbacks(this);
	
	var args = toArray(arguments).slice(2);
	ctx = ctx || this;
	args = args.concat(callbacks);

	if(this._queue.length == 0){
		// execute first task
		func.apply(ctx, args);
		// fix wait().wait() problem
		this._queue.push({fn: function(){}, ctx: null, args: [], type: 'done'});
	}else{
		// add the function to the done funcs
		this._queue.push({fn: func, ctx: ctx, args: args, type: 'done'});
		// push a delimiter
		this._queue.push(null);
	}
	
	return this; // keep the chain
};

tuples.forEach(function(item, i){
	proto[item] = function (funcs, ctx){
		if(funcs){
			if(funcs.constructor !== Array)
				funcs = [funcs];
				
			var queue = this._queue,
				args = toArray(arguments).slice(2);
				
			for(var i=0, len = funcs.length; i<len; i++){
				queue.push({fn: funcs[i], ctx: ctx || this, args: args, type: item});
			}
		}
		
		return this;
	}
});

exports.Task = Task;