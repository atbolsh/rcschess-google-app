"""This is the document that is going to display everything."""

LOGGED_OUT_PAGE = "LogInRedirect.html"
NOT_TRUSTED_PAGE = "Rejection.html"
TRUSTED_LIST = ["a.t.bolsh", "d.t.bolsh", "tbolsh", "kbolsh",
		"nspann77", "arvind.0428", "purna.arvind",
		"ljschess"]

MAIN_PAGE = "MainPage.html"
SEARCH = "search.html"
SEARCH_PAR = "search_par.html"
RESULTS = "results.html"
ADD_GAMES = "upload.html"
BROWSE_GAMES = "browse.html"
BROWSE_ONE_DIR = "browse_one_dir.html"
SELECT = "select.html"
PREBOARD = "preboard.html"
BOARD = "board.html"
VIEW = "view.html"
VIEW_LOTS = "view_lots.html"
EDIT = "edit.html"

MAIN_PAGE_URL = 'http://localhost:8080/'

import cgi
import datetime
import urllib
import wsgiref.handlers
import os

import meta as m
import search as s
import formatting as f
#import saving as sa

from google.appengine.ext.webapp import template
from google.appengine.ext import db
from google.appengine.api import users
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app

def url_splitter(url_str):
	"""Splits urls at the '?'"""
	first = ''
	last = ''
	encountered = False
	for ch in url_str:
		if encountered:
			last += ch
		else:
			if ch == '?':
				encountered = True
				last += ch
			else:
				first += ch
	return (first, last)

class Database(db.Model):
	"""The mock of a pgn database. Unfortunately,
	it is impossible to store real files, at least
	from what I can see."""
	name = db.StringProperty(multiline=True)
	content = db.TextProperty()

class WorkList(db.Model):
	"""The working list of games, in meta format."""
	user = db.UserProperty()
	content = db.TextProperty()

def storage_key(storage_name = None):
	return db.Key.from_path("Databases", storage_name or 'default_storage')

def get_database(bases_list, database_name, desired_key):
	"""if the database with that name already exists, returns that
	database. Otherwise, returns a blank database with that name."""
	there = False
	for base in bases_list:
#		print base.name
#		print database_name
		if str(base.name) == database_name:
			d = base
			there = True
	if not there:
#		print 'not there'
		d = Database(parent = desired_key)
		d.name = database_name
		d.content = db.Text('')
	return d

def get_worklist(worklists, desired_key):
	"""If the worklist with the current user already exists,
	returns his worklist. Otherwise, makes a new one for him."""
	there = False
	viewer = users.get_current_user()
	if viewer:
		for worklist in worklists:
			if worklist.user == viewer:
				w = worklist
				there = True
		if not there:
			w = WorkList(parent = desired_key)
			w.user = viewer
			w.content = db.Text('[]')
		return w
	else:
		return None

def base_list(bl, first_part):
	"""From any iterable of databases, returns a list of tuples
	of the databases and the url stub indicating that the new
	base name is base.name"""
	result = []
	for base in bl:
		result.append((base,first_part +  "&" + urllib.urlencode({'base_name': base.name})))
	return result

def test_user(pythonclass, default_page):
	"""Prevents me from having to retype much of the same stuff
	again and again. Returns a tuple of (page to display, link url,
	link text, url_splitter(current url))."""

	viewer = users.get_current_user()
	current = pythonclass.request.uri

	if viewer:
		url = users.create_logout_url(current)
		url_linktext = 'Logout'
#		print viewer.nickname()
		if viewer.nickname() in TRUSTED_LIST:
	 		page = default_page
		else:
			page = NOT_TRUSTED_PAGE
	else:
		url = users.create_login_url(current)
		url_linktext = 'Login'
		page = LOGGED_OUT_PAGE

	return (page, url, url_linktext, url_splitter(current))

class MainPage(webapp.RequestHandler):
	def get(self):
#		print ""
		
		t = test_user(self, MAIN_PAGE)

		search_url = t[3][0] + 'search/' + t[3][1]
		add_url = t[3][0] + 'add/selected/' + t[3][1]
		browse_url = t[3][0] + 'browse/' + t[3][1]
		board_url = t[3][0] + 'preboard/' + t[3][1]

		template_values = {'user_url':t[1], 'user_url_linktext':t[2],
					'search_url': search_url, 'add_url': add_url,
					'browse_url': browse_url, 'board_url': board_url}
		path = os.path.join(os.path.dirname(__file__), t[0])
		global MAIN_PAGE_URL
		MAIN_PAGE_URL = t[3][0] + t[3][1]

		self.response.out.write(template.render(path, template_values))

