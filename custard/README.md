
# Custard

A function-based javascript-to-anything templating tool for Node.

Custard is flexible, extendable, and tiny. So tiny it's almost cheating. I've used my own HTML tag set as an example here, but you might want to write your own, completely different one. Perhaps a tag set for RSS feeds, or YAML, or even CSS?


## Template structure

Templates are basically a javascript array without the surrounding brackets. Don't forget the commas!

```javascript
h.doctype('html5'),
h.html([
	h.head([
		h.el('title', content.title),
	]),
	h.body([
		h.el('header', [
			h.el('h1', { 'class':'heading1' }, 'Custard Demo'),
			h.el('p', content.paragraph1),
			h.el('p', h.superEmphasise(content.paragraph2))
		]),
	]),
])
```

This example can be found in `/template/blocks/example.js`


## Existing tag sets

All of those `h` functions aren't a part of Custard itself. You extend the template with your own (or someone else's) tag functions! This template uses an HTML tag set, binded to `h`;

```javascript
var Custard = require('./custard');
var template = new Custard;

template.addTagSet( 'h', require( './tags/html' ) );
```

This gives you access to `el`, `doctype`, `body` etc. (be sure to check out `/template/tags/html.js` to see how it all works), with the prefix `h`. The prefix can be whatever string you want.


## In-app custom tag sets

Of course you can use multiple tag sets, or even extend/overwrite an existing one whenever you feel like it. This code could be in your app;

```javascript
template.addTagSet( 'content', {
	'title': some_variable_from_your_app,
	'paragraph1': some_variable_from_your_app,
	'paragraph2': some_variable_from_your_app,
	'the_date': (new Date).toLocaleString()
} );

template.addTagToSet( 'h', 'superEmphasise', function ( text ){
	return text.toUpperCase() + '!!!';
} );
```

Now you still have access to the HTML functions with `h` (including `superEmphasise`, one you just made up), but you can now pass content into the template with `content`. Or `badger`, or `lindsaylohan`, or whatever.


## Output

When you're done messing with tags and variables, simply render it into whatever language your tags output (html in this case, obviously).

```javascript
template.render( data, function ( error, html ){
	if ( error ){
		handleError();
	}
	else {
		doSomething( html );
	}
} );
```


## Control structures

You _could_ write control structures _inside_ a Custard template, but I prefer to keep them outside. It's neater.

### If/Else

Easy!

```javascript
template.addTagToSet( 'user', 'loggedInMessage' {
	if ( session ){
		return 'Welcome, ' + session.user.name;
	}
	else {
		return 'Welcome, stranger';
	}
} );
```

Inside the template;

```javascript
h.el('h1', user.loggedInMessage())
```

### Loops

Here's a loop;

```javascript
var files = FS.readdirSync( path );
template.addTagToSet( 'server', 'listFiles', function (){
	var items = [];
	for ( i = 0; i < files.length; i += 1 ){
		items.push( '<li>' + files[i] + '</li>' );
	}
	return items;
} );
```

And the corresponding template tag;

```javascript
h.el('ul', server.listFiles())
```

It's just normal javascript! In this case, it would output something like;

```html
<ul><li>filename.jpg</li><li>filename2.gif</li><li>filename3.png</li></ul>
```


## Using tag sets from the app code

Instead of manually writing HTML when outside the template, why not use the HTML tag set we already have? Just pass it back into the function from the template itself as an argument, like so;

```javascript
h.el('ul', server.listFiles( h ))
```

Then use it as normal;

```javascript
var files = FS.readdirSync( path );
template.addTagToSet( 'server', 'listFiles', function ( h_tag_set ){
	var items = [];
	for ( i = 0; i < files.length; i += 1 ){
		items.push( h_tag_set.el( 'li', {'id': 'file' + i}, files[i] ) );
	}
	return items;
} );
```

```html
<ul><li id="file0">filename.jpg</li><li id="file1">filename2.gif</li><li id="file2">filename3.png</li></ul>
```


## Caching

Custard has no caching mechanism. It's trivial to write a caching wrapper, and everybody has different requirements, so I'm not going to include one as standard.
