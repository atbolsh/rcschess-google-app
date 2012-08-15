/*The purpose of this module is to provide all of the back work for the main module;
checking the validity of moves, for instance. The main module is to deal with errors
(invalid moves), and deal with them in different ways depending on whether it is a
notation error or a wrong move of the hand. It is purely a matter of logic; no DOM,
no events appear here. This is the back work; the rest provides the bling.*/

//start initialization of game variables

var officers = "NBQRK";

var horz = "abcdefgh";
var vert = "12345678";

var base_piece = function(){
	/* This is a piece. 'office' describes
	which piece this is; all pieces are described
	by their chess notation abbreviation; pawns
	are blank strings*/
	this.color = arguments[0];
	this.office = arguments[1];
	this.square = arguments[2];
	this.firstmove = arguments[3];
	/*
	This last parameter may confuse you, as different pieces use it differently.
	It is only defined for kings, rooks, and pawns, as castling and en passant are
	the only moves where previous moves matter. For pawns, immediately after a move
	by two forward, this parameter switches to 1, and returns to 0 the next move.
	For kings and rooks, it remains at one forever after they have moved.
	*/
}

// Start initialization of all the live pieces at the start of the game.

var live = [];
reset();

var toMove = 'W';
var error = false;

function reset(){
	toMove = 'W';
	error = false;
	live = []
	for(i = 0; i < 8; i++){
		live[live.length] = new base_piece('W','',horz.charAt(i) + '2', 0);
	};
	
	live[live.length] = new base_piece('W', 'R', 'a1', 0);
	live[live.length] = new base_piece('W', 'R', 'h1', 0);
	live[live.length] = new base_piece('W', 'N', 'b1');
	live[live.length] = new base_piece('W', 'N', 'g1');
	live[live.length] = new base_piece('W', 'B', 'c1');
	live[live.length] = new base_piece('W', 'B', 'f1');
	live[live.length] = new base_piece('W', 'Q', 'd1');
	live[live.length] = new base_piece('W', 'K', 'e1', 0);
	
	for(i = 0; i < 8; i++){
		live[live.length] = new base_piece('B','',horz.charAt(i) + '7', 0);
	};
	
	live[live.length] = new base_piece('B', 'R', 'a8', 0);
	live[live.length] = new base_piece('B', 'R', 'h8', 0);
	live[live.length] = new base_piece('B', 'N', 'b8');
	live[live.length] = new base_piece('B', 'N', 'g8');
	live[live.length] = new base_piece('B', 'B', 'c8');
	live[live.length] = new base_piece('B', 'B', 'f8');
	live[live.length] = new base_piece('B', 'Q', 'd8');
	live[live.length] = new base_piece('B', 'K', 'e8', 0);
};
//End initialization of all the live pieces at the start of the game.

//end initialization of game variables.

function piece_on(place, l){
	/*Given a chess square, returns the piece (via index in live) on 
	that square. If square is
	empty, returns null*/
	for(var i= 0; i < l.length; i ++){
		if (l[i].square == place){
			return i;
		};
	};
	return null;
};

function add_right(place, num){
	/*Given a place on a chess board (eg "e3")
	and a number of spaces to go to the right
	(eg -1) returns the place that many to the
	right, or null if place null or end place off board.*/
	if(place){
		var index = horz.indexOf(place.charAt(0)) + num;
		if((-1<index)&&(index<8)){
			var col = horz.charAt(index);
			var row = place.charAt(1);
			return col + row
		};
	};
	return null;
};

function add_up(place, num){
	/*Given a place on a chess board (eg "e3")
	and a number of spaces to go up
	(eg -1) returns the place that many to the
	right, or null if place null or end place off board.*/
	if(place){
		var row = +place.charAt(1) + num + '';
		if((0<row)&&(row<9)){
			var col = place.charAt(0);
			return col + row;
		};
	};
	return null;
};

function comp(place1, place2){
	/*Given two chess squares, returns
	the vertical and horizantal displacement
	from place1 to place2*/
	return [horz.indexOf(place2.charAt(0)) - horz.indexOf(place1.charAt(0)),
		(+place2.charAt(1)) - (+place1.charAt(1))];
};

function get_officer(){
	/* Given the office (place 1), a square to go to (place 2), an optional
	identifier (place 3; such as f, or g, if two of the same officers
	can reach the same square), and an optional color (defaults to to_move),
	if the move is legal, finds the index in live of the piece to move,
	and the index of the piece to be taken. Otherwise, changes error to true.
	This, as well as get_pawn, is for reading off notation already present.*/
	var l = arguments[0];
	var o = arguments[1];
	var s = arguments[2];
	var id = arguments[3]? arguments[3] : '';
	var c = arguments[4] || toMove;

	var q = piece_on(s, l);
	if (q != null){
		if (l[q].color == c){

			return undefined;
		};
	};
	var result = [];

	var t = function(p){
		/*Tests whether or not it is the one. */
		return ((l[p].office == o)&&(l[p].color == c)&&(l[p].square.indexOf(id)>-1))
	};

	if (o == 'N'){
		var disp1 = [-2, 2];
		var disp2 = [-1, 1];
		for(var i = 0; i < 2; i ++){
			for(var j = 0; j < 2; j ++){
                                //console.log([i, j]);
				var newmoves = [add_up(add_right(s, disp1[i]), disp2[j]),
						add_right(add_up(s, disp1[i]), disp2[j])];
				for(k in newmoves){
                                        //console.log(newmoves[q]);
					if(newmoves[k]){
                                                //console.log('Hello\n');
						var p = piece_on(newmoves[k], l);
						if (p !== null){
							if (t(p)){
								result[result.length] = [p, q];
							};
                                                };				
					};
				};
			};
		};
	}

	else if(o == 'K'){
		for(i = -1; i < 2; i ++){
			for(j = -1; j < 2; j ++){
				//The reason that we test (0, 0) is because we know
				//that spot is filled with a 'piece of the same color'
				//and so will be rejected.
				var newmove = add_up(add_right(s, i), j);
				if(newmove){
					var p = piece_on(newmove, l);
                                        //console.log(p);
					if (p !== null){
						if (t(p)){
							result[result.length] = [p, q];
						};
                                        };				
				};
			};
		};
		//Enter the castling code.
		if(!q){
			//document.body.appendChild(document.createTextNode("1"));
			var file = c == 'W'? '1' : '8';
			if((s == 'c' + file)||(s == 'g' + file)){
				//document.body.appendChild(document.createTextNode("2"));
				var k = 'e' + file;
				var r = ((s.charAt(0) == 'c')? 'a' : 'h') + file;
				var inter =  ((s.charAt(0) == 'c')? 'd' : 'f') + file;
				var K = piece_on(k, l);
				var R = piece_on(r, l);
				var EVIL = piece_on(inter, l);
				if((EVIL == null)&&(K != null)&&(R != null)){
					//document.body.appendChild(document.createTextNode("3"));
					if((l[K].office == 'K')&&(l[K].color == c)&&(!l[K].firstmove)&&(l[R].office == 'R')&&(l[R].color == c)&&(!l[R].firstmove)){
						//document.body.appendChild(document.createTextNode("4"));
						var otherc = c == 'W'? 'B' : 'W';
	
						var x = get_officer(l, 'N', k, null, otherc)
							+ get_officer(l, 'R', k, null, otherc)
							+ get_officer(l, 'B', k, null, otherc)
							+ get_officer(l, 'Q', k, null, otherc)
							+ get_officer(l, 'K', k, null, otherc)
							+ get_pawn(l, 'x', k, null, otherc);
	
						var y = get_officer(l, 'N', inter, null, otherc)
							+ get_officer(l, 'R', inter, null, otherc)
							+ get_officer(l, 'B', inter, null, otherc)
							+ get_officer(l, 'Q', inter, null, otherc)
							+ get_officer(l, 'K', inter, null, otherc)
							+ get_pawn(l, 'x', inter, null, otherc);

						if((!x)&&(!y)){
							//document.body.appendChild(document.createTextNode("5"));
							result[result.length] = [K, null];
						};
					};
				};
			};
		};
	}

	else if (o == 'R'){
		for(i = 0; i < 4; i ++){
			if (i<2){
				var f = add_up;
			}
			else{
				var f = add_right;
			};
			var ind = ((i % 2)*2)-1;
			var m = f(s, ind);
			while(m){
				var p = piece_on(m, l);
				if (p === null){
					m = f(m, ind);
				}
				else{
					if (t(p)){
						result[result.length] = [p, q];
					};
					break;
				};
			};
		};
	}

	else if (o == 'B'){
		for (i = 0; i < 4; i ++){
			var hind = ((i % 2)*2)-1;
			var vind = (Math.floor(i / 2)*2)-1;
			//console.log([hind, vind]);
			var m = add_up(add_right(s, hind), vind);
			while(m){
				var p = piece_on(m, l);
				if (p === null){
					m = add_up(add_right(m, hind), vind);
				}
				else{
					if (t(p)){
						result[result.length] = [p, q];
					};
					break;
				};
			};
		};
	}

	else if (o == 'Q'){
		for (i = 0; i < 4; i ++){
			var hind = ((i % 2)*2)-1;
			var vind = (Math.floor(i / 2)*2)-1;
			if (i<2){
				var f = add_up;
			}
			else{
				var f = add_right;
			};
			var ind = ((i % 2)*2)-1;
			//console.log([hind, vind]);
			var m = add_up(add_right(s, hind), vind);
			while(m){
				var p = piece_on(m, l);
				if (p === null){
					m = add_up(add_right(m, hind), vind);
				}
				else{
					if (t(p)){
						result[result.length] = [p, q];
					};
					break;
				};
			};
			var m = f(s, ind);
			while(m){
				var p = piece_on(m, l);
				if (p === null){
					m = f(m, ind);
				}
				else{
					if (t(p)){
						result[result.length] = [p, q];
					};
					break;
				};
			};
		};
	};

	if(result.length>0){
		return result;
	}

	return undefined;
};