class SearchPage(webapp.RequestHandler):
	def get(self):
#		print ""
		storage_name = self.request.get('storage_name')
		desired = storage_key(storage_name)
		bases = Database.all().ancestor(desired)

		t = test_user(self, SEARCH)

#		print MAIN_PAGE_URL

		template_values = {'user_url':t[1], 'user_url_linktext':t[2],
				'main_page_url':MAIN_PAGE_URL, 'bases':bases}
		path = os.path.join(os.path.dirname(__file__), t[0])

		self.response.out.write(template.render(path, template_values))

class GetGamesDyno(webapp.RequestHandler):
	def post(self):
#		print ""
		storage_name = self.request.get('storage_name')	
		desired = storage_key(storage_name)
		bases = Database.all().ancestor(desired)
		worklists = WorkList.all().ancestor(desired)

#		var = url_splitter(self.request.uri)[1]
		base_list = []
		for base in bases:
			if self.request.get(str(base.name)) == str(base.name):
				base_list.append(base)
#		print base_names

#		base_list = [base for base in bases if str(base.name) in base_names]

		game_list = []
		for base in base_list:
			game_list += m.codelist(str(base.name), str(base.content))
#		print game_list

		w = get_worklist(worklists, desired)
		w.content = db.Text(str(game_list))
#		print w.content

		w.put()

		self.redirect('/search/parameters/')

class SearchParametersPage(webapp.RequestHandler):
	def get(self):
#		print ""
		t = test_user(self, SEARCH_PAR)

#		base_names = [x.split('=')[1] for x in t[3][1].split('&')]
#		for name in base_names:
#			print name + '</br>'

		storage_name = self.request.get('storage_name')
		desired = storage_key(storage_name)
		bases = Database.all().ancestor(desired)

#		base_list = [base for base in bases if str(base.name) in base_names]
#		print [base.name for base in base_list]
#		urlvar = self.request.get('game_list')
#		print urlvar
#		new = f.from_url(urlvar)
#		print new

#		games = eval(urlvar)
#		for game in game_list:
#			print game + '</br>'

		template_values = {'user_url':t[1], 'user_url_linktext':t[2],
				'main_page_url':MAIN_PAGE_URL}
		path = os.path.join(os.path.dirname(__file__), t[0])

		self.response.out.write(template.render(path, template_values))

class SearchDyno(webapp.RequestHandler):
	def post(self):
#		print ""
		storage_name = self.request.get('storage_name')	
		desired = storage_key(storage_name)
		bases = Database.all().ancestor(desired)
		worklists = WorkList.all().ancestor(desired)

		w = get_worklist(worklists, desired)
#		print w.content

		variablelist = [str(sub.strip()) for sub in self.request.get('parameters').split(';')]
		valuelist = [str(sub.strip()) for sub in self.request.get('values').split(';')]
		gamelist = eval(str(w.content))

		valid = s.searchgames(variablelist, valuelist, gamelist, bases)
#		for game in valid:
#			print game + '</br>'

		w.content = db.Text(str(valid))
		w.put()

		self.redirect('/search/results/')
		
class SearchResultsPage(webapp.RequestHandler):
	def get(self):
#		print ""
		storage_name = self.request.get('storage_name')
		desired = storage_key(storage_name)
		bases = Database.all().ancestor(desired)
		worklists = WorkList.all().ancestor(desired)

#		variablelist = [str(sub.strip()) for sub in self.request.get('parameters').split(',')]
#		valuelist = [str(sub.strip()) for sub in self.request.get('values').split(',')]
#		gamelist = self.request.get('games').splitlines()

#		print variablelist
#		print '</br>'
#		print valuelist
#		print '</br>'
#		for game in gamelist:
#			print game + '</br>'

#		valid = s.searchgames(variablelist, valuelist, gamelist, bases)
		w = get_worklist(worklists, desired)
		if w:
			valid = eval(str(w.content))
		else:
			valid = []

