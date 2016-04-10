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

	},

	events: function(){
		$('#addBtn').on('click', this.addItem);
	},	


	// methods
	addItem: function(e){
		e.preventDefault();
		// Get title video
		var url = musicShare.dom.url.val();
		var videoID = musicShare.getVideoID(url);
		musicShare.getVideoTitle(videoID, function(videoTitle){
			musicShare.firebase.child.push({
				urlYoutube: $('#url').val(),
				videoTitle: videoTitle,
				played: 0
			});
		});
	},

	renderPlayList: function(){
		this.firebase.child.orderByChild("played").equalTo(0).on("child_added", function(snapshot, prevChildKey) {
			console.log(snapshot.val());
		  	var newItem = snapshot.val();
		  	musicShare.dom.playList.append("<li class='list-group-item'>" + newItem.videoTitle + "</li>");
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
	}
};


