function get_pawn(){
	/*Does the same thing for footsoldiers as get_officer for officers,
	but with different parameters. This time, the 0th parameter is the
	type of move ('' for plain, 'x' for take)
	the 1st is the square, the 2nd is the optional identifier, and the
	3rd is the color, defaulting to toMove. */

	var l = arguments[0];
	var t = arguments[1];
	var s = arguments[2];
	var id = arguments[3]? arguments[3] : '';
	var c = arguments[4] || toMove;

	var result = [];

	if (t == ''){

		var q = piece_on(s, l);

		//console.log(q);

		if(q !== null){
			//console.log('Hello');
			return undefined;
		};

		var direction = 2*(c == 'B') - 1;
		//console.log(direction);

		var t = function(p){
			/*Tests whether or not it is the one. */
			return ((l[p].office == '')&&(l[p].color == c)&&(l[p].square.indexOf(id)>-1))
		};

		var f = piece_on(add_up(s, direction), l);
		//console.log(f);

		if(f !== null){
			if(t(f)){
				result[result.length] = [f, q];
			};
		}
		else if((s.charAt(1) == (c == 'W'? '4':'5'))){
			var w = piece_on(add_up(s, 2*direction), l);
			if(w !== null){
				if(t(w)){
					result[result.length] = [w, q];
				};
			};
		};

		if(result.length>0){
			return result;
		}
		return undefined;
	}

	else if (t == 'x'){

		//console.log('Hello');

		var direction = 2*(c == 'B') - 1;

		var q = piece_on(s, l);

		//console.log(q);

		if (q === null){
			q = piece_on(add_up(s, direction), l);
			var n = true;
			if (q !== null){
				if ((l[q].color != c)&&(l[q].firstmove == 1)){
					n = false;
				};
			};
			if(n){
				return undefined;
			};
			//This rather ugly part of the code deals with en passant.
		}
		else if (l[q].color == c){
			return undefined;
		};

		var t = function(p){
			/*Tests whether or not it is the one. */
			return ((l[p].office == '')&&(l[p].color == c)&&(l[p].square.indexOf(id)>-1))
		};

		//console.log(t(4));

		for(var i = -1; i < 2; i += 2){
			p = piece_on(add_up(add_right(s, i), direction), l);
			//console.log(p);
			if(p !== null){
				if (t(p)){
					result[result.length] = [p, q];
				};
			};
		};
		if(result.length>0){
			return result;
		}
		return undefined;

	};		

};

function test(position, color){
	/* Tests for illegalities in a new position (such as check to the
	party not moving). If found, returns false; true otherwise.*/
	var c = color || toMove;
	var k = c == 'W'? 'B':'W';
	for(var i = 0; i < position.length; i ++){
		if((position[i].color == c)&&(position[i].office == 'K')){
			var p = position[i].square;
			break;
		};
	};

	var x = get_officer(position, 'N', p, null, k)
		+ get_officer(position, 'R', p, null, k)
		+ get_officer(position, 'B', p, null, k)
		+ get_officer(position, 'Q', p, null, k)
		+ get_officer(position, 'K', p, null, k)
		+ get_pawn(position, 'x', p, null, k);

	return !x;
			
};
/*
var newlive = [new base_piece('W', 'R', 'd1'), new base_piece('W', 'K', 'e1'), new base_piece('B', 'Q', 'a1')];
document.body.appendChild(document.createTextNode(test(newlive)))
live = [new base_piece('W', 'R', 'd2'), new base_piece('W', 'K', 'e1'), new base_piece('B', 'Q', 'a1')];
move('d1', 0);
renderBoard();
*/
function validMove(piece, place){
	/*Checks whether or not the given piece (an index in live)
	can move to the square. If it can, returns the standard array
	of the index to move and the index to die, as well as the notated
	move that describes the event (sans check). If not, returns null.*/
	if (live[piece].office){
		g = get_officer(live, live[piece].office, place);
		//result = g? true : false;
	}
	else {
		g = get_pawn(live, '', place);
		g = g? g : get_pawn(live, 'x', place);
		//result = g? true: false;
	};
	/*if(g){
		return g[0];
	}*/
	if(!g){
		return undefined;
	};
	for(var i = 0; i < g.length; i ++){
		if(g[i][0]==piece){
			break;
		}
	};
	if(i == g.length){
		return undefined;
	}
	if(g[0][1]){
		var t = 'x';
	}
	else{
		var t = '';
	}
	if(g.length == 1){
		var id = '';
	}
	else{
		var onfile = false;
		for(var j = 0; j < g.length; j ++){
			if(j != i){
				if(live[g[j][0]].square.charAt(0) == live[piece].square.charAt(0)){
					onfile = true;
				}
			}
		}
		if(onfile){
			var id = live[piece].square;
		}
		else{
			var id = live[piece].square.charAt(0);
		}
	}
	var m = live[piece].office + id + t + place;
	g[i][2] = m;
	//console.log(m);
	return g[i];
};

