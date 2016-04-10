var musicPlayer = jQuery.extend(musicShareBase, {
	playList: [],
	dom:{
		list: $('#list')
	},

	init: function(){
		this.initFirebase();
	},

	initYT: function(){
		var firstPlayed = false;

		musicPlayer.firebase.child.orderByChild("played").equalTo(0).on("child_added", function(snapshot, prevChildKey) {
			var item = snapshot.val();
		  	//console.log(item)
	
		  	musicPlayer.dom.list.append("<li>" + item.urlYoutube + "</li>");
		  	var videoID = musicPlayer.getVideoID(item.urlYoutube);
		  	musicPlayer.playList.push(videoID);
		  	if(!firstPlayed){
		  		musicPlayer.player.loadVideoById(musicPlayer.playList[0]);
		  		firstPlayed = true;
		  	}
		});			
	},

	onPlayerStateChange: function(event){
		if(event.data == 0){
		    musicPlayer.player.loadVideoById(musicPlayer.playList.next());
		    musicPlayer.player.playVideo();
		}
	}
		
});



// callback youtube api		
function onYouTubeIframeAPIReady() {
    musicPlayer.player = new YT.Player('video-placeholder', {
        width: 600,
        height: 400,
        videoId: 'xy71Vvah7fM',

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



