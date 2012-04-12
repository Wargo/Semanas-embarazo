var win = Titanium.UI.currentWindow;

var date = null;

var label = Titanium.UI.createLabel({
	color:'#999',
	text:'Selecciona tu fecha de parto',
	font:{fontSize:20,fontFamily:'Helvetica Neue'},
	textAlign:'center',
	top:20,
	width:'auto',
	height:'auto'
});

var picker = Titanium.UI.createPicker({
	type:Titanium.UI.PICKER_TYPE_DATE,
	top:50
});

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
	alert(date);
});