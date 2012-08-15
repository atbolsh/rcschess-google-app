"""Metadata of database"""

SHOW = ["Event", "Site", "Date", "Round", "White", "Black", "Result", "Opening"]
STORED = "databases"

import search
import formatting as f

def parseparameter(s):
	"""interprets the headers of pgn games"""
	x = s.find('"')
	first = f.to_url(s[1:(x - 1)])
	second = f.to_url(s[x + 1: -3])
	return (first, second)

def output(x):
	return x[0] + ":" + x[1][:-1] + "||" #The reason for the [:-1] is that google was adding a "" after each parameter. Don't know why.

def code(game, filename, ind, important = SHOW):
	"""returns the code of a game, given the filename and its place therein."""
	end = output(("database", filename))
	for line in game.split("\n"):
		if line == "\r":
			break
		else:
			new = parseparameter(line + "\n")
			if new[0] in important:
				end += output(new)
	end += output(("id", str(ind))) + "\r\n"
	return end

def codelist(basename, stringbase, variablelist = None, valuelist = None, directory = STORED, important = SHOW):
	"""Returns a list of the id's of all games in stringbase"""
#	Only 'big' function that actually works so far, due to the change from a normal file system to google 'instances'
	f = stringbase.splitlines(True)
	last = ""
	newgame = False
	default = output(("database", basename + " "))#necessary due to 'output' aberation
	if variablelist == None:
		worthy = True
		normal = True
	else:
		worthy = False
		normal = False
		desired = search.permute(variablelist, valuelist)
	counter = 0
	goal = []
	last = default
	for line in f: #Don't like this change, but whatever. Go with the flow. (After copy and paste, extra "\r\n" after each line).
#		line = f[i]
		if line == "\r\n":
			newgame = True
		elif newgame and line[0] == "[":
			last  += output(("id", str(counter) + " "))#Same aberation as above
			if worthy:
				goal.append(last)
			counter  += 1
			last = default
			newgame = False
			if not normal:
				worthy = False
		if not newgame:
			new = parseparameter(line)
			if not normal:
				if new in desired:
					worthy = True
			if new[0] in important:
				last += output(new)
#	f.close()
	last  += output(("id", str(counter) + " "))#Same aberation as above
	if worthy:
		goal.append(last)
	return goal

def read(coded):
	"""Gets the database name and the index from the output spew of a
	line of "codelist"."""
	important = False
	basename = ""
	ind = ""
	for ch in coded:
		if important:
			if ch == "|":
				break
			basename += ch
		if ch == ":":
			important = True
	for i in range(-3, - len(coded), -1): #Change to -3 vs -5 due to conversion to url and back; trailing \r\n lost.
		if coded[i] == ":":
			break
		ind += coded[i]
	return (f.from_url(basename), int(ind[::-1]))

def game(stringbase, ind, directory = STORED):
	"""Returns the game from the file with the specified index"""
	f = stringbase.splitlines(True)
	goal = ""
	newgame = False
	counter = 0
	for line in f:
#		line = f[i]
		if line == "\r\n":
			newgame = True
		elif newgame and line[0] == "[":
			if counter == ind:
				return goal
			newgame = False
			counter += 1
		if counter == ind:
			goal += line
#	f.close()
	if counter == ind:
		return goal