function move(place, ind_of, ind_gone, m, promote){
	/*Given the index (in live) of the piece that is moving,
	the piece that is being taken (ignored if out of range),
	the annotated move so far (sans check),
	and the square, performs all of the necessary operations.
	The final is the piece of promotion. Returns the complete
	annotated move that describes the event.*/
	//ind_gone = ind_gone === null? -1: ind_gone;
	promote = promote || 'Q';
	var newlive = [];
	for(var i = 0; i < live.length; i ++){
		var p = live[i];
		if (i == ind_of){
			//console.log(((!p.office)&&(Math.abs(comp(p.square, place)[1]) == 2))? 1 : 0);
			var newplace;
			if ((p.office == 'K') && (Math.abs(comp(p.square, place)[0]) == 2)){
				var castling = true;
			}
			else{
				var castling = false;
			};
			if((p.office == 'R') || (p.office == 'K')){
				newplace = 1;
			}
			else if((!p.office)&&(Math.abs(comp(p.square, place)[1]) == 2)){
				newplace = 1;
			}
			else{
				newplace = 0;
			};
			if((p.office == '')&&(place.charAt(1) == (p.color == 'W'? '8' : '1'))){
				shouldPromote = true;
			}
			else{
				shouldPromote = false;
			}
			newlive[newlive.length] = new base_piece(p.color, shouldPromote? promote : p.office,
								place, newplace);
		}
		else if (i !== ind_gone){
			newlive[newlive.length] = new base_piece(p.color, p.office, p.square, (p.firstmove&&!(p.office)) == 1? 0 : p.firstmove)
		};
	};
	/*for(i = 0; i < newlive.length; i ++){
		document.body.appendChild(document.createTextNode(newlive[i].office));
		document.body.appendChild(document.createTextNode(newlive[i].color));
		document.body.appendChild(document.createTextNode(newlive[i].square));
		document.body.appendChild(document.createTextNode('</br>'));
	}
	document.body.appendChild(document.createTextNode(test(newlive)));*/
	if (test(newlive)){
		live = newlive;
		if (castling){
			m = place.charAt(0) == 'c'? 'O-O-O' : 'O-O';
			var file = toMove == 'W'? '1' : '8';
			var r = place.charAt(0) == 'c'? 'a' + file : 'h' + file;
			var R = piece_on(r, live);
			var inter = place.charAt(0) == 'c'? 'd' + file : 'f' + file;
			move(inter, R);
		}
		else{
			toMove = toMove == 'W'? 'B' : 'W';
		};
	
		if(shouldPromote){
			m += '=' + promote;
		}
		if (test(live)){
			return m;
		}
		else{
			return m + '+';
		}
	}
	return undefined;
	/*else{
		error = true
	};*/
};
/*
function peel(m){
	/* Takes a notated move and parses it into the important things, then moves. 

	//At present, does not work; fix soon.
	
	if(officers.indexOf(m.charAt(0) > -1)){
		//If this is a piece we are talking about.
		var o = m.charAt(0);
		if(vert.indexOf(m.charAt(-1) > -1)){
			var s = m.substr(-2);
		}
		else{
			var s = m.substr(-3, -1);
		};
		var id = m.substr(1, 3);
		if((horz.indexOf(id.charAt(0)) == -1)||(vert.indexOf(id.charAt(1)) == -1)||(id == s)){
			id = '';
		};
		g = get_officer(o, s, id);
	}

	else{
		if(m.indexOf('x') != -1){
			var t = 'x';
			var parts = m.split('x');
			var id = parts[0];
			var s = parts[1].substr(0, 2);

		}
		else{
			var t = '';
			var id = '';
			var s = m.substr(0, 2);
		};
		g = get_pawn(t, s, id);
	};

	if(g){
		move(s, g[0], g[1]);
	};
};
*/			
	
/*
function all_valid(piece){
	/*Returns all of the valid moves a piece has;
	here, a piece is an object with an office
	(K, Q, N, etc.), a place and a color(W or B).

	var moves = {};

/*	if (piece.color != to_move){
		return moves;
	};

	//Above commented out because we will still use this function to test for check,
	//even if it is not the turn of the color. That type of detail will be taken care
	//of by the function that actually generates a move, or throws an error.    
	if (piece.office == 'N'){
		var disp1 = [-2, 2];
		var disp2 = [-1, 1];
		for(var i = 0; i < 2; i ++){
			for(var j = 0; j < 2; j ++){
                                //console.log([i, j]);
				var newmoves = [add_up(add_right(piece.square, disp1[i]), disp2[j]),
						add_right(add_up(piece.square, disp1[i]), disp2[j])];
				for(q in newmoves){
                                        //console.log(newmoves[q]);
					if(newmoves[q]){
                                                //console.log('Hello\n');
						var p = piece_on(newmoves[q]);
						if (! p){
							moves[newmoves[q]] = null;
						}
						else if	(live[p].color != piece.color){
							moves[newmoves[q]] = p;
                                                };				
					};
				};
			};
		};
		return moves;
	};

	if(piece.office == 'K'){
		for(i = -1; i < 2; i ++){
			for(j = -1; j < 2; j ++){
				//The reason that we test (0, 0) is because we know
				//that spot is filled with a 'piece of the same color'
				//and so will be rejected.
				var newmove = add_up(add_right(piece.square, i), j);
				if(newmove){
					var p = piece_on(newmove);
                                        //console.log(p);
					if (!p){
						moves[newmove] = null;
					}
					else if (live[p].color != piece.color){
						moves[newmove] = p;
					};
				};
			};
		};
		return moves;
	};

	if (piece.office == 'R'){
		for(i = 0; i < 4; i ++){
			if (i<2){
				var f = add_up;
			}
			else{
				var f = add_right;
			};
			var ind = ((i % 2)*2)-1;
			var s = f(piece.square, ind);
			while(s){
				var p = piece_on(s);
				if (!p){
					moves[s] = null;
					s = f(s, ind);
				}
				else if (live[p].color != piece.color){
					moves[s] = p;
					break;
				}
				else{
					break;
				};
			};
		};
		return moves;
	};

	if (piece.office == 'B'){
		for (i = 0; i < 4; i ++){
			var hind = ((i % 2)*2)-1;
			var vind = (Math.floor(i / 2)*2)-1;
			//console.log([hind, vind]);
			var s = add_up(add_right(piece.square, hind), vind);
			while(s){
				var p = piece_on(s);
				if (!p){
					moves[s] = null;
					s = add_up(add_right(s, hind), vind);
				}
				else if (live[p].color != piece.color){
					moves[s] = p;
					break;
				}
				else{
					break;
				};
			};
		};
		return moves;
	};

	if (piece.office == 'Q'){
		for (i = 0; i < 4; i ++){
			var hind = ((i % 2)*2)-1;
			var vind = (Math.floor(i / 2)*2)-1;
			if (i<2){
				var f = add_up;
			}
			else{
				var f = add_right;
			};
			var ind = ((i % 2)*2)-1;
			//console.log([hind, vind]);
			var s = add_up(add_right(piece.square, hind), vind);
			while(s){
				var p = piece_on(s);
				if (!p){
					moves[s] = null;
					s = add_up(add_right(s, hind), vind);
				}
				else if (live[p].color != piece.color){
					moves[s] = p;
					break;
				}
				else{
					break;
				};
			};
			var s = f(piece.square, ind);
			while(s){
				var p = piece_on(s);
				if (!p){
					moves[s] = null;
					s = f(s, ind);
				}
				else if (live[p].color != piece.color){
					moves[s] = p;
					break;
				}
				else{
					break;
				};
			};
		};
		return moves;
	};

};
*/
//console.log(add_right("e3", 2));
//console.log(add_up("e3", 4));
//console.log(comp("e3", "b9"));

//console.log(all_valid({office:'N', color:'W', place:'e1'}));
//console.log(get_officer('N', 'c3'));
//console.log(get_pawn('', 'e3'));

