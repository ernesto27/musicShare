var musicPlayer = jQuery.extend(musicShareBase, {
	playList: [],
	items: [],
	isPlaying: true,
	firstPlayed: true,
	current: 0,
	dom:{
		list: $('#list'),
		wrapperSpotify: $('#wrapperSpotify'),
		btnNext: $('#btnNext')
	},

	init: function(){
		this.initFirebase();

		// Events
		musicPlayer.dom.btnNext.on('click', this.nextFromSpotify);
	},

	initYT: function(){

		//musicPlayer.firebase.child.orderByChild("played").equalTo(0).on("child_added", function(snapshot, prevChildKey) {
		musicPlayer.firebase.child.on("child_added", function(snapshot, prevChildKey) {
			//console.log(snapshot.key())
			var item = snapshot.val();
		  	
		  	if(!item.played){
		  		musicPlayer.items.push({ 
		  			key: snapshot.key(), 
		  		    urlSpotify: item.urlSpotify,
		  		    urlYoutube: item.urlYoutube,
		  		    source: item.source,
		  		    videoID: item.videoID
		  		});
		  		musicPlayer.dom.list.append("<li>" + item.title + "</li>");
			}


			// On load page play first source 
			if(musicPlayer.firstPlayed && musicPlayer.items.length){
				switch(musicPlayer.items[musicPlayer.current].source){
					case 'spotify':
						musicPlayer.playSpotify();
						break;
					case 'youtube':
						musicPlayer.playYoutube();
						break;
				}
				musicPlayer.firstPlayed = false;
			}


			if(!musicPlayer.isPlaying){
				musicPlayer.playYoutube();
			}

		});		
	},

	playYoutube: function(index){
		if(!musicPlayer.firstPlayed){
			musicPlayer.updateVideoStatus(musicPlayer.current);
			musicPlayer.current += 1;
		}
		

		musicPlayer.player.loadVideoById(musicPlayer.items[musicPlayer.current].videoID);
		musicPlayer.updateCurrentPlayed(1);
		musicPlayer.isPlaying = true;
	},

	playSpotify: function(){
		alert("Play spotify album");
		if(!musicPlayer.firstPlayed){
			musicPlayer.updateVideoStatus(musicPlayer.current);
			musicPlayer.current += 1;
		}

		musicPlayer.dom.wrapperSpotify
		  		   .empty()
		  		   .append(musicPlayer.getIframeSpotify(musicPlayer.items[musicPlayer.current].urlSpotify));	
		
	},

	


	nextFromSpotify: function(){
		// Check if are more items
		if(musicPlayer.items.current + 1 == musicPlayer.items.length){
			return;
		}

		if(musicPlayer.items[musicPlayer.current + 1].source == "youtube"){
			musicPlayer.playYoutube();
		}else{
			musicPlayer.playSpotify();
		}
	},

	onPlayerStateChange: function(event){
		if(event.data == 0){
			
		    if(musicPlayer.items.current == musicPlayer.items.length - 1){
		    	console.log("No more items")
		    	musicPlayer.isPlaying = false;
		    	return false;
		    }
		    
		    // Youtube video is over , play next thing
		    if(musicPlayer.items[musicPlayer.current].source == "youtube"){
			    musicPlayer.playYoutube();
			    //musicPlayer.player.loadVideoById(musicPlayer.items.next().videoID);
			    //musicPlayer.player.playVideo();
			    //musicPlayer.updateVideoStatus();

		    }else{ // spotify
		    	musicPlayer.playSpotify(musicPlayer.current++);
		    }

		}
	},

	getUpdateURL: function(index){
		return config.firebaseURL + config.firebaseChild + "/" + musicPlayer.items[index].key;
	},

	updateVideoStatus: function(index){
		var url = this.getUpdateURL(index);
		var firebaseUpdate  = new Firebase(url);
		firebaseUpdate.update({ 'played': 1});
	},

	updateCurrentPlayed: function(value){
		//var url = this.getUpdateURL();
		var url = config.firebaseURL + config.firebaseChild + "/" + musicPlayer.items[musicPlayer.current].key;
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



