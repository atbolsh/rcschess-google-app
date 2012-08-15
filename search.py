"""This is the first module; it involves reading and searching png files in a file system"""

import os
import meta

def itergames(filename):
	"""A generator for the games in a large png file."""
	f = open(filename, "r")
	last = ""
	newgame = False
	for line in f:
		if line == "\r\n":
			newgame = True
		elif newgame and line[0] == "[":
			yield last
			last = ""
			newgame = False
		last += line
	f.close()
	yield last

def format(s, t):
	return "[" + s + " \"" + t + "\"]\r\n"

def permute(l, m, f = lambda x, y : (x, y)):
	"""takes all elements in l and m, and returns a 
	tuple with all possible f(x, y), x in l, y in m"""
	result = []
	for x in l:
		for y in m:
			result.append(f(x, y))
	return tuple(result)

def test(game, accepted):
	"""tests a single, string game againsted an accepted
	tuple of things at the top."""
	x = False
	for line in game.splitlines(True):
		if (line in ('\r\n', '\n', '</br>')) or x:
			break
		else:
			x = (line in accepted)
	return x

def searchgames(variablelist, valuelist, gamelist, bases):
	"""A generator for all the games in a list of files
	in which any given variable has given value
	(e.g. "White", "Dennis Bolshakov")"""
#	if filename.endswith(".pgn"):
#		f = open(directory + filename, "r")
#		desired = permute(variablelist, valuelist, format)
#		last = ""
#		newgame = False
#		worthy = False
#		for line in f:
#			if line[1] == "\n":
#				newgame = True
#			if newgame and line[0] == "[":
#				if worthy:
#					yield last
#				last = ""
#				newgame = False
#				worthy = False
#			if line in desired:
#				worthy = True
#			last += line
#		f.close()
#		if worthy:
#			yield last
#	f = open(directory + filename, "r")
	desired = permute(variablelist, valuelist, format)
	result = []
	for metagame in gamelist:
		new = meta.read(metagame)
		for base in bases:
			if str(base.name) == new[0]:
				break
		game = meta.game(str(base.content), new[1])
		if test(game, desired):
			result.append(metagame)
	return result
	
def resultname(store = True):
	if store:
		return "Search" + str(len(os.listdir("results/"))) + ".pgn"
	else:
		return "Search" + str(len(os.listdir("results/")))

def search(variablelist, valuelist, store = True, filelist = None, directory = "databases/"):
	"""This returns a pgn file with all the games satisfying the search"""
	if filelist == None:
		filelist = os.listdir("databases/")
	s = open("results/" + resultname(store), "w")
	if store:
		for filename in filelist:
			for game in searchgames(variablelist, valuelist, filename, directory):
				s.write(game)
	else:
		for filename in filelist:
			for game in meta.codelist(filename, variablelist, valuelist, directory):
				s.write(game)
	s.close()


