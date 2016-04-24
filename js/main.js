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
		playList: $('.list-group'),
		itemTpl: $('#item-tpl')
	},

	template: null,


	init: function(){
		this.events();
		this.initFirebase();
		this.renderPlayList();

		var source   = this.dom.itemTpl.html();
		this.template = Handlebars.compile(source);

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

		// Check if is spotify or youtube url
		var check = url.match(/youtube|spotify/);

		if(check){
			switch(check[0]){
				case 'youtube':
					addYoutube();
					break;
				case 'spotify':
					addSpotify();
					break;
			}

		}else{
			alert("Insert a valid url");
			return;
		} 

		function addSpotify(){
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
		}
		
		
		function addYoutube(){
			var url = musicShare.dom.url.val();
			var videoID = musicShare.getVideoID(url);
			musicShare.getVideoData(videoID, function(videoTitle, duration){
				musicShare.firebase.child.push({
					played: 0,
					currentPlayed: 0,
					source: 'youtube',
					urlYoutube: $('#url').val(),
					title: videoTitle,
					videoID: videoID,
					duration: duration
				});
			});
		}
	
	},

	renderPlayList: function(){
		//this.firebase.child.orderByChild("played").equalTo(0).on("child_added", function(snapshot, prevChildKey) {
		this.firebase.child.on("child_added", function(snapshot, prevChildKey) {
			console.log(snapshot.val());
		  	var newItem = snapshot.val();
		  	var active = (newItem.currentPlayed) ? 'active' : '';
		  	var key = snapshot.key();
		  	//var li = "<li class='list-group-item "+ active +"' data-key="+ key +">" + newItem.title + "</li>"
		  	musicShare.dom.playList.append(musicShare.template({
		  		key: key,
		  		title: newItem.title,
		  		active: active,
		  		duration: newItem.duration
		  	}));
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
		return 'https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id='+ videoID +'&key=' + this.youtubeAPIKey;
	},

	getVideoData: function(videoID, callback){
		//$.get("https://www.googleapis.com/youtube/v3/videos?part=snippet&id="+videoID+"&key="+this.youtubeAPIKey, function(data){
		
		$.get(this.getYoutubeURLApi(videoID), function(data){
			console.log(data);
			var videoTitle = data.items[0].snippet.title;
			var duration   = data.items[0].contentDetails.duration;			  
			callback(videoTitle, musicShare.getDurationVideo(duration));
		}, 'json');
	},


	getDurationVideo: function(duration){
		var regexpDurations = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;
		var timeArray = duration.match(regexpDurations);
		var hour = (timeArray[1]) ? timeArray[1] + ":" : ""; 
		var minutes = "00";
		var seconds = "00";

		if(timeArray[2]){
			minutes = (timeArray[2] < 10) 
							? 0 + timeArray[2]
							: timeArray[2]; 
		}
		
		if(timeArray[3]){
			seconds = (timeArray[3] < 10) 
							? 0 + timeArray[3]
							: timeArray[3];
		}
		return hour + minutes + ":" + seconds;
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


