//peel('e4');
//-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
/*This part of the module is designed to work with strings, particularly with
notation. This first part is capable of reading off notation, and getting live
to the state it should be after a set of moves. It too is written in 'pure'
javascript, without the fancy stuff like the DOM and events*/

function read(move){
	/*Given a move in standard format, outputs
	the office, type of move, place to which to
	move, and the optional identifier*/
	if(move == 'O-O'){
		var o = 'K';
		var file = toMove == 'W'? '1' : '8';
		var f = 'e' + file;
		var s  = 'g' + file;
	}
	else if(move == 'O-O-O'){
		var o = 'K';
		var file = toMove == 'W'? '1' : '8';
		var f = 'e' + file;
		var s  = 'c' + file;
	}
	else{
	
		if(officers.indexOf(move.charAt(0))>-1){
			var o = move.charAt(0);
			move = move.slice(1);
		}
		else{
			var o = '';
		};
		
		if(move.charAt(0) == 'x'){
			var t = 'x';
			move = move.slice(1);
		}
		else{
			var t = ''
		};
	
		if(horz.indexOf(move.charAt(0))>-1){
			if(vert.indexOf(move.charAt(1))>-1){
				var f = move.slice(0, 2);
				move = move.slice(2);
			}
			else{
				var f = move.charAt(0);
				move = move.slice(1);
			}
		}
		else if(vert.indexOf(move.charAt(0))>-1){
			var f = move.charAt(0);
			move = move.slice(1);
		};
	
		if(move.charAt(0) == 'x'){
			var t = 'x';
			move = move.slice(1);
		}
		/*else{
			var t = ''
		};*/
	
		if(horz.indexOf(move.charAt(0))>-1){
			if(vert.indexOf(move.charAt(1))>-1){
				var s = move.slice(0, 2);
				move = move.slice(2);
			}
			else{
				var s = move.charAt(0);
				move = move.slice(1);
			}
		}
		else{
			var s = null;
		};
	
		if((move.charAt(0) == '(')||(move.charAt(0) == '=')){
			var p = move.charAt(1);
			move = move.slice(3);
		}
		else{
			var p = undefined;
		}
	}

	if(o){
		return [o, s? s : f, s? f : s, p];
	}
	else{
		return [t, s? s : f, s? f : s, p];
	}
};

function get_to(){
	/*This function takes an array of correctly annotated moves
	(generated from notation by other functions) and gets live
	to the position after each one of those moves is executed.
	If there is an error in notation, it throws an error*/
	var moves = arguments[0]
	var r = arguments[1]? true:false;
	if(r){
		reset()
	}		
	for(var i = 0; i < moves.length; i ++){
		r = read(moves[i]);
		if((!r[0]) || (r[0] == 'x')){
			g = get_pawn(live, r[0], r[1], r[2]);
		}
		else{
			g = get_officer(live, r[0], r[1], r[2]);
		};
		//console.log(g);
		//console.log(r);
		if(g){
			move(r[1], g[0][0], g[0][1], '', r[3]);
		}
		else{
			throw new Error("Please check your notation");
		};
	};
}

function flip(s){
	/*Reverses a string*/
	var n = [];
	var i = s.length - 1;
	while(i > -1){
		n[n.length] = s.charAt(i);
		i --;
	};
	return n.join('');
};

function movePath(notation, ind){
	/*Given pgn-format notation (as a string) and an index in
	that string (can be in a variation, must be outside of a
	comment), returns all of the moves, from the begginning
	of the game, as an array. Useful for reading notation.*/
	var c = 0;
	var v = 0;
	var startv = false;
	var promotion = false;
	var leavingv = false;
	var leavingc = false;
	var num = 0;
	var result = [];
	var n = "";
	while(ind>-1){
		var s = notation.charAt(ind);
		if((s != '.') && ("0123456789".indexOf(s) == -1)){
			num = 0;
		}
		if(startv){
			if(("NBQR".indexOf(s) > -1)&&(v == 1)){
				//console.log("part 2");
				n = ')' + s;
				v --;
				promotion = true;
			}
			//console.log(" part 1.5 ");
			startv = false;
		}
		if(s == '}'){
			c ++;
		}
		else if((c)&&(s == '{')){
			c --;
		}
		else if(s == ')'){
			startv = true;
			//console.log(startv);
			v ++;
		}
		else if((v)&&(s == '(')){
			v --;
		}
		else if(s == '('){
			if(!promotion){
				leavingv = true;
			}
			else{
				//console.log("part 3");
				n += s;
				promotion = false;
			}
		}
		else if(s == '{'){
			leavingc = true;
		}
		else if(s == '.'){
			num = 1;
		}
		else if(s == '$'){
			n = '';
		}
		else if((!c)&&(!num)&&(!v)&&(!promotion)){
			if(' \t\n\r\s'.indexOf(s)>-1){
				if(n){
					if((!leavingc)&&(!leavingv)){
						result.unshift(flip(n));
					}
					else{
						leavingc = false;
						leavingv = false;
					};
					n = '';
				};
			}
			else{
				n += s;
			};
		}
		ind --;
	};
//	alert(result.join('--'));
	return result;
};

function nextIndex(notation, ind, enter){
	/*Given notation and an index, finds the index right
	after the next valid move. The last optional parameter
	defines whether it skips or does not skip variations
	(If the next move is not in a variation, has no effect).
	Index may be in a variation but must be outside of commentary.
	Returns undefined if it reaches the end of the notation or
	else an unmatched right parenthesis (indicating the end of the
	line it is on)*/
	var c = 0;
	var v = 0;
	var there = false;
	while(ind<notation.length){
		var s = notation.charAt(ind);
		if(s == '{'){
			v ++;
		}
		else if((s == '}')&&v){
			v --;
		}
		else if((s == '(')&&(!there)){
			if(enter){
				ind ++;
				continue;
			}
			c ++;
		}
		else if((s == ')')&&(!there)){
			if(c){
				c --;
			}
			else{
				return undefined;
			}
		}
		else if((!c)&&(!v)){
			if (there){
				if (' \t\r\n\s'.indexOf(s) > -1){
					return ind;
				}
			}
			else{
				if ('NKQRBabcdefghxO'.indexOf(s) > -1){
					there = true;
				}
			}
		}
		ind ++;
	}
	if (there){
		return ind;
	}
	return undefined;
}				

function nextMove(notation, ind, enter){
	/*Like nextIndex, but instead of the
	index, gets the entire move.*/
	var c = 0;
	var v = 0;
	var there = false;
	var m = "";
	while(ind<notation.length){
		var s = notation.charAt(ind);
		if(s == '{'){
			v ++;
		}
		else if((s == '}')&&v){
			v --;
		}
		else if((s == '(')&&(!there)){
			if(enter){
				ind ++;
				continue;
			}
			c ++;
		}
		else if((s == ')')&&(!there)){
			if(c){
				c --;
			}
			else{
				return undefined;
			}
		}
		else if((!c)&&(!v)){
			if (there){
				if (' \t\r\n\s'.indexOf(s) > -1){
					return m;
				}
				else{
					m += s;
				}
			}
			else{
				if ('NKQRBabcdefghxO'.indexOf(s) > -1){
					there = true;
					m += s;
				}
			}
		}
		ind ++;
	}
	if (there){
//		alert(m);
		return m;
	}
	return undefined;
}

