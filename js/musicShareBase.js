var musicShareBase = {
	firebaseURL: config.firebaseURL, 
	firebaseChild: config.firebaseChild,
	firebase:{
		ref: null,
		child: null
	},

	initFirebase: function(){
		this.firebase.ref = new Firebase(this.firebaseURL);
		this.firebase.child = this.firebase.ref.child(this.firebaseChild);
	},

	//Helpers
	getVideoID: function(url){
		var video_id = url.split('v=')[1];
		var ampersandPosition = video_id.indexOf('&');
		if(ampersandPosition != -1) {
		  video_id = video_id.substring(0, ampersandPosition);
		}
		return video_id;
	},
};