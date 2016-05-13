var firebase = new Firebase('https://musicplayershare.firebaseio.com/playList/');


function getVideoData(videoID, callback){
    var youtubeAPIKey = 'AIzaSyC01KXc_trhYmmPFdqZCqeuihDwRtJupTY';
    var youtubeURL = 'https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id='+ videoID +'&key=' + youtubeAPIKey;
    $.get(youtubeURL, function(data){
        console.log(data);
        var videoTitle = data.items[0].snippet.title;
        var duration   = data.items[0].contentDetails.duration;           
        callback(videoTitle, duration);
    }, 'json');
}


function getVideoID(url){
    var video_id = url.split('v=')[1];
    var ampersandPosition = video_id.indexOf('&');
    if(ampersandPosition != -1) {
      video_id = video_id.substring(0, ampersandPosition);
    }
    return video_id;
}


chrome.tabs.getSelected(null,function(tab) {
    // Todo check url video
    // Get video data
    var url = tab.url;
    
    var check = url.match(/youtube/);

    if(check){
        var videoID = getVideoID(url);
        getVideoData(videoID, function(videoTitle, duration){
            firebase.push({
                played: 0,
                currentPlayed: 0,
                source: 'youtube',
                urlYoutube: url,
                title: videoTitle,
                videoID: videoID,
                duration: 0
            },function(error){
                if (error) {
                    console.log("Data could not be saved." + error);
                }else{
                    console.log("Data saved successfully.");
                }
            });
        });
    
    }else{
        $("#message").text("URL de youtube invalida :/");
    }
});
    



