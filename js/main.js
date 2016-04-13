var musicShare = {
	firebaseURL: config.firebaseURL, 
	firebaseChild: config.firebaseChild,
	youtubeAPIKey: config.youtubeAPIKey, 
	firebase:{
		ref: null,
		child: null
	},

	dom:{
		url: $('#url'),
		playList: $('.list-group')
	},


	init: function(){
		this.events();
		this.initFirebase();
		this.renderPlayList();
	},
	
	initFirebase: function(){
		this.firebase.ref = new Firebase(this.firebaseURL);
		this.firebase.child = this.firebase.ref.child(this.firebaseChild);

		musicShare.firebase.child.on('child_changed', function(childSnapshot, prevChildKey) {
			console.log(childSnapshot.val());
			console.log(childSnapshot.key());
			musicShare.dom.playList.find('li').removeClass('active');
			musicShare.dom.playList.find('li').each(function(index, value){ 
				if($(this).data('key') == childSnapshot.key()){
					$(this).addClass('active');
				}
			});
		});

	},

	events: function(){
		$('#addBtn').on('click', this.addItem);
	},	


	// methods
	addItem: function(e){
		e.preventDefault();
		// Todo check valid image
		var url = musicShare.dom.url.val();
		// spotify add
		var split = url.split("/");
		var id = split[split.length - 1];
		musicShare.getAlbumName(id, function(title){
			musicShare.firebase.child.push({
				played: 0,
				currentPlayed: 0,
				source: 'spotify',
				urlSpotify: url,
				title: title
			});
		});
		
		
		// youtube add
		/*
		var url = musicShare.dom.url.val();
		var videoID = musicShare.getVideoID(url);
		musicShare.getVideoTitle(videoID, function(videoTitle){
			musicShare.firebase.child.push({
				urlYoutube: $('#url').val(),
				videoTitle: videoTitle,
				played: 0,
				currentPlayed: 0
			});
		});
		*/
	},

	renderPlayList: function(){
		//this.firebase.child.orderByChild("played").equalTo(0).on("child_added", function(snapshot, prevChildKey) {
		this.firebase.child.on("child_added", function(snapshot, prevChildKey) {
			console.log(snapshot.val());
		  	var newItem = snapshot.val();
		  	var active = (newItem.currentPlayed) ? 'active' : '';
		  	var key = snapshot.key();
		  	var li = "<li class='list-group-item "+ active +"' data-key="+ key +">" + newItem.title + "</li>"
		  	musicShare.dom.playList.append(li);
		});	
	},

	// helpers
	getVideoID: function(url){
		var video_id = url.split('v=')[1];
		var ampersandPosition = video_id.indexOf('&');
		if(ampersandPosition != -1) {
		  video_id = video_id.substring(0, ampersandPosition);
		}
		return video_id;
	},

	getYoutubeURLApi: function(videoID){
		return 'https://www.googleapis.com/youtube/v3/videos?part=snippet&id='+ videoID +'&key=' + this.youtubeAPIKey;
	},

	getVideoTitle: function(videoID, callback){
		//$.get("https://www.googleapis.com/youtube/v3/videos?part=snippet&id="+videoID+"&key="+this.youtubeAPIKey, function(data){
		$.get(this.getYoutubeURLApi(videoID), function(data){
			var videoTitle = data.items[0].snippet.title;
			callback(videoTitle);
		}, 'json');
	},

	getAlbumName: function(id, callback){
		$.get('https://api.spotify.com/v1/albums/' + id, function(data){
			console.log(data);
			var artist = data.artists[0].name;
			var album = data.name;
			callback(artist + " - " + album);
		}, 'json');
	}
};


