#		print valid
#		print '</br>'

		plain_search_url = url_splitter(MAIN_PAGE_URL)[0] + 'search/'
		iter_search_url = url_splitter(MAIN_PAGE_URL)[0] + 'search/parameters/'
		view_all_url = url_splitter(MAIN_PAGE_URL)[0] + 'viewlots/'
		view_url = url_splitter(MAIN_PAGE_URL)[0] + 'view/'

		t = test_user(self, RESULTS)

		template_values = {'user_url':t[1], 'user_url_linktext':t[2],
				'main_page_url':MAIN_PAGE_URL, 'plain_search_url': plain_search_url,
				'iter_search_url':iter_search_url, 'view_all_url': view_all_url,
				'view_url':view_url,'valid':valid}
		path = os.path.join(os.path.dirname(__file__), t[0])

		self.response.out.write(template.render(path, template_values))

class ViewLotsPage(webapp.RequestHandler):
	def get(self):
#		print ""
		storage_name = self.request.get('storage_name')
		desired = storage_key(storage_name)
		bases = Database.all().ancestor(desired)
		worklists = WorkList.all().ancestor(desired)
		w = get_worklist(worklists, desired)

#		urlvar = self.request.get('game_list')
		if w:
			games = eval(str(w.content))
		else:
			games = []

		output = f.make_html_page(games, bases)

		t = test_user(self, VIEW_LOTS)

		template_values = {'user_url':t[1], 'user_url_linktext':t[2],
				'main_page_url':MAIN_PAGE_URL, 'output':output}
		path = os.path.join(os.path.dirname(__file__), t[0])

		self.response.out.write(template.render(path, template_values))

class SelectDirPage(webapp.RequestHandler):
	def get(self):
		storage_name = self.request.get('storage_name')		
		t = test_user(self, SELECT)

		desired = storage_key(storage_name)
		bases = Database.all().ancestor(desired)

		template_values = {'user_url':t[1], 'user_url_linktext':t[2],
				'main_page_url':MAIN_PAGE_URL, 'bases':bases}

		path = os.path.join(os.path.dirname(__file__), t[0])

		self.response.out.write(template.render(path, template_values))


class UploadPage(webapp.RequestHandler):
	def get(self):
#		print ""
#		BUG!!!!! Does not recognise non-ASKII characters, including russian. To be fixed tomorrow.
		storage_name = self.request.get('storage_name')
		desired = storage_key(storage_name)
		bases = Database.all().ancestor(desired)

		t = test_user(self, ADD_GAMES)
		dir_name = self.request.get('dir_name')

		template_values = {'user_url':t[1], 'user_url_linktext':t[2],
				'main_page_url':MAIN_PAGE_URL, 'dir_name': dir_name,
				'bases':bases}
		path = os.path.join(os.path.dirname(__file__), t[0])

		self.response.out.write(template.render(path, template_values))

class UploadPageDyno(webapp.RequestHandler):
	def post(self):
		storage_name = self.request.get('storage_name')
		desired = storage_key(storage_name)
		bases = Database.all().ancestor(desired)

		d = get_database(bases, self.request.get('base_name'), desired)
#		d.content = db.Text(sa.modify(str(d.content))) + db.Text(sa.modify(self.request.get('content')))

#		Running into problems with the alternate encoding schemes: if the string in the input already contains
#		exotic characters, then the textarea attribute fails miserably and dies, throwing a unicode error.
#		Even before we get to where I can affect the format in any way, askii is already assumed. Same with
#		reading data off: I cannot pass unicode in utf_16 to my functions; they need strings. For now, sticking
#		with askii.

#		print "Before"

		new = f.to_saveformat(self.request.get('content'))

#		print "After"

		d.content += db.Text(new)
#		d.content += db.Text(str(new[:-2]), encoding='utf_16') #The -1 at the end is to strip byte 0x0a, always at the end.
#		The one above are attempts at a happier world, where Russian characters are not prejudiced against. Too much work; focus on html encoding first, then
#		get around to non-askii standards of encoding.

#		print d.content 
		d.put()
#		print d.name + '</br>'
#		print d.content + '</br>'
#		bases = Database.all().ancestor(desired)
#		d = get_database(bases, self.request.get('name'), desired)
#		print d.name + '</br>'
#		print d.content + '</br>'

		self.redirect('/?' + urllib.urlencode({'storage_name': storage_name}))

class BrowsePage(webapp.RequestHandler):
	def get(self):
		storage_name = self.request.get('storage_name')

		t = test_user(self, BROWSE_GAMES)

		desired = storage_key(storage_name)
		bases = Database.all().ancestor(desired)
