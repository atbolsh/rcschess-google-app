var dragged;

function onMouseMove(e){
// credit where it is due: http://www.quirksmode.org/js/events_properties.html, seen Jul 9, 2012.
// When upgrade to actual board, just use page coordinates; don't bother with divs and the like.
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
//	console.log([posx, posy]);
	dragged.style.left = (_offsetX + posx - _startX) + 'px'; _dragElement.style.top = (_offsetY + posy - _startY) + 'px';
};

function ExtractNumber(value){
	var n = parseInt(value);
	return (n == null) || isNaN(n) ? 0 : n;
};


function onMouseDown(e){
	var posx = 0;
	var posy = 0;
	if (!e) {var e = window.event;};
	var target = e.target != null ? e.target : e.srcElement;

	if (target.className == 'drag'){
		// grab the mouse position
		_startX = e.clientX; _startY = e.clientY;
		// grab the clicked element's position
		_offsetX = ExtractNumber(target.style.left); 
		_offsetY = ExtractNumber(target.style.top);
		// bring the clicked element to the front while it is being dragged
		_oldZIndex = target.style.zIndex; target.style.zIndex = 10000;

		dragged = target;
		document.addEventListener("mousemove", onMouseMove, false);
	};
	return false;
};

function onMouseUp(e){
	if(dragged){
		dragged.style.zIndex = _oldZIndex;
		dragged = undefined;
		document.removeEventListener("mousemove", onMouseMove, false);
	};
};
	

document.addEventListener("mousedown", OnMouseDown, false);
document.addEventListener("mouseup", OnMouseUp, false);
