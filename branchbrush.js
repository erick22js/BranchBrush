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
const BBTYPE_FLIPPER = 0x0006;
const BBTYPE_SONAR = 0x0007;

const BBSTATE_NONE = 0x0000;
const BBSTATE_GHOST = 0x0001;
const BBSTATE_MOVING = 0x0002;
const BBSTATE_TRIGGEABLE = 0x0004;
const BBSTATE_BOUNCER = 0x0008;

const block_speed = 1/16;

var bbclock = 0;

var bbsimulando = false;

const bblocks_mover = [];
const bblocks_enviorment = [];

const grid = [];

function bbGetGrid(x, y){
	return grid[Math.round(y)][Math.round(x)];
}

function bbSetGrid(x, y, block){
	grid[Math.round(y)][Math.round(x)] = block;
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
	bblocks_mover.push(block);
	bbSetGrid(block.x, block.y, block);
}

function bbAddEnviorment(block){
	bblocks_enviorment.push(block);
	bbSetGrid(block.x, block.y, block);
}

function bbRenderBlock(block){
	var color = "black";
	switch(block.type){
		case BBTYPE_MOVER:{
			color = "red";
			dwRect(color, block.x*BSIZE, block.y*BSIZE, BSIZE, BSIZE);
			if(block.direction[0]){
				var offset = (((block.direction[0]+1)/2)*.75);
				dwRect("lime", (block.x+offset)*BSIZE, block.y*BSIZE, 0.25*BSIZE, BSIZE);
			}
			else if(block.direction[1]){
				var offset = (((block.direction[1]+1)/2)*.75);
				dwRect("lime", block.x*BSIZE, (block.y+offset)*BSIZE, BSIZE, 0.25*BSIZE);
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
			color = "#50f";
			dwRect(color, block.x*BSIZE, block.y*BSIZE, BSIZE, BSIZE);
		}
		break;
		case BBTYPE_FLIPPER:{
			color = "#f03";
			dwRect(color, block.x*BSIZE, block.y*BSIZE, BSIZE, BSIZE);
		}
		break;
		case BBTYPE_SONAR:{
			color = "lime";
			dwRect(color, block.x*BSIZE, block.y*BSIZE, BSIZE, BSIZE);
		}
		break;
		default:{
			color = "black";
			dwRect(color, block.x*BSIZE, block.y*BSIZE, BSIZE, BSIZE);
		}
	}
	
	if(block.state&BBSTATE_BOUNCER){
		dwRect("white", block.x*BSIZE, block.y*BSIZE, BSIZE*.125, BSIZE*.125);
		dwRect("white", (block.x+.125)*BSIZE, block.y*BSIZE, BSIZE*.125, BSIZE*.125);
		dwRect("white", block.x*BSIZE, (block.y+.125)*BSIZE, BSIZE*.125, BSIZE*.125);
	}
	
	if(block.state&BBSTATE_TRIGGEABLE){
		dwRect("white", (block.x+.3)*BSIZE, (block.y+.3)*BSIZE, BSIZE*.4, BSIZE*.4);
		dwRect("black", (block.x+.4)*BSIZE, (block.y+.4)*BSIZE, BSIZE*.2, BSIZE*.2);
	}
}

function bbMovesFoward(block){
	if(block.state&BBSTATE_MOVING){
		if(!bbclock){
			block.bx += (block.x%1? block.direction[0]: 0);
			block.by += (block.y%1? block.direction[1]: 0);
		}
		block.x = block.bx + bbclock*block.direction[0]*block_speed;
		block.y = block.by + bbclock*block.direction[1]*block_speed;
	}
}

function bbHandleTrigger(block){
	if(block.state&BBSTATE_TRIGGEABLE && !block.triggered){
		bbSetGrid(block.x, block.y, null);
		
		block.triggered = true;
		
		if(block.type==BBTYPE_MOVER){
			var b = null;
			/*
			if((b = bbGetGrid(block.x - 1, block.y))){
				if(block.direction[0]<0){
					block.direction[0] *= -1;
				}
			}
			if((b = bbGetGrid(block.x + 1, block.y))){
				if(block.direction[0]>0){
					block.direction[0] *= -1;
				}
			}
			if((b = bbGetGrid(block.x, block.y - 1))){
				if(block.direction[1]<0){
					block.direction[1] *= -1;
				}
			}
			if((b = bbGetGrid(block.x, block.y + 1))){
				if(block.direction[1]>0){
					block.direction[1] *= -1;
					alert("psé");
				}
			}
			*/
			block.state |= BBSTATE_MOVING;
			bbMovesFoward(block);
		}
		else{
			var b = null;
			if((b = bbGetGrid(block.x - 1, block.y))){
				bbHandleTrigger(b);
			}
			if((b = bbGetGrid(block.x + 1, block.y))){
				bbHandleTrigger(b);
			}
			if((b = bbGetGrid(block.x, block.y - 1))){
				bbHandleTrigger(b);
			}
			if((b = bbGetGrid(block.x, block.y + 1))){
				bbHandleTrigger(b);
			}
		}
		
		bbSetGrid(block.x, block.y, block);
	}
}

function bbUpdateBlock(block1){
	bbSetGrid(block1.x, block1.y, null);
	
	switch(block1.type){
		case BBTYPE_MOVER:{
			bbMovesFoward(block1);
			
			for(var bi=0; bi<bblocks_enviorment.length; bi++){
				var block2 = bblocks_enviorment[bi];
				
				if(block2==block1){
					continue;
				}
				
				if(bbCheckCollision(block1, block2)){
					bbHandleTrigger(block2);
					
					block1.x = Math.round(block1.x);
					block1.y = Math.round(block1.y);
					switch(block2.type){
						case BBTYPE_RESTORE:{
							block1.bx = block1._bx;
							block1.by = block1._by;
							block1.x = block1._x;
							block1.y = block1._y;
							block1.type = block1._type;
							block1.state = block1._state;
							block1.direction[0] = block1._direction[0];
							block1.direction[1] = block1._direction[1];
							bbMovesFoward(block1);
						}
						break;
						case BBTYPE_SONAR:
						case BBTYPE_BARRIER:{
							block1.state &= ~BBSTATE_MOVING;
						}
						break;
						case BBTYPE_CROTATE:{
							var tx = block1.direction[0];
							var ty = block1.direction[1];
							block1.direction[0] = -ty;
							block1.direction[1] = tx;
							bbMovesFoward(block1);
						}
						break;
						case BBTYPE_AROTATE:{
							var tx = block1.direction[0];
							var ty = block1.direction[1];
							block1.direction[0] = ty;
							block1.direction[1] = -tx;
							bbMovesFoward(block1);
						}
						break;
						case BBTYPE_FLIPPER:{
							block1.state &= ~BBSTATE_MOVING;
						}
						case BBTYPE_INVERTER:{
							block1.direction[0] *= -1;
							block1.direction[1] *= -1;
						}
						break;
					}
				}
			}
			
			for(var bi=0; bi<bblocks_mover.length; bi++){
				var block2 = bblocks_mover[bi];
				
				if(block2==block1){
					continue;
				}
				
				if(bbCheckCollision(block1, block2)){
					block1.x = Math.round(block1.x);
					block1.y = Math.round(block1.y);
					
					if(block2.state&BBSTATE_BOUNCER){
						block1.direction[0] *= -1;
						block1.direction[1] *= -1;
					}
					else{
						block1.state &= ~BBSTATE_MOVING;
					}
					bbHandleTrigger(block2);
				}
			}
		}
		break;
		case BBTYPE_BARRIER:{
			
		}
		break;
	}
	
	bbSetGrid(block1.x, block1.y, block1);
}

function bbCheckCollision(block1, block2){
	var tx1 = (block1.x>=block2.x)&&(block1.x<(block2.x+1));
	var tx2 = (block2.x>=block1.x)&&(block2.x<(block1.x+1));
	var ty1 = (block1.y>=block2.y)&&(block1.y<(block2.y+1));
	var ty2 = (block2.y>=block1.y)&&(block2.y<(block1.y+1));
	return !(block1.state&BBSTATE_GHOST) && !(block2.state&BBSTATE_GHOST) && (tx1||tx2) && (ty1||ty2);
}

function bbInit(){
	for(var y=0; y<128; y++){
		var row = [];
		for(var x=0; x<128; x++){
			row.push(null);
		}
		grid.push(row);
	}
}

function bbUpdate(){
	if(bbsimulando){
		for(var bi=0; bi<bblocks_mover.length; bi++){
			var block = bblocks_mover[bi];
			bbUpdateBlock(block);
		}
		for(var bi=0; bi<bblocks_enviorment.length; bi++){
			var block = bblocks_enviorment[bi];
			bbUpdateBlock(block);
		}
		for(var bi=0; bi<bblocks_mover.length; bi++){
			var block = bblocks_mover[bi];
			block.triggered = false;
		}
		for(var bi=0; bi<bblocks_enviorment.length; bi++){
			var block = bblocks_enviorment[bi];
			block.triggered = false;
		}
	}
	for(var bi=0; bi<bblocks_mover.length; bi++){
		var block = bblocks_mover[bi];
		bbRenderBlock(block);
	}
	for(var bi=0; bi<bblocks_enviorment.length; bi++){
		var block = bblocks_enviorment[bi];
		bbRenderBlock(block);
	}
	
	ctx.fillStyle = "black";
	for(var x=0; x<=width; x+=BSIZE){
		ctx.fillRect(x-1, 0, 2, height);
	}
	for(var y=0; y<=height; y+=BSIZE){
		ctx.fillRect(0, y-1, width, 2);
	}
	
	ctx.globalAlpha = 0.5;
	for(var y=0; y<16; y++){
		for(var x=0; x<16; x++){
			var block = bbGetGrid(x, y);
			
			if(block){
				var color = "black";
				switch(block.type){
					case BBTYPE_MOVER:{
						color = "red";
					}
					break;
					case BBTYPE_RESTORE:{
						color = "orange";
					}
					break;
					case BBTYPE_BARRIER:{
						color = "yellow";
					}
					break;
					case BBTYPE_CROTATE:{
						color = "blue";
					}
					break;
					case BBTYPE_AROTATE:{
						color = "cyan";
					}
					break;
					case BBTYPE_INVERTER:{
						color = "#80f";
					}
					break;
					case BBTYPE_FLIPPER:{
						color = "#80f";
					}
					break;
					case BBTYPE_SONAR:{
						color = "lime";
					}
					break;
				}
				dwRect(color, x*BSIZE, y*BSIZE, BSIZE, BSIZE);
			}
		}
	}
	ctx.globalAlpha = 1;
	
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
		setTimeout(_Animate, 1000/64);
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