function prevIndex(notation, ind){
	/*Like nextIndex, but getting the previous move.
	No enter parameter; leaves variations automatically.
	returns undefined if it reaches the end of the document.*/
	var c = 0;
	var v = 0;
	var leavingv = false;
	var leavingc = false;
	var num = 0;
	//var result = [];
	var there = false;
	while(ind>-1){
		var s = notation.charAt(ind);
		if((s != '.') && ("0123456789".indexOf(s) == -1)){
			num = 0;
		}
		if(s == '}'){
			c ++;
		}
		else if((c)&&(s == '{')){
			c --;
		}
		else if(s == ')'){
			v ++;
		}
		else if((v)&&(s == '(')){
			v --;
		}
		else if(s == '('){
			leavingv = true;
		}
		else if(s == '{'){
			leavingc = true;
		}
		else if(s == '.'){
			there = false;
			num = 1;
		}
		else if(s == '$'){
			there = false;
		}
		else if((!c)&&(!num)&&(!v)){
			if(' \t\n\r\s'.indexOf(s)>-1){
				if(there){
					if((!leavingc)&&(!leavingv)){
						return ind;
					}
					else{
						leavingc = false;
						leavingv = false;
					};
					there = false;
				};
			}
			else{
				there = true;
			};
		}
		ind --;
	};
	//return result;
};

//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
/*This section also deals with notation. Unlike the last one, it is not very concerned with
reading, or for that matter, recognising valid notation moves at all. Rather, this is the
administrative part; it writes correct notation, and is responsible for all the functions
that allow you to write correct and expressive pgn-format notation. While the two are heavily
connected, I choose to separate the previous section and this one because this one does call
for user input via prompt and alert in places, while the former is written in pure js.*/

var cursor = 0;
//The current place within the notation.
var baseName = document.getElementById("base").innerHTML;
var globalIndex = document.getElementById("index").innerHTML;
var tops = '';
var notation = '';
var telomere = '';
//The tags, the notation, and the junk at the end, respectively.

//Two formatters, on load and on unload.

fromSaveFormat(separate(document.getElementById("original").innerHTML));
correctify();

function separate(s){
	/*Separates the tags and the notation*/
	var tag = false;
	for(var i = 0; i < s.length; i ++){
		var ch = s.charAt(i);
		if(ch == '['){
			tag = true;
		}
		else if((tag)&&(ch == '\n')){
			tag = false;
		}
		else if((!tag)&&(ch == '\n')){
			break;
		}
	}
	tops = s.slice(0, i + 1);
	return s.slice(i + 1);
}

function fromSaveFormat(s){
	/*Gets the notation and telomere from a string,
	and assigns them to the proper global variables.*/
	var result = '';
	var ending = '';
	for(var i = 0; i < s.length; i ++){
		var c = s.charAt(i);
		if('\t\r'.indexOf(c)>-1){
			continue
		}
		else if(c == '\n'){
			result += (i != s.length - 1)?' ': '';
		}
		else{
			result += c;
		}
	}
	for(var i = result.length - 1; i > -1; i --){
		var c = result.charAt(i);
		if(c == ' '){
			break;
		}
		else{
			ending += c;
		}
	}
	ending = flip(ending);
	if((ending == '0-1')||(ending == '1-0')||(ending == '*')){
		notation = result.slice(0, i);
		telomere = ending;
	}
	else{
		notation = result;
		telomere = '';
	}
}

function correctify(){
	/*Corrects the pgn to the flavor used by my program.*/
	//Part 1
	var c = false
	for(var i = 0; i<notation.length; i ++){
		var s = notation.charAt(i);
		if(s == '{'){
			c = true;
		}
		else if(s == '}'){
			c = false;
		}
		else if((!c)&&(s=='.')){
			if("NBQRKabcdefghxO".indexOf(notation.charAt(i + 1)) > -1){
				notation = notation.slice(0, i + 1) + ' ' + notation.slice(i + 1);
			}
		}
	}
}

function toSaveFormat(){
	/*Returns a string based on the notation
	and telomere, in the save format*/
	var result = '';
	var num = 0;
	for(var i = 0; i < notation.length; i ++){
		var c = notation.charAt(i);
		if((num>75)&&(c == ' ')){
			result += '\r\n';
			num = 0;
		}
		else{
			result += c;
			num ++;
		}
	}
	return tops + result + '\r\n' + telomere;
}			

//The real functions

function write(move){
	/* Given the current position of the cursor in the notation, appends a correctly
	formatted move to the notation. The main writing function; shall be used extensively
	in the function 'notate'. Assumes that the cursor is on a space; moves the cursor
	to the space after the move.*/
	var x = movePath(notation, cursor).length;
	if (!(x%2)){
		var s = ((x/2) + 1) + '.' + ' ';
	}
	else{
		var s = '';
	}
	s += move + ' ';
	notation = notation.slice(0, cursor + 1) + s + notation.slice(cursor + 1);
	cursor  += s.length;
}
		

//Commentary

function findNextComment(){
	/*Returns the indeces of the leading and trailing
	curly braces of the next comment from where the
	cursor is. Used in functions like deleteComment.
	Cursor must start either on the leading '{' or
	outside of the comment, never within. Stays on
	the same line.*/
	var f = -1;
	var s = -1;
	var c = 0;
	var there = false;
	for(var i = cursor; i < notation.length; i ++){
		if(!c){
			if (!there){
				if(notation.charAt(i) == '{'){
					f = i;
					there = true;
				}
				else if(notation.charAt(i) == ')'){
					break;
				}
				else if(notation.charAt(i) == '('){
					c ++;
				}
			}
			else if((there)&&(notation.charAt(i) == '}')){
				s = i;
				break;
			}
		}
		else{
			if(notation.charAt(i) == '('){
				c ++;
			}
			else if(notation.charAt(i) == ')'){
				c --;
			}
		}
	}
	if((f>-1)&&(s>-1)){
		return [f, s];
	}
	return undefined;
}

function deleteNextComment(){
	/*Deletes the next comment from where the cursor is.*/
	var r = findNextComment();
	if(r){
		notation = notation.slice(0, r[0]) + notation.slice(r[1] + 2);
	}
	return undefined;
};

function getNextComment(){
	/*Returns the string inside the curly braces*/
	var r = findNextComment();
	if(r){
		return notation.slice(r[0] + 1, r[1]);
	}
	return undefined;
}

function editNextComment(){
	/*Opens a dialog box that allows you to edit the
	next comment. Moves cursor to the space after the
	closing curly brace.*/
	var r = findNextComment();
	if(r){
		var t = prompt("Edit here.", getNextComment());
		notation = notation.slice(0, r[0] + 1) + t + notation.slice(r[1]);
		//cursor = r[0] + t.length + 2;
	}
	else{
		alert("No comment after cursor");
	}
}

function createComment(){
	/*With user input, creates a comment
	in the next valid spot (or at the cursor).
	Places the cursor after the newly created
	comment.*/
	/*if((!cursor)||(notation.charAt(cursor-1)=='.')||(notation.charAt(cursor)!=' ')){
		cursor = nextIndex(notation, cursor, false);
	}*/
	if(movePath(notation, cursor).length){
		t = '{' + prompt("Comment here.") + '} ';
		notation = notation.slice(0, cursor + 1) + t + notation.slice(cursor);
		cursor = cursor + t.length + 1;
	}
	else{
		alert("Comments before moves forbidden.");
	}
}

//Variations

function findNextVariation(){
	/*[replace "comment" with "variation" in findNextComment description ]*/
	var f = -1;
	var s = -1;
	var v = 0;
	var c = 0;
	var lenc = 0;
	var there = false;
	for(var i = cursor; i < notation.length; i ++){
		var character = notation.charAt(i);
		if (character == '{'){
			c ++;
			continue;
		}
		else if(character == '}'){
			if(c){
				c--;
			}
			else{
				break;
			}
			continue;
		}
		if(!c){
			if(there){
				if(character == '('){
					v ++;
				}
				else if (character == ')'){
					if(v){
						v --;
					}
					else if(lenc > 1){
						s = i;
						break;
					}
					else{
						there = false;
						s = -1;
						f = -1;
						lenc = 0;
					}
				}
				else{
					lenc ++;
				}
			}
			else{
				if (character == '('){
					f = i;
					there = true;
				}
				else if(character == ')'){
					break;
				}
			}
		}
	}
	if((f>-1)&&(s>-1)){
		return [f, s];
	}
	return undefined;
}

