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
		musicPlayer.firstPlayed = true;

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

			/*
		  	if(firstPlayed && musicPlayer.items.length){
		  		musicPlayer.renderSpotify(musicPlayer.current);
		  		firstPlayed = false;
		  	}
		  	*/


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

	playYoutube: function(index){
		if(!musicPlayer.firstPlayed){
			musicPlayer.updateVideoStatus(musicPlayer.current);
			musicPlayer.current += 1;
		}

		musicPlayer.player.loadVideoById(musicPlayer.items[musicPlayer.current].videoID);
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
		    	musicPlayer.isPlaying = false;
		    	return false;
		    }
		    
		    // Youtube video is over , play next thing
		    if(musicPlayer.items.next().source == "youtube"){
			    musicPlayer.playYoutube();
			    //musicPlayer.player.loadVideoById(musicPlayer.items.next().videoID);
			    //musicPlayer.player.playVideo();
			    //musicPlayer.updateVideoStatus();

		    }else{ // spotify
		    	musicPlayer.playSpotify(musicPlayer.items.next());
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



