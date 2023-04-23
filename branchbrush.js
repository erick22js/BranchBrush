const ctx = tela.getContext("2d");
const width = Number(tela.width);
const height = Number(tela.height);


/**
	MECHANICS FUNCTIONS
*/

//
// Block Structure
// x:int
// y:int
// type:bbType
// state:bbState
//
const BBTYPE_MOVER = 0x0000;
const BBTYPE_RESTORE = 0x0001;
const BBTYPE_BARRIER = 0x0002;
const BBTYPE_CROTATE = 0x0003;
const BBTYPE_AROTATE = 0x0004;
const BBTYPE_INVERTER = 0x0005;
const BBTYPE_REDIRPOS = 0x0006;
const BBTYPE_REDIRNEG = 0x0007;
const BBTYPE_SONAR = 0x0008;

const BBSTATE_NONE = 0x0000;
const BBSTATE_MOTION = 0x0001;
const BBSTATE_TRIGGEABLE = 0x0002;
const BBSTATE_BOUNCER = 0x0004;

const block_speed = 1/16;

const MAXDIST_SONAR = 16;

var bbclock = 0;

var bbsimulando = false;
var showingmap = true;

const grid = [];

function bbGetGrid(x, y){
	if(x<0 || x>=16 || y<0 || y>=16){
		return {"x":Math.floor(x), "y":Math.floor(y), "type":BBTYPE_CROTATE, "state":BBSTATE_MOTION, "_type":BBTYPE_INVERTER, "_state":BBSTATE_NONE};
	}
	return grid[Math.floor(y)][Math.floor(x)];
}

function bbSetGrid(x, y, block){
	if(x<0 || x>=16 || y<0 || y>=16){
		return;
	}
	grid[Math.floor(y)][Math.floor(x)] = block;
}

function bbCreateBlock(x, y, type=BBTYPE_MOVER, state=BBSTATE_NONE, direction=[1, 0]){
	return {
		"bx":(~~x), "by":(~~y),
		"x":(~~x), "y":(~~y), "type":type, "state":state, "direction":[direction[0], direction[1]],
		"_bx":(~~x), "_by":(~~y),
		"_x":(~~x), "_y":(~~y), "_type":type, "_state":state, "_direction":[direction[0], direction[1]],
		"triggered":false
		};
}

function bbAddMover(block){
	bbSetGrid(block.x, block.y, block);
}

function bbAddEnviorment(block){
	bbSetGrid(block.x, block.y, block);
}

function bbRenderBlock(block){
	var color = "black";
	switch(block.type){
		case BBTYPE_MOVER:{
			color = "red";
			dwRect(color, block.x*BSIZE, block.y*BSIZE, BSIZE, BSIZE);
			if(block.direction[0]){
				var offset = (((block.direction[0]+1)/2)*.8);
				dwRect("lime", (block.x+offset)*BSIZE, block.y*BSIZE, 0.2*BSIZE, BSIZE);
			}
			else if(block.direction[1]){
				var offset = (((block.direction[1]+1)/2)*.8);
				dwRect("lime", block.x*BSIZE, (block.y+offset)*BSIZE, BSIZE, 0.2*BSIZE);
			}
		}
		break;
		case BBTYPE_RESTORE:{
			color = "orange";
			dwRect(color, block.x*BSIZE, block.y*BSIZE, BSIZE, BSIZE);
		}
		break;
		case BBTYPE_BARRIER:{
			color = "yellow";
			dwRect(color, block.x*BSIZE, block.y*BSIZE, BSIZE, BSIZE);
		}
		break;
		case BBTYPE_CROTATE:{
			color = "blue";
			dwRect(color, block.x*BSIZE, block.y*BSIZE, BSIZE, BSIZE);
		}
		break;
		case BBTYPE_AROTATE:{
			color = "cyan";
			dwRect(color, block.x*BSIZE, block.y*BSIZE, BSIZE, BSIZE);
		}
		break;
		case BBTYPE_INVERTER:{
			color = "#f07";
			dwRect(color, block.x*BSIZE, block.y*BSIZE, BSIZE, BSIZE);
		}
		break;
		case BBTYPE_REDIRPOS:{
			color = "lime";
			dwRect(color, block.x*BSIZE, block.y*BSIZE, BSIZE, BSIZE);
		}
		break;
		case BBTYPE_REDIRNEG:{
			color = "aqua";
			dwRect(color, block.x*BSIZE, block.y*BSIZE, BSIZE, BSIZE);
		}
		break;
		case BBTYPE_SONAR:{
			color = "#999";
			dwRect(color, block.x*BSIZE, block.y*BSIZE, BSIZE, BSIZE);
		}
		break;
		default:{
			color = "black";
			dwRect(color, block.x*BSIZE, block.y*BSIZE, BSIZE, BSIZE);
		}
	}
	
	if(block.state&BBSTATE_BOUNCER){
		dwRect("blue", (block.x)*BSIZE, (block.y)*BSIZE, BSIZE*.3, BSIZE*.3);
		dwRect("white", (block.x)*BSIZE, (block.y)*BSIZE, BSIZE*.2, BSIZE*.2);
	}
	
	if(!(block.state&BBSTATE_MOTION)){
		dwRect("black", (block.x+.2)*BSIZE, (block.y+.2)*BSIZE, BSIZE*.6, BSIZE*.6);
	}
	
	if(block.state&BBSTATE_TRIGGEABLE){
		dwRect("white", (block.x+.3)*BSIZE, (block.y+.3)*BSIZE, BSIZE*.4, BSIZE*.4);
		dwRect("black", (block.x+.4)*BSIZE, (block.y+.4)*BSIZE, BSIZE*.2, BSIZE*.2);
	}
	
	ctx.globalAlpha = 1;
}