function deleteNextVariation(){
	var r = findNextVariation();
	if(r){
		var w = getWorkingVariation() || [-1, notation.length]
		var oldc = cursor;
		var firstPart = notation.slice(0, r[0]);
		var firstMove = nextMove(notation, r[1] + 1, false);
		var lastPart = notation.slice(nextIndex(notation, r[1] + 1, false) || w[1] - 1);
		notation = firstPart;
		cursor = r[0] - 1;
		if(firstMove){
			write(firstMove);
		}
		notation += lastPart;
		cursor = oldc;
		
	}
	else{
		alert("Error : No such variation ");
	}
}

function createVariation(){
	/*Based on the position of the cursor, creates a variation
	and positions the cursor within the variation.*/
	var x = movePath(notation, cursor).length;
	var y = findNextComment();
	var z = nextIndex(notation, cursor, false);
	if (x%2){
		var s = '( ) ' + ((x+1)/2) + '. ...';
		var incr = 2;
	}	
	else{
		var s = '( ' + (x/2) + '. ... ' + ')';
		var incr = 2 + ((x/2) + '').length + 6;
	}
	if(y){
		if((!z)||(y[0]<z)){
			cursor = y[1] + 1;
		}
	}
	notation = notation.slice(0, cursor + 1) + s + notation.slice(cursor);
	cursor += incr;
}

function getWorkingVariation(){
	/*Returns the array of starting and ending indexes of
	the parentheses that enclose the CURRENT variation, the
	one in which the cursor currently is.*/
	var c = 0;
	var v = 0;
	var second;
	var first;
	for(i = cursor; i < notation.length; i ++){
		var s = notation.charAt(i);
		if(s == '('){
			v ++;
		}
		else if(s == '{'){
			c ++;
		}
		else if((v)&&(s == ')')){
			v --;
		}
		else if ((c)&&(s == '}')){
			c --;
		}
		else if((!c)&&(!v)&&(s == ')')){
			second = i;
			break;
		}
	}
	for(i = cursor; i > -1; i --){
		var s = notation.charAt(i);
		if(s == ')'){
			v ++;
		}
		else if(s == '}'){
			c ++;
		}
		else if((v)&&(s == '(')){
			v --;
		}
		else if ((c)&&(s == '{')){
			c --;
		}
		else if((!c)&&(!v)&&(s == '(')){
			first = i;
			break;
		}
	}
	if(first&&second){
		return [first, second];
	}
	return undefined;
}
	
function leaveVariation(){
	/*Positions the cursor on the space where it
	ought write after the variation.*/
	var r = getWorkingVariation();
	if(r){
		cursor = r[1] + 1;
		var n = nextIndex(notation, cursor, false);
		var m = nextMove(notation, cursor, false);
		if(n&&m){
			cursor = n - m.length;
			if(!(movePath(notation, cursor).length%2)){
				cursor = r[1] + 1;
			}
		}
		else{
			var r = getWorkingVariation();
			if(r){
				cursor = r[1] - 1;
			}
			else{
				cursor = notation.length - 1;
			}
		}
	}
	else{
		alert("Error: on main line.");
	}
}
		
function switchNextVariation(){
	/*Makes the next variation the main line and the main
	line that variation. Can be called within nested
	variations as well.*/
	var r = findNextVariation();
	var w = getWorkingVariation();
	if(!r){
		alert("Error: no variation at all");
		return undefined;
	}
	if(!w){
		w = [-1, notation.length];
	}
	var oldc = cursor; //The temporary cursor; does not change the actual cursor.
	cursor = r[0] - 1;
	cursor = nextIndex(notation, prevIndex(notation, prevIndex(notation, cursor)), true);
	//console.log(cursor);
	if(cursor == undefined){
		cursor = nextIndex(notation, 0, true) - nextMove(notation, 0, true).length - 1;
		//console.log("It worked");
		var firstPart = '';
	}
	else{
		var a = nextIndex(notation, cursor, true);
		if(a != nextIndex(notation, cursor, false)){
			cursor = a;
			leaveVariation();
			var m = movePath(notation, cursor).length;
			if(m%2){
				cursor += (((m + 1)/2) + '. ... ').length;
			}
			//console.log(notation.slice(0, cursor + 1) + '||' + notation.slice(cursor + 1));
		}			
		var firstPart = notation.slice(0, cursor);
		//console.log(firstPart);
	}
	//var firstMove = nextMove(notation, cursor, false);
	cursor = prevIndex(notation, nextIndex(notation, cursor, false));
	var firstMove = notation.slice(cursor + 1, r[0] - 1);
	cursor = r[0] + 1;
	var secondMove = nextMove(notation, cursor, false);
	cursor = nextIndex(notation, cursor, false);
	var secondPart = notation.slice(cursor, r[1]);
	cursor = r[1] + 1;
	var thirdMove = nextMove(notation, cursor, false);
	var trial = nextIndex(notation, cursor, false);
	cursor = trial? trial : w[1] - 1;
	var thirdPart = notation.slice(cursor, w[1]);
	var lastPart = notation.slice(w[1]);
	//console.log(firstPart);
	//console.log(secondMove);
	//console.log(firstMove);
	//console.log(thirdMove);
	//console.log(thirdPart);
	//console.log(secondPart);
	//console.log(lastPart);
	cursor = r[0] - 1;
	cursor = nextIndex(notation, prevIndex(notation, prevIndex(notation, cursor)), true);
	if(cursor == undefined){
		cursor = nextIndex(notation, 0, true) - nextMove(notation, 0, true).length - 1;
		//cursor = 0;
	}
	//console.log(cursor)
	notation = firstPart + (firstPart? ' ' : '');
	cursor = notation.length -1;
	write(secondMove);
	createVariation();
	if(!firstPart){
		cursor = nextIndex(notation, 0, false) + 2;
	}
	//console.log(cursor);
	write(firstMove);
	if(thirdMove){
		write(thirdMove);
	}
	notation = notation.slice(0, cursor) + thirdPart + notation.slice(cursor + 1);
	cursor = notation.length - 1;
	notation += secondPart + lastPart;
	//console.log(notation);
	cursor = oldc;
};

//Main functions

function forward(enter){
	/*Moves forward in the notation.*/
	var x = nextIndex(notation, cursor, enter);
	if(x){
		if(enter){
			var y = nextIndex(notation, x, true);
			var z = nextIndex(notation, x, false);
			if(y != z){
				get_to(movePath(notation, y), true);
				cursor = y;
			}
			else{
				alert("No variation to enter.");
			}
		}
		else{
			get_to([nextMove(notation, cursor, enter)]);
			cursor = x;
		}
		var y = nextIndex(notation, cursor, false);
		var f = findNextComment();
		var g = findNextVariation();
		if(f||g){
			f = f || [100000, 100000];
			g = g || [100000, 100000];
			var h = [f[0], g[0]].sort((function(a, b){ return a - b; }))
			var t = [f[1], g[1]].sort((function(a, b){ return a - b; }))
			if(!y){
				cursor = t[1] + 1;
			}
			else if(h[0] < y){
				if(h[1]<y){
					cursor = t[1] + 1;
				}
				else{
					cursor = t[0] + 1;
				}
			}
					
		}
	}
	else{
		alert("At the end of the line.");
	}
}

