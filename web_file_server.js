
var CONFIG = {
	
		host : '127.0.0.1',
		port : 8002,
		
		site_base : './site',
		
		file_default : '/index.html',
		file_404 : '/404.html',
		
		file_expiry_time : 30 // minutes
	
	},
	
	MIME_TYPES = {
	
		'.txt' : 'text/plain',
		'.html' : 'text/html',
		'.js' : 'text/javascript',
		'.css' : 'text/css'
	
	},
	
	EXPIRY_TIME = (CONFIG.file_expiry_time * 60).toString(),
	
	HTTP = require('http'),
	PATH = require('path'),
	FS = require('fs');


HTTP.createServer(function(request, response) {

	if (request.method === 'GET') {
	
		handleFileRequest(request, response, request.url);
	
	}

}).listen(CONFIG.port, CONFIG.host);

console.log('Server Online : http://' + CONFIG.host + ':' + CONFIG.port.toString() + '/');


function handleFileRequest(request, response, file_path) {

	if (file_path === '/') {
	
		file_path = CONFIG.site_base + CONFIG.file_default;
	
	}
	else {
	
		file_path = CONFIG.site_base + file_path;
	
	}
	
	PATH.exists(file_path, function(file_exists) {
	
		if (file_exists) {
		
			serveFile(request, response, file_path);
		
		}
		else {
		
			serveFile(request, response, CONFIG.site_base + CONFIG.file_404, true);
		
		}
	
	});

}


function serveFile(request, response, file_path, is404) {

	var file_extension = PATH.extname(file_path),
		mime_type = MIME_TYPES[file_extension];
	
	FS.stat(file_path, function(error, file_stats) {
	
		if (error) {
		
			response.writeHead(500);
			response.end();
		
		}
		else {
		
			var etag = '"' + file_stats.ino.toString() + '/' + file_stats.size.toString() + '/' + file_stats.mtime.getTime() + '"';
			
			if (request.headers.hasOwnProperty('if-none-match') && request.headers['if-none-match'] === etag) {
			
				response.writeHead(304);
				response.end();
			
			}
			else {
			
				var headers = {
				
					'Content-Type': mime_type,
					'Content-Length' : file_stats.size,
					'Cache-Control' : 'max-age=' + EXPIRY_TIME,
					'ETag' : etag
				
				};
				
				if (is404) {
				
					response.writeHead(404, headers);
				
				}
				else {
				
					response.writeHead(200, headers);
				
				}
				
				FS.createReadStream(file_path).pipe(response);
			
			}
		
		}
	
	});

}