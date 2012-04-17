function MasterView() {
	var self = Ti.UI.createView({
		backgroundColor:'white'
	});
	
	/*
	 * Leyendo un XML online
	 *
	Titanium.Yahoo.yql(
		'select * from xml where url = "http://elembarazo.net/semana/feed"',
		function (e) {
			//alert(e.data);
		}
	);
	*/
	
	/*
	 * Leyendo fichero remoto
	 *
	var url = 'http://www.google.com';
	var url = 'prueba.js'; // No funciona
	var client = Ti.Network.createHTTPClient({
		onload: function(e) {
			//alert(this.responseText);
		},
		onerror: function(e) {
			//alert(e)
		},
		timeout: 5000
	});
	client.open('GET', url, true);
	client.send();
	*/
	
	
	/*
	 * Leyendo de un fichero local
	 */
	var readFile = Titanium.Filesystem.getFile(Titanium.Filesystem.resourcesDirectory, 'data.js');
	var local_data = readFile.read();
	data = eval(local_data.text); // se convierte en array
	
	/*
	 * Guardando y leyendo fichero
	 *
	Ti.App.Properties.setString('data', JSON.stringify(data));
	var data = Ti.App.Properties.getString('data', 'Los datos no han podido ser cargados');
	data = JSON.parse(data);
	*/
	
	var tableData = data
	
	var table = Ti.UI.createTableView({
		data:tableData
	});
	self.add(table);
	
	//add behavior
	table.addEventListener('click', function(e) {
		self.fireEvent('itemSelected', {
			name:e.rowData.title,
			title:e.rowData.title,
			content:e.rowData.content,
			backgroundColor:'#FF0000'
		});
	});
	
	return self;
};

module.exports = MasterView;