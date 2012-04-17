var win = Titanium.UI.currentWindow;

var date = null;

var label = Titanium.UI.createLabel({
	color:'#999',
	text:null,
	font:{fontSize:20,fontFamily:'Helvetica Neue'},
	textAlign:'center',
	top:20,
	width:'auto',
	height:'auto'
});

var saved_date = Ti.App.Properties.getString('date');

if (saved_date) {
	label.text = JSON.parse(saved_date);
}

var picker = Titanium.UI.createPicker({
	type:Titanium.UI.PICKER_TYPE_DATE,
	top:80
});

if (Ti.Platform.osname == 'android') {
	picker.top = 200;
}

var button = Titanium.UI.createButton({
	title:'Guardar',
	bottom:10,
	textAlign:'center',
	width:150,
	height:40
});

win.add(label);
win.add(picker);
win.add(button);


picker.addEventListener('change', function(e) {
	date = e.value.toLocaleString();
});

button.addEventListener('click', function(e) {
	Ti.App.Properties.setString('date', JSON.stringify(date));
	label.text = date;
});