#		for base in bases:
#			print base.name 
#			print base.content
#		print ""

		template_values = {'user_url':t[1], 'user_url_linktext':t[2],
				'main_page_url':MAIN_PAGE_URL, 'bases':bases}

		path = os.path.join(os.path.dirname(__file__), t[0])

		self.response.out.write(template.render(path, template_values))

class BrowsePageDir(webapp.RequestHandler):
	def get(self):
#		print ""
		storage_name = self.request.get('storage_name')
		base_name = self.request.get('base_name')
#		print ""

		t = test_user(self, BROWSE_ONE_DIR)
#		print ""

		desired = storage_key(storage_name)
		bases = Database.all().ancestor(desired)
#		for base in bases:
#			print base.name

#		print ""

		b = get_database(bases, base_name, desired)
#		print '</br>' + b.name + '</br>'
#		print b.content + '</br>'

#		print ""
#		print str(b.name)
#		print str(b.content)
#		print str(b.content).splitlines(True)
		if b.content == '':
			games = []
		else:
			games = m.codelist(str(b.name), str(b.content))
#			games = m.codelist(b.name, b.content)
#		print str(games)

		view_url = url_splitter(MAIN_PAGE_URL)[0] + 'view/'
		view_lots_url = url_splitter(MAIN_PAGE_URL)[0] + 'viewbase/?' + urllib.urlencode({'base_name':str(b.name)})

		template_values = {'user_url':t[1], 'user_url_linktext':t[2],
				'main_page_url':MAIN_PAGE_URL, 'view_url': view_url,
				'view_lots_url':view_lots_url, 'games':games}

		path = os.path.join(os.path.dirname(__file__), t[0])

		self.response.out.write(template.render(path, template_values))	

class ViewPage(webapp.RequestHandler):
	def get(self):
#		print ""
		t = test_user(self, VIEW)
	
		storage_name = self.request.get('storage_name')
		game_name = self.request.get('game_name')

#		print ""
#		print game_name

		desired = storage_key(storage_name)
		bases = Database.all().ancestor(desired)
#		print str(type(game_name))
		r = m.read(game_name)
#		print ""		
		
		b = get_database(bases, r[0], desired)

		game = f.to_html(m.game(str(b.content), r[1]))

		var_url = urllib.urlencode({'base_name':r[0], 'index':str(r[1])})
		board_url = "/board/?" + var_url
		edit_url = "/edit/?" + var_url

#		print game

		template_values = {'user_url':t[1], 'user_url_linktext':t[2],
				'main_page_url':MAIN_PAGE_URL, 'game':game,
				'board_url':board_url, 'edit_url':edit_url}
		path = os.path.join(os.path.dirname(__file__), t[0])

		self.response.out.write(template.render(path, template_values))

class ViewBasePage(webapp.RequestHandler):
	def get(self):
#		print ""
		storage_name = self.request.get('storage_name')
		base_name = self.request.get('base_name')

		desired = storage_key(storage_name)
		bases = Database.all().ancestor(desired)

		b = get_database(bases, base_name, desired)
		output = f.make_html_page(m.codelist(str(b.name), str(b.content)), bases)

		t = test_user(self, VIEW_LOTS)

		template_values = {'user_url':t[1], 'user_url_linktext':t[2],
				'main_page_url':MAIN_PAGE_URL, 'output':output}
		path = os.path.join(os.path.dirname(__file__), t[0])

		self.response.out.write(template.render(path, template_values))


class EditPage(webapp.RequestHandler):
	def get(self):
#		print ""
		storage_name = self.request.get('storage_name')
		base_name = self.request.get('base_name')
		index = self.request.get('index')

		desired = storage_key(storage_name)
		bases = Database.all().ancestor(desired)

		b = get_database(bases, base_name, desired)
		game = m.game(str(b.content), int(index))

		t = test_user(self, EDIT)

		template_values = {'user_url':t[1], 'user_url_linktext':t[2],
				'main_page_url':MAIN_PAGE_URL, 'game':game,
				'base_name':base_name, 'index':index}
		path = os.path.join(os.path.dirname(__file__), t[0])

		self.response.out.write(template.render(path, template_values))

class EditPageDyno(webapp.RequestHandler):
	def post(self):
