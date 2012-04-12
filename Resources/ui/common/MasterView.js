function MasterView() {
	var self = Ti.UI.createView({
		backgroundColor:'white'
	});
	
	//some dummy data for our table view
	var tableData = [
		{title:'Semana 1', description:'Primeros pasos\r\ndel óvulo fertilizado', hasChild:false},
		{title:'Semana 2', description:'Primeras formas. El tubo neural', hasChild:false},
		{title:'Semana 3', description:'Los primeros órganos empiezan a formarse. Las maravillosas células del corazón', hasChild:false},
		{title:'Semana 4', description:'El crecimiento se acelera', hasChild:false},
		{title:'Semana 5', description:'Un pequeño gran estirón', hasChild:false},
		{title:'Semana 6', description:'Una cabeza grandota', hasChild:false},
		{title:'Semana 7', description:'Primeros pasos del óvulo fertilizado', hasChild:false},
		{title:'Semana 8', description:'Primeras formas. El tubo neural', hasChild:false},
		{title:'Semana 9', description:'Los primeros órganos empiezan a formarse. Las maravillosas células del corazón', hasChild:false},
		{title:'Semana 10', description:'El crecimiento se acelera', hasChild:false},
		{title:'Semana 11', description:'Un pequeño gran estirón', hasChild:false},
		{title:'Semana 12', description:'Una cabeza grandota', hasChild:false}
	];
	
	var table = Ti.UI.createTableView({
		data:tableData
	});
	self.add(table);
	
	//add behavior
	table.addEventListener('click', function(e) {
		self.fireEvent('itemSelected', {
			name:e.rowData.title,
			description:e.rowData.description
		});
	});
	
	return self;
};

module.exports = MasterView;