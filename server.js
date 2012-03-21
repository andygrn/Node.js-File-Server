
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
	
	'file_expiry_time': 480, // HTTP cache expiry time, minutes
	
	'directory_listing': true

};
	
var MIME_TYPES = {

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

};
	
var EXPIRY_TIME = (CONFIG.file_expiry_time * 60).toString();
	
var HTTP = require('http');
var PATH = require('path');
var FS = require('fs');
var CRYPTO = require('crypto');
var CUSTARD = require('./custard');
	
var template_directory = FS.readFileSync('./templates/blocks/listing.js');


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

	if ( CONFIG.directory_listing ){
		PATH.exists( full_path, function ( path_exists ){
			if ( path_exists ){
				FS.readdir( full_path, function ( error, files ){
					if ( error ){
//						Internal error
						callback( new ResponseObject( {'data': error.stack, 'status': 500} ) );
					}
					else {
//						Custard template
						template = new CUSTARD;
						
						template.addTagSet( 'h', require('./templates/tags/html') );
						template.addTagSet( 'c', {
							'title': 'Index of ' + path,
							'file_list': function ( h ){
								var items = [];
								var stats;
								for ( i = 0; i < files.length; i += 1 ){
									stats = FS.statSync( full_path + files[i] );
									if ( stats.isDirectory() ){
										files[i] += '/';
									}
									items.push( h.el( 'li', [
										h.el( 'a', {'href': path + files[i]}, files[i] )
									] ) );
								}
								return items;
							}
						} );
						
						template.render( template_directory, function ( error, html ){
							if ( error ){
//								Internal error
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
//				Not found
				callback( new ResponseObject( {'status': 404} ) );
			}
		} );
	}
	else {
//		Forbidden
		callback( new ResponseObject( {'status': 403} ) );
	}

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
