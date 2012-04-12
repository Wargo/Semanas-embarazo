var win = Titanium.UI.currentWindow;

var label = Titanium.UI.createLabel({
	color:'#999',
	text:'Coge foto',
	font:{fontSize:20,fontFamily:'Helvetica Neue'},
	textAlign:'center',
	bottom:20,
	width:'auto'
});

//win.add(label);

var button = Titanium.UI.createButton({
	title:'Capturar foto',
	width:170,
	height:80,
	bottom:20
})
win.add(button);

button.addEventListener('click', function(e) {
	Titanium.Media.showCamera({
		success:function(e) {
			if (e.mediaType === Titanium.Media.MEDIA_TYPE_PHOTO) {
				var imageView = Titanium.UI.createImageView({
					image:e.media,
					width:300,
					//height:215,
					top:20,
					zIndex:1
				});
				win.add(imageView);
			}
		},
		error:function(e) {
			alert('Error');
		},
		cancel:function(e) {
			alert('Cancelado');
		},
		allowEditing:true,
		saveToPhotoGallery:true,
		mediaTypes:[Titanium.Media.MEDIA_TYPE_PHOTO],
		videoQuality:Titanium.Media.QUALITY_HIGH
	})
});