function bbHandleMoverNeighbors(block1){
	for(var ni=0; ni<neighbors.length; ni++){
		var block2 = bbGetGrid(Math.floor(block1.x)+neighbors[ni][0], Math.floor(block1.y)+neighbors[ni][1]);
		
		if(block2==block1 || block2==null){
			continue;
		}
		
		if(bbCheckCollision(block1, block2)){
			block1.x = block1.bx;
			block1.y = block1.by;
			
			switch(block2.type){
				case BBTYPE_MOVER:{
					if(block2.state&BBSTATE_BOUNCER){
						block1.direction[0] *= -1;
						block1.direction[1] *= -1;
						bbMovesFoward(block1);
					}
					else{
						block1.state &= ~BBSTATE_MOTION;
					}
				}
				break;
				case BBTYPE_RESTORE:{
					block1.bx = block1._bx;
					block1.by = block1._by;
					block1.x = block1._x;
					block1.y = block1._y;
					block1.type = block1._type;
					block1.state = block1._state;
					block1.direction[0] = block1._direction[0];
					block1.direction[1] = block1._direction[1];
				}
				break;
				case BBTYPE_SONAR:{
					var x = block2.x + block1.direction[0];
					var y = block2.y + block1.direction[1];
					
					var relocated = false;
					
					for(var i=0; i<MAXDIST_SONAR && !(x<0||x>16||y<0||y>16); i++){
						if(bbGetGrid(x, y) && bbGetGrid(x, y).type==BBTYPE_SONAR){
							x += block1.direction[0];
							y += block1.direction[1];
							if(bbGetGrid(x, y)==null){
								block1.bx = x;
								block1.by = y;
								block1.x = x;
								block1.y = y;
								relocated = true;
							}
							else{
								break;
							}
						}
						else{
							x += block1.direction[0];
							y += block1.direction[1];
						}
					}
					
					if(!relocated){
						block1.state &= ~BBSTATE_MOTION;
					}
				}
				break;
				case BBTYPE_BARRIER:{
					block1.state &= ~BBSTATE_MOTION;
				}
				break;
				case BBTYPE_CROTATE:{
					var tx = block1.direction[0];
					var ty = block1.direction[1];
					block1.direction[0] = -ty;
					block1.direction[1] = tx;
				}
				break;
				case BBTYPE_AROTATE:{
					var tx = block1.direction[0];
					var ty = block1.direction[1];
					block1.direction[0] = ty;
					block1.direction[1] = -tx;
				}
				break;
				case BBTYPE_INVERTER:{
					block1.direction[0] *= -1;
					block1.direction[1] *= -1;
				}
				break;
				case BBTYPE_REDIRPOS:{
					var tx = block1.direction[0];
					var ty = block1.direction[1];
					block1.direction[0] = Math.abs(ty);
					block1.direction[1] = Math.abs(tx);
				}
				break;
				case BBTYPE_REDIRNEG:{
					var tx = block1.direction[0];
					var ty = block1.direction[1];
					block1.direction[0] = -Math.abs(ty);
					block1.direction[1] = -Math.abs(tx);
				}
				break;
			}
			
			if(block2.type!=BBTYPE_MOVER && block2.type!=BBTYPE_BARRIER){
				if(!(block2.state&BBSTATE_MOTION)){
					block1.state &= ~BBSTATE_MOTION;
				}
				else if(block1.state&BBSTATE_MOTION){
					bbMovesFoward(block1);
				}
			}
			
			bbHandleTrigger(block2);
		}
	}
}

function bbMovesFoward(block){
	if(block.state&BBSTATE_MOTION){
		if(!bbclock){
			block.bx += (block.x%1? block.direction[0]: 0);
			block.by += (block.y%1? block.direction[1]: 0);
		}
		block.x = block.bx + bbclock*block.direction[0]*block_speed;
		block.y = block.by + bbclock*block.direction[1]*block_speed;
		
		bbHandleMoverNeighbors(block);
	}
	else{
		block.x = block.bx;
		block.y = block.by;
	}
}

