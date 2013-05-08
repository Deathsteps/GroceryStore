/**
* @namespace $.localStorage
* @fileOverview 
	A lib to manage local storage using html5 local storage api.
	Like jsStorage.js, it is compatible with the old browser (eg. ie6/ie7).
* @author deathsteps
* @email lovely_dreamer@126.com
* @version 0.1
* @date 2013-5-8
* @example
*/

(function (){
	"use strict";
	
	/* detect a dollar object or create one if not found */
	$ = window.jQuery || window.$ || (window.$ = {}),
	
	function _trim(str){
		if(String.prototype.trim)
			return str.trim();
		else
			return str.replace(/^\s+|\s+$/g, '');
	}
	
	$.localStorage = {
		_storage: null,
		
		_isSupported: null,
		
		length: 0,
			
		key: function (index){
			return this._storage.key(index);
		},
	
		getItem: function (key){
			return this._storage.getItem(key);
		},
	
		setItem: function (key, value){
			// 增加 return 使其能最大程度兼容将来的api
			return this._storage.setItem(key, value);
		},
	
		removeItem: function (key){
			return this._storage.removeItem(key);
		},
		
		clear: function (){
			return this._storage.clear();
		}
	}
	
	function _init(){
		
		var isSupported = false, storage;
		
        if("localStorage" in window){
            try {
                window.localStorage.setItem('_tmptest', 'tmpval');
                isSupported = true;
                window.localStorage.removeItem('_tmptest');
            } catch(BogusQuotaExceededErrorOnIos5) {
                // Thanks be to iOS5 Private Browsing mode which throws
                // QUOTA_EXCEEDED_ERRROR DOM Exception 22.
            }
        }

		// Firefox fails when touching localStorage and cookies are disabled
        if(isSupported){
			storage = window.localStorage;
        } else if("globalStorage" in window){
			// use globalStorage to emulate localStorage
            storage = window.globalStorage[window.location.hostname];
        } else {
			// window.localStorage will be undefined in ie8+ everytime not visit it through the server.
            var storage_elm = document.createElement('link');
			
            if(storage_elm.addBehavior){

                storage_elm.style.behavior = 'url(#default#userData)';

                document.getElementsByTagName('head')[0].appendChild(storage_elm);

				storage_elm.load(window.location.hostname);

				storage = _initWithUserData(storage_elm);
            }else{
                storage_elm = null;
                return;
            }
        }
		
		$.localStorage._storage = storage;
		$.localStorage.length = $.localStorage._storage.length;
		$.localStorage._isSupported = isSupported;
		

		// add expire related methods
		_extendAPI();
		
        // remove dead keys
        $.localStorage.expire();

        // start listening for changes
        //_setupObserver();
		
	}
	
	function _initWithUserData(storage_elm){
	
		return {

			_elm: storage_elm,
			
			_name: window.location.hostname,
			
			_keyname: '__key',
			
			_updateKeys: function (type, key){
				// __key: key1 key2 key3
			
				if(type == 'clear'){
					this.length = 0;
					this._elm.setAttribute(this._keyname, '');
					return;
				}
				
				var keys = this.getItem(this._keyname);
				
				var tmpKey = ' ' + key + ' ';
				keys = keys ? ' ' + keys + ' ' : tmpKey;
				
				if(keys.indexOf(tmpKey) == -1){
					if(type == 'update')
						keys += key;
				}else{
					if(type == 'remove')
						keys.replace(tmpKey, '');
				}
				
				_trim(keys);
				
				this.length = keys.split(' ').length;
				
				this._elm.setAttribute(this._keyname, keys);
			},
			
			length: 0,
			
			key: function (index){
				var keys = this.getItem(this._keyname);
				return keys ? keys.split(' ')[index] : null;
			},
		
			getItem: function (key){
				this._elm.load(this._name);
				return this._elm.getAttribute(key);
			},
		
			setItem: function (key, value){
				this._elm.load(this._name);
				this._elm.setAttribute(key, value);
				this._updateKeys('update', key);
				this._elm.save(this._name);
			},
		
			removeItem: function (key){
				this._elm.load(this._name);
				this._elm.removeAttribute(key);
				this._updateKeys('remove', key);
				this._elm.save(this._name);
			},
			
			clear: function (){
				var keys = this.getItem(this._keyname);
				if(!keys) return;
				
				this._elm.load(this._name);
				
				keys = keys.split(' ');
				for(var i=0, len = keys.length; i<len; i++){
					this._elm.removeAttribute(keys[i]);
				}
				
				this._updateKeys('clear');
				this._elm.save(this._name);
			}
		}
	}
	
	
	function _extendAPI(){
		// __expires: key#timestamp key#timestamp key#timestamp
		$.localStorage._expirekey = '__expires';
	
		$.localStorage.setExpire = function (key, date){
			var expires = this.getItem(this._expirekey) || '',
				rExpire = new RegExp('(\\s' + key + '#' + '\\d+)');
				
			expires = (' ' + expires).replace(rExpire, '');
			expires = _trim( expires + ' ' + key + '#' + (+new Date()) );
			
			this.setItem(this._expirekey, expires);
		};
		
		$.localStorage.expire = function (){
			var expires = this.getItem(this._expirekey);
			if(!expires) return;
			
			var key, timestamp, now = + new Date(), available = [];
			
			expires = expires.split(' ');
			for(var i=0, len = expires.length; i<len; i++){
				key = expires[i].replace(/#(\d+)$/, function (num){
					timestamp = +num;
					return '';
				});
				
				if(timestamp > now){
					if(this.getItem(key))
						available.push(expires[i]);
				}else{
					this.removeItem(key);
				}
			}
			
			this.setItem(this._expirekey, available.join(' '));
		};
		
		$.localStorage.setAllExpire = function (date){
			// todo
		};
	}
	
	_init();
	
})();