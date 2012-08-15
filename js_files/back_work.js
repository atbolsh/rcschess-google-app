/*The purpose of this module is to provide all of the back work for the main module;
checking the validity of moves, for instance. The main module is to deal with errors
(invalid moves), and deal with them in different ways depending on whether it is a
notation error or a wrong move of the hand.*/

//start initialization of game variables

var horz = "abcdefgh";
var vert = "12345678";

var officers = "NBQRK";

var base_piece = function(){
	/* This is a piece. 'office' describes
	which piece this is; all pieces are described
	by their chess notation abbreviation; pawns
	are blank strings*/
	this.color = arguments[0];
	this.office = arguments[1];
	this.square = arguments[2];
	this.firstmove = arguments[3];
}

// Start initialization of all the live pieces at the start of the game.

var live = [];

for(i = 0; i < 8; i++){
	live[live.length] = new base_piece('W','',horz.charAt(i) + '2', 0);
};

live[live.length] = new base_piece('W', 'R', 'a1');
live[live.length] = new base_piece('W', 'R', 'h1');
live[live.length] = new base_piece('W', 'N', 'b1');
live[live.length] = new base_piece('W', 'N', 'g1');
live[live.length] = new base_piece('W', 'B', 'c1');
live[live.length] = new base_piece('W', 'B', 'f1');
live[live.length] = new base_piece('W', 'Q', 'd1');
live[live.length] = new base_piece('W', 'K', 'e1');

for(i = 0; i < 8; i++){
	live[live.length] = new base_piece('B','',horz.charAt(i) + '7', 0);
};

live[live.length] = new base_piece('B', 'R', 'a8');
live[live.length] = new base_piece('B', 'R', 'h8');
live[live.length] = new base_piece('B', 'N', 'b8');
live[live.length] = new base_piece('B', 'N', 'g8');
live[live.length] = new base_piece('B', 'B', 'c8');
live[live.length] = new base_piece('B', 'B', 'f8');
live[live.length] = new base_piece('B', 'Q', 'd8');
live[live.length] = new base_piece('B', 'K', 'e8');

//End initialization of all the live pieces at the start of the game.

var toMove = 'W';
var error = false;

//end initialization of game variables.

