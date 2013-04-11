h.doctype('html5'),
h.html([
	h.head([
		h.el('title', content.title),
		extras.getHead()
	]),
	h.body([
		h.el('header', [
			h.el('h1', { 'class':'heading1' }, 'Custard Demo'),
			h.el('p', content.paragraph1),
			h.el('p', content.superEmphasise(content.paragraph2))
		]),
	]),
])