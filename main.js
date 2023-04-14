




App.start = function(){
	App.running = 1200;
	
	bbInit();
	/*
	bbAddMover(bbCreateBlock(1, 5, BBTYPE_MOVER, BBSTATE_MOVING|BBSTATE_TRIGGEABLE, [1, 0]));
	bbAddMover(bbCreateBlock(8, 5, BBTYPE_MOVER, BBSTATE_NONE|BBSTATE_TRIGGEABLE, [1, 0]));
	bbAddEnviorment(bbCreateBlock(7, 5, BBTYPE_SONAR, BBSTATE_TRIGGEABLE, [0, 0]));
	bbAddEnviorment(bbCreateBlock(6, 10, BBTYPE_CROTATE, BBSTATE_NONE, [0, 0]));
	bbAddEnviorment(bbCreateBlock(1, 9, BBTYPE_CROTATE, BBSTATE_NONE, [0, 0]));
	bbAddEnviorment(bbCreateBlock(13, 5, BBTYPE_INVERTER, BBSTATE_NONE, [0, 0]));
	bbAddEnviorment(bbCreateBlock(2, 4, BBTYPE_CROTATE, BBSTATE_NONE, [0, 0]));
	bbAddEnviorment(bbCreateBlock(4, 2, BBTYPE_CROTATE, BBSTATE_NONE, [0, 0]));
	*/
};

btnexec.request = false;

App.update = function(dt){
	dwClear((false)?"#999999":"#777777");
	bbUpdate();
	
	if(btnexec.request && bbclock==0){
		btnexec.request = false;
		if(!bbsimulando){
			bbsimulando = true;
			btnexec.textContent = "Pausar";
		}
		else{
			bbsimulando = false;
			btnexec.textContent = "Iniciar";
		}
	}
	
	stdbg.textContent = bbclock+" "+btnexec.request;
	
	//App.running--;
};

btnexec.onclick = function(){
	btnexec.request = true;
}

function resetBlock(block){
	bbSetGrid(block.x, block.y, null);
	block.bx = block._bx;
	block.by = block._by;
	block.x = block._x;
	block.y = block._y;
	block.type = block._type;
	block.state = block._state;
	block.direction[0] = block._direction[0];
	block.direction[1] = block._direction[1];
	bbSetGrid(block.x, block.y, block);
}

btnreset.onclick = function(){
	if(bbsimulando){
		alert("Pause a simulação antes para reiniciar!");
	}
	else{
		for(var bi=0; bi<bblocks_mover.length; bi++){
			var block = bblocks_mover[bi];
			resetBlock(block)
		}
		for(var bi=0; bi<bblocks_enviorment.length; bi++){
			var block = bblocks_enviorment[bi];
			resetBlock(block)
		}
	}
}


App.mousedown = function(x, y){
	x /= BSIZE;
	y /= BSIZE;
	x = Math.floor(x);
	y = Math.floor(y);
	
	if(inslobj.value=="-delete-"){
		if(bblocks_mover.indexOf(bbGetGrid(x, y))!=-1){
			bblocks_mover.splice(bblocks_mover.indexOf(bbGetGrid(x, y)), 1);
		}
		if(bblocks_enviorment.indexOf(bbGetGrid(x, y))!=-1){
			bblocks_enviorment.splice(bblocks_enviorment.indexOf(bbGetGrid(x, y)), 1);
		}
		
		bbSetGrid(x, y, null);
	}
	else{
		if(bbGetGrid(x, y)){
			return;
		}
		
		var type = eval(inslobj.value);
		var adder;
		
		if(type==BBTYPE_MOVER){
			adder = bbAddMover;
		}
		else{
			adder = bbAddEnviorment;
		}
		var block = bbCreateBlock(x, y, type,
				(chkmoving.checked?BBSTATE_MOVING:BBSTATE_NONE)|
				(chkghost.checked?BBSTATE_GHOST:BBSTATE_NONE)|
				(chktriggeable.checked?BBSTATE_TRIGGEABLE:BBSTATE_NONE)|
				(chkbouncer.checked?BBSTATE_BOUNCER:BBSTATE_NONE)
			, type==BBTYPE_MOVER?eval(insldir.value):[0, 0]);
		
		adder(block);
	}
}