function back(){
	/*Moves back in notation.*/
	var a =  prevIndex(notation, cursor);
	if(!a){
		alert("At start of game. LOOK AT THE BOARD.");
		return undefined;
	}	
	var b =  prevIndex(notation, a);
	var x = b? nextIndex(notation, b, true) : 0;
	//console.log(x);
	if(x !== undefined){
		var m = movePath(notation, x);
		//console.log(m);
		try{
			get_to(m, true);
		}
		catch(e){
			alert("Your notation is off\n" + m.join(' '));
		}
		cursor = x;
	}
}
function getOn(){
	/*Leaves the present variation, and sets the board right.*/
	leaveVariation();
	cursor ++;
	get_to(movePath(notation, cursor), true);
}

function notate(move){
	/*The grandest of all; this is the main function that handles
	a move after it has been made on the board*/
	var x = nextIndex(notation, cursor, false);
	if(!x){
		write(move);
	}
	else{
		var input = prompt("Would you like this to be a new variation or a new main line? 'M' for main line, anything else for a new variation");
		if(input != 'M'){
			cursor = x;
			createVariation();
			write(move);
		}
		else{
			var oldc = cursor;
			var y = nextMove(notation, cursor, false).length + 1;
			cursor = x;
			createVariation();
			//console.log(notation);
			write(move);
			//console.log(notation);
			cursor = x - y;
			//console.log(cursor);
			switchNextVariation();
			var w = getWorkingVariation() || [-1, notation.length];
			cursor = w[1] - 1;
		}
	}
}

//Above almost works; debug first thing tomorrow. After that, start working on utn.addEventListener("click", (funtion(){ forward(false); renderBoard(); }), false);ility functions and the like.
	

//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
/*This part of the document is designed to work with the DOM. This is what gets the right
picturs, appends them to the right places, matches pixels to squares and squares to pixels,
etc. The functions from this section are what draws the pretty picturs users see.*/

document.getElementById("board").style.left = "8px";
document.getElementById("board").style.top = "226px";

document.getElementById("Indicator").style.left = "380px";
clearBoard();
renderBoard();

//top left corner of board and square size(actually, one square above). Ideally, the former is computed from the page.
var start_look = [0, 181];
//var start_specify = [8, 221];
var size = 45;

function getPromotion(string){
	/*Gets the correct office from an arbitrary user response in a dialog box*/
	if((string.charAt(0) == "N") || (string.charAt(0) == "n") || (string.indexOf("Kn") == 0) || (string.indexOf("kn") == 0)){
		return "N";
	}
	/*else if((string.charAt(0) == "k") || (string.charAt(0) == "K")){
		return "K";
	}*/
	else if((string.charAt(0) == "b") || (string.charAt(0) == "B")){
		return "B";
	}
	else if((string.charAt(0) == "r") || (string.charAt(0) == "R")){
		return "R";
	}
	else{
		return "Q";
	};
};

//document.addEventListener("click", get_coordinates, false);
/*
//document.body.appendChild(document.createTextNode("testing"));
var pawn = document.createElement("img");
//document.body.appendChild(document.createTextNode("testing"));
pawn.src = "board_images/pieces/White/pawn.png";
//document.body.appendChild(document.createTextNode("testing"));
pawn.className = 'drag';
//document.body.appendChild(document.createTextNode("testing"));
//pawn.style.left = '8px';
//document.body.appendChild(document.createTextNode(pawn.class));
//document.body.appendChild(document.createTextNode("testing"));
//pawn.style.top = "266px";
//document.body.appendChild(document.createTextNode("testing"));
document.body.appendChild(pawn);
//document.body.appendChild(document.createTextNode("testing"));
document.body.lastChild.style.left = '8px';
document.body.lastChild.style.top = '221px';
*/
function square(posx, posy){
	/*Returns the chess square a pixel, specified by coordinates, is in.
	If outside of the board, returns undefined. */
	var letter = "abcdefgh".charAt(Math.floor((posx - start_look[0])/size));
	var num = 8 - Math.floor((posy - start_look[1])/size);
	var validnum = (0<num)&&(num<9);
	if(letter && validnum){
		return letter + num;
	};
	return undefined;
};

function pixels(place){
	/*Returns the correct, specifiable values for the position of a piece
	based on the square on the board. */
	var start_specify = [8, 225];
	var file = place.charAt(0);
	var posx = start_specify[0] + 45*("abcdefgh".indexOf(file));
	var posy = start_specify[1] + 45*(8 - (+place.charAt(1)));
	return [posx, posy];
};

function imageSource(piece){
	/* Returns the path to the correct image from an index in live */
	var base = "/board_images/pieces/";
	var directory = live[piece].color == 'W'? "White/" : "Black/";
	var filename;
	if (live[piece].office == ''){
		filename = 'pawn';
	}
	else if (live[piece].office == 'N'){
		filename = 'knight';
	}
	else if (live[piece].office == 'B'){
		filename = 'bishop';
	}
	else if (live[piece].office == 'R'){
		filename = 'rook';
	}
	else if (live[piece].office == 'Q'){
		filename = 'queen';
	}
	else if (live[piece].office == 'K'){
		filename = 'king';
	};
	return base + directory + filename + '.png';
};

	
/*
function get_coordinates(e){
	var posx = 0;
	var posy = 0;
	if (!e) var e = window.event;
	if (e.pageX || e.pageY) 	{
		posx = e.pageX;
		posy = e.pageY;
	}
	else if (e.clientX || e.clientY) 	{
		posx = e.clientX + document.body.scrollLeft
			+ document.documentElement.scrollLeft;
		posy = e.clientY + document.body.scrollTop
			+ document.documentElement.scrollTop;
	};
	document.body.appendChild(document.createTextNode(posx + ',' + posy + '</br>'))
};
*/

function clearBoard(){
	var x = document.body.firstChild;
	while(x){
		var y = x.nextSibling;
		if(x.className == 'drag'){
			document.body.removeChild(x);
		};
		x = y;
	};
	//x = document.createElement("a");
	//x.href = "http://www.google.com";
	//x.appendChild(document.createTextNode("test a success"))
	//document.body.appendChild(x);
};

function setIndicator(){
	document.getElementById("Indicator").style.top = 221 + (345*(toMove == "W")) + "px";
};

//And . . . the notation.

var notes = document.getElementById("notes");
notes.style.left = "450px";
notes.style.top = "120px";

function mult(s, n){
	/*Like strings times numbers in python */
	var result = '';
	for(var i = 0; i < n; i ++){
		result += s;
	}
	return result;
}
	

function renderNotes(){
	var h = ''
	var c = 0;
	var num = 0;
	var incomment = false;
	for(var i = 0; i < notation.length; i ++){
		var s = notation.charAt(i);
		if((!incomment)&&(s == '(')){
			c++;
			num = 7*c;
			h += '</br>' + mult('-', 7*c);
		}
		else if((!incomment)&&(s == ')')){
			c--;
			num = 7*c;
			h += '</br>' + mult('-', 7*c);
		}
		else if(s == '{'){
			c++;
			num = 7*c;
			incomment = true;
			h += '</br>' + mult('-', 7*c) + '<i>';
		}
		else if(s == '}'){
			c--;
			num = 7*c;
			incomment = false;
			h += '</i></br>' + mult('-', 7*c);
		}
		else if((num > 75)&&(s == ' ')){
			num = 7*c;
			h += '</br>' + mult('-', 7*c);
		}
		else{
			num ++;
			h += s;
		}
		if(i == cursor){
			h += '<b>||</b>';
		}
	}
	document.getElementById("notes").innerHTML = h;
}

