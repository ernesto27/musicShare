var musicPlayer = jQuery.extend(musicShareBase, {
	playList: [],
	items: [],
	isPlaying: true,
	dom:{
		list: $('#list')
	},

	init: function(){
		this.initFirebase();

		$('#update').on('click', function(){
			var f  = new Firebase("https://musicplayershare.firebaseio.com/playList/-KExjGAs18GGbXJQdo-S");
			f.update({ 'played': 1});
		});

		musicPlayer.firebase.child.on('child_changed', function(childSnapshot, prevChildKey) {
			console.log(childSnapshot.val());
			console.log(childSnapshot.key());
		});
	},

	initYT: function(){
		var firstPlayed = true;

		//musicPlayer.firebase.child.orderByChild("played").equalTo(0).on("child_added", function(snapshot, prevChildKey) {
		musicPlayer.firebase.child.on("child_added", function(snapshot, prevChildKey) {
			//console.log(snapshot.key())
			var item = snapshot.val();
		  	console.log(item)
	
		  	musicPlayer.dom.list.append("<li>" + item.videoTitle + "</li>");

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



