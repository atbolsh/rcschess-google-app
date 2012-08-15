var officers = "NBQRK";
var horz = "abcdefgh";
var vert = "12345678";

function read(move){
	/*Given a move in standard format, outputs
	the office, type of move, place to which to
	move, and the optional identifier*/

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

	if(o){
		return [o, s? s : f, s? f : s];
	}
	else{
		return [t, s? s : f, s? f : s];
	}
};