#		print ""
		storage_name = self.request.get('storage_name')
		desired = storage_key(storage_name)
		bases = Database.all().ancestor(desired)

		d = get_database(bases, self.request.get('base_name'), desired)
		ind = int(self.request.get('index'))

		game = f.to_saveformat(self.request.get('game'), True)
		old = str(d.content)
		new = f.save_game(old, ind, game)

		d.content = db.Text(new)
		d.put()

		self.redirect('/?' + urllib.urlencode({'storage_name': storage_name}))		

class BoardPage(webapp.RequestHandler):
	def get(self):
#		print ""
		storage_name = self.request.get('storage_name')
		base_name = self.request.get('base_name')
		index = self.request.get('index')

		desired = storage_key(storage_name)
		bases = Database.all().ancestor(desired)

		b = get_database(bases, base_name, desired)
		game = m.game(str(b.content), int(index))

		t = test_user(self, BOARD)

		template_values = {'user_url':t[1], 'user_url_linktext':t[2],
				'main_page_url':MAIN_PAGE_URL, 'game':game,
				'base_name':base_name, 'index':index}
		path = os.path.join(os.path.dirname(__file__), t[0])

		self.response.out.write(template.render(path, template_values))

class PreBoardPage(webapp.RequestHandler):
	def get(self):
#		print ""
		storage_name = self.request.get('storage_name')
		desired = storage_key(storage_name)
		bases = Database.all().ancestor(desired)

		t = test_user(self, PREBOARD)
		
		template_values = {'user_url':t[1], 'user_url_linktext':t[2],
				'main_page_url':MAIN_PAGE_URL, 'bases':bases,
				'tail':[str(x) for x in range(5)]}
		path = os.path.join(os.path.dirname(__file__), t[0])

		self.response.out.write(template.render(path, template_values))

class PreBoardPageDyno(webapp.RequestHandler):
	def post(self):
#		print ""
#		print "</br>"
#		print self.request.get('base_name')
		storage_name = self.request.get('storage_name')
		desired = storage_key(storage_name)
		bases = Database.all().ancestor(desired)

		name = self.request.get('base_name')

		d = get_database(bases, name, desired)

		r = self.request.get('Result').strip()
		if r not in ('0-1', '1-0','*'):
			r = '*'
		
		w = self.request.get('White').strip() or '???????'
		b = self.request.get('Black').strip() or '???????'
		date = self.request.get('Date').strip() or '??.??.????'
		e = self.request.get('Event').strip() or '???????'

		def make(par):
			return '[' + par[0] + ' "' + par[1] + '"]'
		ending = [make(("Event", e)), make(("Date", date)), make(("White", w)), make(("Black", b)), make(("Result", r))]

		for i in range(5):
			f = self.request.get("first" + str(i)).strip()
			s = self.request.get("second" + str(i)).strip()
			if (f and s):
				ending.append(make((f, s)))

		ending.append('')
		ending.append(r)

		game = '\r\n'.join(ending) + '\r\n'

#		new = f.to_saveformat(self.request.get('content'))

#		game = f.to_saveformat(self.request.get('game'), True)
#		old = str(d.content)
#		new = f.save_game(old, ind, game)

#		d.content = db.Text(new)
#		d.put()

#		print ""
#		print d

		d.content += db.Text(game)

		d.put()

		d = get_database(bases, name, desired)
		ind = str(len(m.codelist(name, str(d.content)))-1)

		self.redirect('/board/?' + urllib.urlencode({'base_name': name, 'index': ind}))

application = webapp.WSGIApplication([
	('/', MainPage),
	('/search/', SearchPage),
	('/getgames/', GetGamesDyno),
	('/search/parameters/', SearchParametersPage),
	('/search/dyno/', SearchDyno),
	('/search/results/', SearchResultsPage),
	('/viewlots/', ViewLotsPage),
	('/add/', SelectDirPage),
	('/add/selected/', UploadPage),
	('/add/selected/uploading/', UploadPageDyno),
	('/browse/', BrowsePage),
	('/browse/choosing/', BrowsePageDir),
	('/view/', ViewPage),
	('/viewbase/', ViewBasePage),
	('/edit/', EditPage),
	('/edit/saving/', EditPageDyno),
	('/board/', BoardPage),
	('/preboard/', PreBoardPage),
	('/preboard/saving/', PreBoardPageDyno)])

def main():
  run_wsgi_app(application)


if __name__ == '__main__':
  main()
