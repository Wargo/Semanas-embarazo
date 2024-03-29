function ApplicationWindow() {
	//declare module dependencies
	var MasterView = require('ui/common/MasterView'),
		DetailView = require('ui/common/DetailView');
		
	//create object instance
	var self = Ti.UI.createWindow({
		title:'Semanas del Embarazo',
		exitOnClose:true,
		navBarHidden:false,
		backgroundColor:'#ffffff'
	});
	
	var self = Titanium.UI.currentWindow;
		
	//construct UI
	var masterView = new MasterView(),
		detailView = new DetailView();
		
	//create master view container
	self.add(masterView);
	
	//create detail view container
	var detailContainerWindow = Ti.UI.createWindow({
		title:'Detalles de la semana',
		navBarHidden:false,
		backgroundColor:'#ffffff'
	});
	detailContainerWindow.add(detailView);
    
	//add behavior for master view
	masterView.addEventListener('itemSelected', function(e) {
		detailView.fireEvent('itemSelected',e);
		detailContainerWindow.open();
	});
	
	return self;
};

module.exports = ApplicationWindow;
