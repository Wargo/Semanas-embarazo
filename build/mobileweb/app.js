// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#000');

// create tab group
var tabGroup = Titanium.UI.createTabGroup();


var win1 = Titanium.UI.createWindow({  
    title:'Foto',
    backgroundColor:'#fff',
    url:'window1.js'
});
var tab1 = Titanium.UI.createTab({  
    icon:'KS_nav_views.png',
    title:'Foto',
    window:win1
});


var win2 = Titanium.UI.createWindow({  
    title:'Vídeo',
    backgroundColor:'#fff',
    url:'window2.js'
});
var tab2 = Titanium.UI.createTab({  
    icon:'KS_nav_ui.png',
    title:'Vídeo',
    window:win2
});


var win3 = Titanium.UI.createWindow({  
    title:'Semanas',
    backgroundColor:'#fff',
    url:'window3.js'
});
var tab3 = Titanium.UI.createTab({  
    icon:'KS_nav_ui.png',
    title:'Semanas',
    window:win3
});


//
//  add tabs
//
tabGroup.addTab(tab1);  
tabGroup.addTab(tab2); 
tabGroup.addTab(tab3);  


// open tab group
tabGroup.open();
