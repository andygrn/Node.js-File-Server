
/*

	Custard - A function-based javascript-to-anything templating tool
	Andy Green
	http://andygrn.co.uk
	February 2012

*/

function Custard( string ){

	this._tagSets = {};

};

Custard.prototype.render = function ( string, callback ){

	var tagNames = [];
	var tagBodies = [];
	
	for ( set in this._tagSets ){
		tagNames.push( set );
		tagBodies.push( this._tagSets[set] );
	}
	
	var template = Function( tagNames.join(), 'return [' + string + ']' );
	
	try {
		callback( null, template.apply( this, tagBodies ).join( '' ) );
	}
	catch ( error ) {
		callback( error );
	}

}

Custard.prototype.addTagSet = function( setname, set ){

	this._tagSets[setname] = this._tagSets[setname] || {};
	for ( tagname in set ){
		this._tagSets[setname][tagname] = set[tagname];
	}

}

Custard.prototype.addTagToSet = function( setname, tagname, body ){

	this._tagSets[setname] = this._tagSets[setname] || {};
	this._tagSets[setname][tagname] = body;

}

module.exports = Custard;
