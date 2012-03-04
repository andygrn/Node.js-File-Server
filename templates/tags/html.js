
module.exports = {

//	Returns an html doctype string
	doctype : function(type){

		var doctypes = {
			'html5' : '<!DOCTYPE html>',
			'xhtml1_strict' : '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">',
			'html4_strict' : '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">'
		};
		
		type = type || 'html5';
		
		return doctypes[type.toLowerCase()];

	},

//	Convenience wrapper for el(), doesn't allow attributes
	html : function(inner){
	
		return this.el('html', inner);
	
	},

//	Convenience wrapper for el(), doesn't allow attributes
	head : function(inner){
	
		return this.el('head', inner);
	
	},
	
//	Convenience wrapper for el()
	body : function(){
	
		var new_args = Array.prototype.slice.call(arguments);
		new_args.unshift('body');
		
		return this.el.apply(this, new_args);
	
	},

//	Returns an html element string from a tagname and attributes object (from template)
	el : function(tagname){
	
		var buffer = '',
			attributes = false,
			inner = false;
		
		if ( typeof tagname === 'string' ) {
		
			for ( var i = 1; i < arguments.length; ++i ) {
			
				if ( arguments[i] instanceof Array || typeof arguments[i] === 'string' ) {
					inner = arguments[i];
				}
				else if ( typeof arguments[i] === 'object' ) {
					attributes = arguments[i];
				}
			
			}
			
			buffer = '<' + tagname + this.addAttributes(attributes) + '>' + this.getNested(inner) + '</' + tagname + '>';
		
		}
		
		return buffer;
	
	},

//	Returns an html attribute string
	addAttributes : function(attributes){
	
		var buffer = '';
		
		if ( attributes ) {
		
			for ( attribute in attributes ) {
				
				buffer += ' ' + attribute + '=' + '"' + attributes[attribute] + '"';
			
			}
		
		}
		
		return buffer;

	},
	
//	Returns the content of an html element and its children
	getNested : function(inner){

		var buffer = [];
		
		if ( inner instanceof Array ) {
		
			for ( var i = 0; i < inner.length; ++i ) {
			
				buffer.push(inner[i]);
			
			}
		
		}
		else if ( typeof inner === 'string' ) {
		
			buffer.push(inner);
		
		}
		
		return buffer.join('');

	}

}