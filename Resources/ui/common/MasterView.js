function MasterView() {
	var self = Ti.UI.createView({
		backgroundColor:'white'
	});
	
	//some dummy data for our table view
	var tableData = [
		{title:'Semana 1', content:'Primeros pasos\r\ndel óvulo fertilizado', hasChild:true},
		{title:'Semana 2', content:'Primeras formas. El tubo neural', hasChild:true},
		{title:'Semana 3', content:'Los primeros órganos empiezan a formarse. Las maravillosas células del corazón', hasChild:true},
		{title:'Semana 4', content:'El crecimiento se acelera', hasChild:true},
		{title:'Semana 5', content:'Un pequeño gran estirón', hasChild:true},
		{title:'Semana 6', content:'Una cabeza grandota', hasChild:true},
		{title:'Semana 7', content:'Primeros pasos del óvulo fertilizado', hasChild:true},
		{title:'Semana 8', content:'Primeras formas. El tubo neural', hasChild:true},
		{title:'Semana 9', content:'Los primeros órganos empiezan a formarse. Las maravillosas células del corazón', hasChild:true},
		{title:'Semana 10', content:'El crecimiento se acelera', hasChild:true},
		{title:'Semana 11', content:'Un pequeño gran estirón', hasChild:true},
		{title:'Semana 12', content:'Una cabeza grandota', hasChild:true}
	];
	
	var table = Ti.UI.createTableView({
		data:tableData
	});
	self.add(table);
	
	//add behavior
	table.addEventListener('click', function(e) {
		self.fireEvent('itemSelected', {
			name:e.rowData.title,
			title:e.rowData.title,
			content:e.rowData.content
		});
	});
	
	return self;
};

module.exports = MasterView;