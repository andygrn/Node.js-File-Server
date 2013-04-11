h.doctype('html5'),
h.html([
	h.head([
		h.el('title', c.title),
	]),
	h.body([
		h.el('h1', c.title),
		h.el('ul', c.file_list(h))
	])
])