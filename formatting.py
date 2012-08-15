"""This got annoying, so I am now making a special module
for url-format/html compatibility."""

BOLVANKA = '[Placeholder "Not a game"]\r\n[Please "Don\'t skip lines"]\r\n\r\n'

import meta

def everyother(l, evenind = True):
	"""Returns a list with every other element
	of the list l. if evenind = True, returns
	indeces 0, 2, 4, ... otherwise, returns
	1, 3, 5, ...  . Helper function to
	to_saveformat"""
	x = evenind
	result = []
	for el in l:
		if x:
			result.append(el)
		x = not x
	return result

def firstgame(listbase):
	"""Returns the first game (as a list of lines)
	from a database given as a list of lines.
	Helper to to_saveformat."""
	result = []
	newgame = False
	for line in listbase:
		if line in ('\r\n', '\n', '</br>'):
			newgame = True
		if newgame and line[0] == "[":
			break
		result.append(line)
	return result

def to_saveformat(s, saving = False):
	"""Checks for common errors with the input
	after copy and paste onto the web."""
	l = s.splitlines(True)
	try:
		if l[1] in ('\r\n', '\n', '</br>'):
			l = everyother(l)
	except IndexError:
		pass
	if '[' not in s:
		l.insert(0, BOLVANKA)
	if saving:
		l = firstgame(l)
	try:
		if l[-1] not in ('\r\n', '\n', '</br>'):
			l.append('\r\n')
	except IndexError:
		pass
	return ''.join(l)

def to_url(s):
	"""makes a string url-presentable"""
	new = ''
	for ch in s:
		if ch == ' ':
			new += '_'
		else:
			new += ch
	return new

def from_url(s):
	"""reverses the operation of to_url"""
	new = ''
	for ch in s:
		if ch == '_':
			new += ' '
		else:
			new += ch
	return new

def to_html(s):
	"""transforms the string into a block
	of html-formatted text."""
	new = ''
	for ch in s:
		if ch == '\r':
			pass
		elif ch == '\n':
			new += '</br>'
		elif ch == '&':
			new += '&amp;'
		elif ch == '"':
			new += '&quot;'
		elif ch == '<':
			new += '&lt;'
		elif ch == '>':
			new += '&gt;'
		elif ch == '{':
			new += '&#123;'
		elif ch == '}':
			new += '&#125;'
		elif ch == '%':
			new += '&#37;'
		else:
			new += ch
	return new

def save_game(stringbase, ind, game):
	"""Saves the game to the index in the base."""
	f = stringbase.splitlines(True)
	newgame = False
	before = ""
	after = ""
	counter = 0
	for line in f:
#		line = f[i]
#		print counter
		if line in ('\r\n', '\n', '</br>'):
			newgame = True
		if newgame and line[0] == "[":
			newgame = False
			counter += 1
		if counter < ind:
			before += line
		if counter > ind:
			after += line
#	f.close()
#	print before
#	print "+++++++"
#	print after
	return before + game + after

def make_html_page(metagamelist, bases):
	"""Turns a list of games (in their meta
	format) into an html page showing all
	of the games."""
	result = set([])
	for metagame in metagamelist:
		new = meta.read(metagame)
		for base in bases:
			if str(base.name) == new[0]:
				break
		result.add(meta.game(str(base.content), new[1]))
	return to_html(''.join(list(result)))


