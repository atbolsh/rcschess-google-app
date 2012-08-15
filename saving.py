def everyother(l, evenind = True):
	"""Returns a list with every other element
	of the list l. if evenind = True, returns
	indeces 0, 2, 4, ... otherwise, returns
	1, 3, 5, ..."""
	x = evenind
	result = []
	for el in l:
		if x:
			result.append(el)
		x = not x
	return result

def modify(s):
	"""Checks for common errors with the input
	after copy and paste onto the web."""
	l = s.splitlines(True)
	try:
		if l[1] in ('\r\n', '\n', '</br>'):
			l = everyother(l)
	except IndexError:
		pass
	try:
		if l[-1] not in ('\r\n', '\n', '</br>'):
			l.append('\r\n')
	except IndexError:
		pass
	return ''.join(l)
