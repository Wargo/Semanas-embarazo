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
	title:'Capturar vídeo',
	width:170,
	height:80,
	bottom:20
})
win.add(button);

button.addEventListener('click', function(e) {
	Titanium.Media.showCamera({
		success:function(e) {
			if (e.mediaType === Titanium.Media.MEDIA_TYPE_VIDEO) {
				var w = Titanium.UI.createWindow({
					title:'Nuevo vídeo',
					backgroundColor:'#000000'
				});
				var videoPlayer = Titanium.Media.createVideoPlayer({
					media:e.media
				});
				w.add(videoPlayer);
				
				videoPlayer.addEventListener('complete', function(e) {
					w.remove(videoPlayer);
					videoPlayer = null;
					w.close();
				});
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
		mediaTypes:[Titanium.Media.MEDIA_TYPE_VIDEO],
		videoQuality:Titanium.Media.QUALITY_HIGH
	})
});