function bbHandleTrigger(block){
	if(block.state&BBSTATE_TRIGGEABLE && !block.triggered){
		block.triggered = true;
		
		if(block.type==BBTYPE_MOVER){
			var b = null;
			block.state |= BBSTATE_MOTION;
			bbMovesFoward(block);
		}
		else{
			var b = null;
			if((b = bbGetGrid(block.bx - 1, block.by))){
				bbHandleTrigger(b);
			}
			if((b = bbGetGrid(block.bx + 1, block.by))){
				bbHandleTrigger(b);
			}
			if((b = bbGetGrid(block.bx, block.by - 1))){
				bbHandleTrigger(b);
			}
			if((b = bbGetGrid(block.bx, block.by + 1))){
				bbHandleTrigger(b);
			}
		}
	}
}

var neighbors = [
	[0, 0], [0, 1], [1, 0], [1, 1],
];

function bbUpdateBlock(block1){
	switch(block1.type){
		case BBTYPE_MOVER:{
			if(bbGetGrid(block1.bx, block1.by)==block1){
				bbSetGrid(block1.bx, block1.by, null);
			}
			
			bbHandleMoverNeighbors(block1);
			
			bbMovesFoward(block1);
			
			if(bbGetGrid(block1.bx, block1.by)==null){
				bbSetGrid(block1.bx, block1.by, block1);
			}
		}
		break;
		case BBTYPE_BARRIER:{
			
		}
		break;
	}
}

function bbCheckCollision(block1, block2){
	var tx1 = (block1.x >= Math.round(block2.x)) && (block1.x < (Math.round(block2.x)+1));
	var tx2 = (Math.round(block2.x) >= block1.x) && (Math.round(block2.x) < (block1.x+1));
	var ty1 = (block1.y >= Math.round(block2.y)) && (block1.y < (Math.round(block2.y)+1));
	var ty2 = (Math.round(block2.y) >= block1.y) && (Math.round(block2.y) < (block1.y+1));
	return (tx1||tx2) && (ty1||ty2);
}

function bbInit(){
	for(var y=0; y<16; y++){
		var row = [];
		for(var x=0; x<16; x++){
			row.push(null);
		}
		grid.push(row);
	}
}

function bbUpdate(){
	if(bbsimulando){
		for(var y=0; y<16; y++){
			for(var x=0; x<16; x++){
				var block = bbGetGrid(x, y);
				if(block){
					bbUpdateBlock(block);
				}
			}
		}
	}
	for(var y=0; y<16; y++){
		for(var x=0; x<16; x++){
			var block = bbGetGrid(x, y);
			if(block){
				bbRenderBlock(block);
			}
		}
	}
	for(var y=0; y<16; y++){
		for(var x=0; x<16; x++){
			var block = bbGetGrid(x, y);
			if(block){
				block.triggered = false;
			}
		}
	}
	
	ctx.fillStyle = "black";
	for(var x=0; x<=width; x+=BSIZE){
		ctx.fillRect(x-1, 0, 2, height);
	}
	for(var y=0; y<=height; y+=BSIZE){
		ctx.fillRect(0, y-1, width, 2);
	}
	
	if(showingmap){
		for(var y=0; y<16; y++){
			for(var x=0; x<16; x++){
				var block = bbGetGrid(x, y);
				if(block){
					var color = "black";
					ctx.globalAlpha = 0.4;
					dwRect(color, x*BSIZE, y*BSIZE, BSIZE, BSIZE);
					ctx.fillStyle = "white";
					ctx.font = (BSIZE/2)+"px sans-serif";
					ctx.globalAlpha = 1;
					ctx.fillText(block.type, x*BSIZE, (y+.95)*BSIZE);
				}
			}
		}
	}
	
}


/**
	RENDERING FUNCTIONS
*/

const BSIZE = 32;

function dwClear(color="#00000000"){
	ctx.fillStyle = color;
	ctx.fillRect(0, 0, width, height);
}

function dwRect(color, x, y, width, height){
	ctx.fillStyle = color;
	ctx.fillRect(x, y, width, height);
}


/**
	FRAME PROCESSING FUNCTIONS
*/


const App = {
	"start": function(){},
	"update": function(dt){},
	"mousedown": function(x, y){},
	"mouseup": function(x, y){},
	"mousemove": function(x, y){},
	"running": true,
	"_ltime": 0,
};

function _Animate(time=0){
	if(App["running"]){
		//var dt = (time-App["_ltime"])/1000;
		//App["_ltime"] = time;
		App["update"](1/4);
		bbclock += 1;
		bbclock %= Math.ceil(1/block_speed);
		setTimeout(_Animate, 1000/Number(fpRate.value));
	}
}

window.onload = function(){
	App["running"] = true;
	App["start"]();
	_Animate(0);
}

tela.onmousedown = function(ev){
	App["mousedown"](ev.offsetX, ev.offsetY);
}

tela.onmouseup = function(ev){
	App["mouseup"](ev.offsetX, ev.offsetY);
}

tela.onmousemove = function(ev){
	App["mousemove"](ev.offsetX, ev.offsetY);
}