function piece_on(place){
	/*Given a chess square, returns the piece (via index in live) on 
	that square. If square is
	empty, returns null*/
	for(var i= 0; i < live.length; i ++){
		if (live[i].square == place){
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
	/* Given the office (place 0), a square to go to (place 1), an optional
	identifier (place 2; such as f, or g, if two of the same officers
	can reach the same square), and an optional color (defaults to to_move),
	if the move is legal, finds the index in live of the piece to move,
	and the index of the piece to be taken. Otherwise, changes error to true.
	This, as well as get_pawn, is for reading off notation already present.*/
	var o = arguments[0];
	var s = arguments[1];
	var id = arguments[2]? arguments[2] : '';
	var c = arguments[3] || toMove;

	var q = piece_on(s);
	if (q != null){
		if (live[q].color == c){

			return undefined;
		};
	};

	var t = function(p){
		/*Tests whether or not it is the one. */
		return ((live[p].office == o)&&(live[p].color == c)&&(live[p].square.indexOf(id)>-1))
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
						var p = piece_on(newmoves[k]);
						if (p !== null){
							if (t(p)){
								return [p, q];
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
					var p = piece_on(newmove);
                                        //console.log(p);
					if (p !== null){
						if (t(p)){
							return [p, q];
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
				var p = piece_on(m);
				if (p === null){
					m = f(m, ind);
				}
				else{
					if (t(p)){
						return [p, q];
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
				var p = piece_on(m);
				if (p === null){
					m = add_up(add_right(m, hind), vind);
				}
				else{
					if (t(p)){
						return [p, q];
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
				var p = piece_on(m);
				if (p === null){
					m = add_up(add_right(m, hind), vind);
				}
				else{
					if (t(p)){
						return [p, q];
					};
					break;
				};
			};
			var m = f(s, ind);
			while(m){
				var p = piece_on(m);
				if (p === null){
					m = f(m, ind);
				}
				else{
					if (t(p)){
						return [p, q];
					};
					break;
				};
			};
		};
	};

	return undefined;
};

function get_pawn(){
	/*Does the same thing for footsoldiers as get_officer for officers,
	but with different parameters. This time, the 0th parameter is the
	type of move ('' for plain, 'x' for take)
	the 1st is the square, the 2nd is the optional identifier, and the
	3rd is the color, defaulting to toMove. */

	var t = arguments[0];
	var s = arguments[1];
	var id = arguments[2]? arguments[2] : '';
	var c = arguments[3] || toMove;

	if (t == ''){

		var q = piece_on(s);

		//console.log(q);

		if(q !== null){
			//console.log('Hello');
			return undefined;
		};

		var direction = 2*(c == 'B') - 1;
		//console.log(direction);

		var t = function(p){
			/*Tests whether or not it is the one. */
			return ((live[p].office == '')&&(live[p].color == c)&&(live[p].square.indexOf(id)>-1))
		};

		var f = piece_on(add_up(s, direction));
		//console.log(f);

		if(f !== null){
			if(t(f)){
				return [f, q];
			};
		}
		else if((s.charAt(1) == (c == 'W'? '4':'5'))){
			var w = piece_on(add_up(s, 2*direction));
			if(w !== null){
				if(t(w)){
					return [w, q];
				};
			};
		};

		return undefined;
	}

	else if (t == 'x'){

		//console.log('Hello');

		var direction = 2*(c == 'B') - 1;

		var q = piece_on(s);

		//console.log(q);

		if (q === null){
			q = piece_on(add_up(s, direction));
			var n = true;
			if (q !== null){
				if ((live[q].color != c)&&(live[q].firstmove == 1)){
					n = false;
				};
			};
			if(n){
				return undefined;
			};
			//This rather ugly part of the code deals with en passant.
		}
		else if (live[q].color == c){
			return undefined;
		};

		var t = function(p){
			/*Tests whether or not it is the one. */
			return ((live[p].office == '')&&(live[p].color == c)&&(live[p].square.indexOf(id)>-1))
		};

		//console.log(t(4));

		for(var i = -1; i < 2; i += 2){
			p = piece_on(add_up(add_right(s, i), direction));
			//console.log(p);
			if(p !== null){
				if (t(p)){
					return [p, q];
				};
			};
		};

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

	var x = get_officer('N', p, null, k)
		+ get_officer('R', p, null, k)
		+ get_officer('B', p, null, k)
		+ get_officer('Q', p, null, k)
		+ get_officer('K', p, null, k)
		+ get_pawn('x', p, null, k);

	return !x;
			
};

function move(place, ind_of, ind_gone, promote){
	/*Given the index (in live) of the piece that is moving,
	the piece that is being taken (ignored if out of range),
	and the square, performs all of the necessary operations.
	The final is the piece of promotion.*/
	ind_gone = ind_gone === null? -1: ind_gone;
	promote = promote || 'Q';
	var newlive = [];
	for(var i = 0; i < live.length; i ++){
		var p = live[i];
		if (i == ind_of){
			//console.log(((!p.office)&&(Math.abs(comp(p.square, place)[1]) == 2))? 1 : 0);
			newlive[newlive.length] = new base_piece(p.color, (((p.office == '')&&(place.charAt(1) == (p.color == 'W'? '8' : '1')))? promote : p.office),
								place, ((!p.office)&&(Math.abs(comp(p.square, place)[1]) == 2))? 1 : 0);
		}
		else if (i !== ind_gone){
			newlive[newlive.length] = new base_piece(p.color, p.office, p.square, p.firstmove == 1? 0 : p.firstmove)
		};
	};
	if (test(newlive)){
		live = newlive;
		toMove = toMove == 'W'? 'B' : 'W';
	}
	else{
		error = true
	};
};

function peel(m){
	/* Takes a notated move and parses it into the important things, then moves. */

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

peel('e4');


