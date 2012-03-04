
/*

	Node.js File Server
	Andy Green
	http://andygrn.co.uk
	November 2011

*/

'use strict';

var CONFIG = {
	
		'host': '127.0.0.1',
		'port': 80,
		
		'site_base': './site',
		
		'file_expiry_time': 300, // minutes
		
		'directory_listing': true
	
	},
	
	MIME_TYPES = {
	
		'.txt': 'text/plain',
		'.md': 'text/plain',
		'': 'text/plain',
		'.html': 'text/html',
		'.css': 'text/css',
		'.js': 'application/javascript',
		'.json': 'application/json',
		'.jpg': 'image/jpeg',
		'.png': 'image/png',
		'.gif': 'image/gif'
	
	},
	
	EXPIRY_TIME = (CONFIG.file_expiry_time * 60).toString(),
	
	HTTP = require('http'),
	PATH = require('path'),
	FS = require('fs'),
	CRYPTO = require('crypto'),
	CUSTARD = require('./custard'),
	
	template_directory = FS.readFileSync('./templates/blocks/listing.js');


// An object representing a server response

function ResponseObject( metadata ){

	this.status = metadata.status || 200;
	this.data = metadata.data || false;
	this.type = metadata.type || false;

}

ResponseObject.prototype.getEtag = function (){
	var hash = CRYPTO.createHash( 'md5' );
	hash.update( this.data );
	return hash.digest( 'hex' );
};


// Filter server requests by type

function handleRequest( url, callback ){

	if ( PATH.extname( url ) === '' ){
		getDirectoryResponse( url, function ( response_object ){
			callback( response_object );
		} );
	}
	else {
		getFileResponse( url, function ( response_object ){
			callback( response_object );
		} );
	}

}


// Creates a ResponseObject from a local file path

function getFileResponse( path, callback ){

	var path = CONFIG.site_base + path;
	
	PATH.exists( path, function ( path_exists ){
		if ( path_exists ){
			FS.readFile( path, function ( error, data ){
				if ( error ){
//					Internal error
					callback( new ResponseObject( {'data': error.stack, 'status': 500} ) );
				}
				else {
					callback( new ResponseObject( {'data': new Buffer( data ), 'type': MIME_TYPES[PATH.extname(path)]} ) );
				}
			} );
		}
		else {
//			Not found
			callback( new ResponseObject( {'status': 404} ) );
		}
	} );

}


// Creates a ResponseObject from a local directory path

function getDirectoryResponse( path, callback ){

	var full_path = CONFIG.site_base + path;
	var template;
	var i;
	
	PATH.exists( full_path, function ( path_exists ){
		if ( path_exists ){
			FS.readdir( full_path, function ( error, files ){
				if ( error ){
//					Internal error
					callback( new ResponseObject( {'data': error.stack, 'status': 500} ) );
				}
				else {
//					Custard template
					template = new CUSTARD;
					
					template.addTagSet( 'h', require('./templates/tags/html') );
					template.addTagSet( 'c', {
						'title': 'Index of ' + path,
						'file_list': function ( h ){
							var items = [];
							for ( i = 0; i < files.length; i += 1 ){
								items.push( h.el( 'li', [
									h.el( 'a', {'href': (path + files[i])}, files[i] )
								] ) );
							}
							return items;
						}
					} );
					
					template.render( template_directory, function ( error, html ){
						if ( error ){
//							Internal error
							callback( new ResponseObject( {'data': error.stack, 'status': 500} ) );
						}
						else {
							callback( new ResponseObject( {'data': new Buffer( html ), 'type': 'text/html'} ) );
						}
					} );
				}
			} );
		}
		else {
//			Not found
			callback( new ResponseObject( {'status': 404} ) );
		}
	} );

}


// Start server

HTTP.createServer( function ( request, response ){

	var headers;
	var etag;
	
	if ( request.method === 'GET' ){
//		Get response object
		handleRequest( request.url, function ( response_object ){
			if ( response_object.data && response_object.data.length > 0 ){
				etag = response_object.getEtag();
				if ( request.headers.hasOwnProperty('if-none-match') && request.headers['if-none-match'] === etag ){
//					Not Modified
					response.writeHead( 304 );
					response.end();
				}
				else {
					headers = {
						'Content-Type': response_object.type,
						'Content-Length' : response_object.data.length,
						'Cache-Control' : 'max-age=' + EXPIRY_TIME,
						'ETag' : etag
					};
					response.writeHead( response_object.status, headers );
					response.end( response_object.data );
				}
			}
			else {
				response.writeHead( response_object.status );
				response.end();
			}
		} );
	}
	else {
//		Forbidden
		response.writeHead( 403 );
		response.end();
	}

} ).listen( CONFIG.port, CONFIG.host );

console.log( 'Site Online : http://' + CONFIG.host + ':' + CONFIG.port.toString() + '/' );
