var musicPlayer = jQuery.extend(musicShareBase, {
	playList: [],
	items: [],
	isPlaying: true,
	current: 0,
	dom:{
		list: $('#list'),
		wrapperSpotify: $('#wrapperSpotify')
	},

	init: function(){
		this.initFirebase();
		musicPlayer.getAlbumName();

		$('#update').on('click', function(){
			var f  = new Firebase("https://musicplayershare.firebaseio.com/playList/-KExjGAs18GGbXJQdo-S");
			f.update({ 'played': 1});
		});

		musicPlayer.firebase.child.on('child_changed', function(childSnapshot, prevChildKey) {
		});

		// test add spotify
		$('#addSpotify').on('click', function(e){
			musicPlayer.getAlbumName(function(){

			});
			musicPlayer.firebase.child.push({
				played: 0,
				currentPlayed: 0,
				source: 'spotify',
				urlSpotify: 'https://play.spotify.com/album/7vigRrDl9JImL8q8IghhlM',
				title: musicPlayer.getAlbumName()
			});
		});

		// next spotify
		$('#btnNext').on('click', function(){
			// Update status 
			// get current key
			if(musicPlayer.current == musicPlayer.items.length - 1){
				console.log("No more spotify items	")
				return;
			}
			var key = musicPlayer.items[musicPlayer.current].key;
			var firebaseUpdate  = new Firebase(config.firebaseURL + config.firebaseChild + "/" + key);
			firebaseUpdate.update({ 'played': 1});

			musicPlayer.current += 1;
			musicPlayer.renderSpotify(musicPlayer.current);
		});
	},

	initYT: function(){
		var firstPlayed = true;

		//musicPlayer.firebase.child.orderByChild("played").equalTo(0).on("child_added", function(snapshot, prevChildKey) {
		musicPlayer.firebase.child.on("child_added", function(snapshot, prevChildKey) {
			//console.log(snapshot.key())
			var item = snapshot.val();
		  	
		  	if(item.source == 'spotify'){
		  		console.log("do spotify thing");
		  		//alert("Play spotify")
		  		//alert("Play spotify");
		  		if(!item.played) musicPlayer.items.push({ key: snapshot.key(), 'urlSpotify': item.urlSpotify});
		  	}
			

		  	if(firstPlayed && musicPlayer.items.length){
		  		musicPlayer.renderSpotify(musicPlayer.current);
		  		firstPlayed = false;
		  	}
		  	


		  	//musicPlayer.dom.list.append("<li>" + item.videoTitle + "</li>");

		  	/*
		  	if(!item.played){
		  		var videoID = musicPlayer.getVideoID(item.urlYoutube);
		  		musicPlayer.playList.push(videoID);
				musicPlayer.items.push({ key: snapshot.key(), 'videoID': musicPlayer.getVideoID(item.urlYoutube)});

		  	}
		  	if(musicPlayer.items.length){
			  	if(firstPlayed){
			  		//musicPlayer.player.loadVideoById(musicPlayer.playList[0]);
			  		musicPlayer.updateCurrentPlayed(0);
			  		musicPlayer.player.loadVideoById(musicPlayer.items[0].videoID);
			  		musicPlayer.updateCurrentPlayed(1);
			  		firstPlayed = false;
			  		
			  	}else{
			  		if(!musicPlayer.isPlaying){
			  			musicPlayer.updateCurrentPlayed(0);
			  			musicPlayer.player.loadVideoById(musicPlayer.items.next().videoID);
			  			musicPlayer.isPlaying = true;
			  			musicPlayer.updateCurrentPlayed(1);
			  		}
			  	}
			}
			*/
		});		

		
	},

	onPlayerStateChange: function(event){
		if(event.data == 0){
		    if(musicPlayer.items.current == musicPlayer.items.length - 1){
		    	musicPlayer.isPlaying = false;
		    	return false;
		    }

		    console.log(musicPlayer.items[musicPlayer.items.current]);
		    musicPlayer.updateCurrentPlayed(0);
		    musicPlayer.player.loadVideoById(musicPlayer.items.next().videoID);
		    musicPlayer.player.playVideo();
		    musicPlayer.updateVideoStatus();
		    musicPlayer.updateCurrentPlayed(1);
		    console.log(musicPlayer.items[musicPlayer.items.current]);
		}
	},

	getUpdateURL: function(){
		return config.firebaseURL + config.firebaseChild + "/" + musicPlayer.items[musicPlayer.items.current].key;
	},

	updateVideoStatus: function(){
		var url = this.getUpdateURL();;
		var firebaseUpdate  = new Firebase(url);
		firebaseUpdate.update({ 'played': 1});
	},

	updateCurrentPlayed: function(value){
		var url = this.getUpdateURL();
		var firebaseUpdate  = new Firebase(url);
		var type = (value) ? 1 : 0;
		firebaseUpdate.update({ 'currentPlayed': type});
	},

	getIframeSpotify: function(urlSpotify){
		// https://play.spotify.com/album/1nJGwctaoyNAoCXiL3g6pF
		//https://play.spotify.com/track/6ao8MRucaq4S3axdoxqEbC
		var split = urlSpotify.split("/");
		var id = split[split.length - 1];
		return '<iframe src="https://embed.spotify.com/?uri=spotify:album:'+ id +'" width="300" height="380" frameborder="0" allowtransparency="true"></iframe>';
	},

	renderSpotify: function(index){
		musicPlayer.dom.wrapperSpotify
		  			   .empty()
		  			   .append(musicPlayer.getIframeSpotify(musicPlayer.items[index].urlSpotify));	
	}
		
});



// callback youtube api		
function onYouTubeIframeAPIReady() {
    musicPlayer.player = new YT.Player('video-placeholder', {
        width: 600,
        height: 400,
        //videoId: 'xy71Vvah7fM',

        playerVars: {
            color: 'white'
        },
        
        events: {
            onReady: musicPlayer.initYT,
            'onStateChange': musicPlayer.onPlayerStateChange
        }
    });
}
		
musicPlayer.init();

// Extend array - todo refactor this
Array.prototype.next = function() {
    return this[++this.current];
};
Array.prototype.prev = function() {
    return this[--this.current];
};
Array.prototype.current = 0;



