




App.start = function(){
	App.running = 1200;
	
	bbInit();
	
	/*
	bbAddMover(bbCreateBlock(1, 5, BBTYPE_MOVER, BBSTATE_MOTION|BBSTATE_TRIGGEABLE, [1, 0]));
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
		for(var y=0; y<16; y++){
			for(var x=0; x<16; x++){
				var block = bbGetGrid(x, y);
				if(block){
					resetBlock(block)
				}
			}
		}
	}
}


btnload.onclick = function(){
	if(bbsimulando){
		alert("Pause a simulação antes para carregar!");
		return;
	}
	
	var inp = document.createElement("input");
	inp.type = "file";
	
	inp.onchange = function(){
		var file = this.files[0];
		
		if(file){
			var reader = new FileReader();
			reader.readAsText(file, 'UTF-8');
			reader.onload = function(ev){
				var src = ev.target.result;
				var obj = JSON.parse(src);
				
				for(var x=0; x<obj.width; x++){
					for(var y=0; y<obj.height; y++){
						bbSetGrid(x, y, obj.data[y][x]);
					}
				}
			}
		}
	}
	
	inp.click();
}

function download(filename, text) {
	var element = document.createElement('a');
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
	element.setAttribute('download', filename);

	element.style.display = 'none';
	document.body.appendChild(element);

	element.click();

	document.body.removeChild(element);
}

btnsave.onclick = function(){
	if(bbsimulando){
		alert("Pause a simulação antes para salvar!");
		return;
	}
	
	download("bb-project.json", JSON.stringify({"width":16, "height":16, "data":grid}));
}


App.mousedown = function(x, y){
	x /= BSIZE;
	y /= BSIZE;
	x = Math.floor(x);
	y = Math.floor(y);
	
	if(inslobj.value=="-delete-"){
		bbSetGrid(x, y, null);
	}
	else if(inslobj.value=="-alter-"){
		var block = bbGetGrid(x, y);
		if(block){
			block.direction = block.type==BBTYPE_MOVER?eval(insldir.value):[0, 0];
			block.state = 0;
			block.state |= (chkmoving.checked?BBSTATE_MOTION:BBSTATE_NONE);
			block.state |= (chktriggeable.checked?BBSTATE_TRIGGEABLE:BBSTATE_NONE);
			block.state |= (chkbouncer.checked?BBSTATE_BOUNCER:BBSTATE_NONE);
			block._state = block.state;
		}
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
				(chkmoving.checked?BBSTATE_MOTION:BBSTATE_NONE)|
				(chktriggeable.checked?BBSTATE_TRIGGEABLE:BBSTATE_NONE)|
				(chkbouncer.checked?BBSTATE_BOUNCER:BBSTATE_NONE)
			, type==BBTYPE_MOVER?eval(insldir.value):[0, 0]);
		
		adder(block);
	}
}