function renderBoard(){
	clearBoard();
	setIndicator();
	for (var i = 0; i < live.length; i ++){
		var newpiece = document.createElement("img");
		newpiece.src = imageSource(i);
		newpiece.className = "drag";
		newpiece.id = i + '';
		document.body.appendChild(newpiece);
		var co = pixels(live[i].square);
		document.body.lastChild.style.left = co[0] + "px";
		document.body.lastChild.style.top = co[1] + "px";
	};
	renderNotes();
};

//document.body.removeChild(document.getElementById("0"));

//That was the board. Now for the buttons.

saveTo = '/saver/';

var myButtons = [
		["back", (function(){ back(); renderBoard(); })],
		["forward", (function(){ forward(false); renderBoard(); })],
		["enter variation", (function(){ forward(true); renderBoard(); })],
		["leave variation", (function(){ getOn(); renderBoard(); })],
		["make next variation</br>main line", (function(){
			switchNextVariation();
			var w = getWorkingVariation() || [-1, notation.length];
			cursor = w[1] - 1;
			get_to(movePath(notation, cursor), true);
			renderBoard();
		})],
		["delete next variaton", (function(){ deleteNextVariation(); renderNotes();})],
		["delete rest of</br>current line", (function(){ var w = getWorkingVariation() || [-1, notation.length]; notation = notation.slice(0, cursor + 1) + notation.slice(w[1]); renderNotes();})],
		["create a comment", (function(){ createComment(); renderNotes();})],
		["edit next comment", (function(){ editNextComment(); renderNotes();})],
		["delete next comment", (function(){ deleteNextComment(); renderNotes();})],
		["save", (function(){
			document.body.removeChild(document.getElementById("notes"));
			clearBoard();
			document.body.removeChild(document.getElementById("Indicator"));
			var n = document.createElement("div");
			n.className = "other";
			n.id = "final";
			n.innerHTML = "If you wish, check the work of the computer. <form action=\""
			+ '/edit/saving/' +
			"\" method=\"post\">" +
			"<div><textarea name = \"base_name\" rows = \"1\" cols = \"10\">"
			+ baseName +
			"</textarea></div>" +
			"<div><textarea name = \"index\" rows = \"1\" cols = \"10\">"
			+ globalIndex +
			"</textarea></div>" + 
			"<div><textarea name = \"game\" rows = \"25\" cols = \"300\">"
			+ toSaveFormat() + 
			"</textarea></div>" + 
			"<div><input type=\"submit\" value=\"save\"></div></form>";
			document.body.appendChild(n);
			document.body.lastChild.style.left = "450px";
			document.body.lastChild.style.top = "120px";
		})]		
		];

makeButtons();

function makeButtons(){
	for(var i = 0; i<myButtons.length; i ++){
		var n = document.createElement("button");
		n.type = "button";
		n.className = "other";
		n.innerHTML = myButtons[i][0];
		n.addEventListener("click", myButtons[i][1], false);
		document.body.appendChild(n);
		document.body.lastChild.style.top = (600 + ((Math.floor(i/4))*65)) + "px";
		document.body.lastChild.style.left = (9 + ((i%4)*105)) + "px";
		document.body.lastChild.style.width = "100px";
		document.body.lastChild.style.height = "60px";
	}
}

//-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

/*This is the section that works with events. It calls on functions from all the other parts,
and is itself only responsible for being dynamic. Almost all of the code for click and drag
is from http://luke.breuer.com/tutorial/javascript-drag-and-drop-tutorial.aspx; I only
heavily modified onMouseUp*/

var _startX = 0; // mouse starting positions
var _startY = 0; var _offsetX = 0; // current element offset
var _offsetY = 0; var _dragElement; // needs to be passed from OnMouseDown to OnMouseMove
var _oldZIndex = 0; // we temporarily increase the z-index during drag
//var _debug = $('debug'); // makes life easier

function ExtractNumber(value) {
	var n = parseInt(value);
	return n == null || isNaN(n) ? 0 : n;
};

// this is simply a shortcut for the eyes and fingers
function $(id) {
	return document.getElementById(id);
};

InitDragDrop();

function InitDragDrop(){
	document.onmousedown = OnMouseDown;
	document.onmouseup = OnMouseUp;
}

function OnMouseDown(e) {
	// IE is retarded and doesn't pass the event object
	if (e == null) e = window.event;

	// IE uses srcElement, others use target
	var target = e.target != null ? e.target : e.srcElement;
	//_debug.innerHTML = target.className == 'drag' ? 'draggable element clicked' : 'NON-draggable element clicked';

	// for IE, left click == 1
	// for Firefox, left click == 0
	if ((e.button == 1 && window.event != null || e.button == 0) && target.className == 'drag') {

		// grab the mouse position
		_startX = e.clientX; _startY = e.clientY;

		// grab the clicked element's position
		_offsetX = ExtractNumber(target.style.left);
		_offsetY = ExtractNumber(target.style.top);

		// bring the clicked element to the front while it is being dragged
		_oldZIndex = target.style.zIndex; target.style.zIndex = 10000;

		// we need to access the element in OnMouseMove
		_dragElement = target;

		// tell our code to start moving the element with the mouse
		document.onmousemove = OnMouseMove;

		// cancel out any text selections
		document.body.focus();

		// prevent text selection in IE
		document.onselectstart = function (){
			return false;
		};

		// prevent IE from trying to drag an image
		target.ondragstart = function() {
			return false;
		};

		// prevent text selection (except IE)
		return false;
	};
};

function OnMouseMove(e) {
	if (e == null) {
		var e = window.event;
	};

	// this is the actual "drag code"
	_dragElement.style.left = (_offsetX + e.clientX - _startX) + 'px';
	_dragElement.style.top = (_offsetY + e.clientY - _startY) + 'px';
	//_debug.innerHTML = '(' + _dragElement.style.left + ', ' + _dragElement.style.top + ')';
};

function OnMouseUp(e) {
	if (_dragElement != null) {
		_dragElement.style.zIndex = _oldZIndex;

		s = square((+_dragElement.style.left.slice(0, -2)), (+_dragElement.style.top.slice(0, -2)));
		//document.body.appendChild(document.createTextNode((+_dragElement.style.left.slice(0, -2)) + ',' + (+_dragElement.style.top.slice(0, -2))))
		_dragElement.ondragstart = null; 
		if(s){
			v = validMove(+_dragElement.id, s);
			if(v){
				if ((live[+_dragElement.id].office == '')&&(s.charAt(1) == (toMove == 'W'? '8' : '1'))){
					var r = prompt("What would you like to promote to?", "Q");
					var p = getPromotion(r);
				}
				else{
					var p = "null";
				};
				m = move(s, v[0], v[1], v[2], p);
				if(m){
					notate(m);
				}
				//console.log(m);
				renderBoard();
				//document.body.appendChild(document.createTextNode("It Worked!"));
			}
			else{
				_dragElement.style.left = _offsetX;
				_dragElement.style.top = _offsetY;
				//document.body.appendChild(document.createTextNode("Invalid Move"));
			};
		}
		else{
			_dragElement.style.left = _offsetX;
			_dragElement.style.top = _offsetY;
			//document.body.appendChild(document.createTextNode("No square."));
		};

		// we're done with these events until the next OnMouseDown
		document.onmousemove = null;
		document.onselectstart = null;
		//_dragElement.ondragstart = null; 

		// this is how we know we're not dragging
		_dragElement = null;
		//_debug.innerHTML = 'mouse up';
	};
};
//document.body.appendChild(document.createTextNode(square(142, 403)))
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

