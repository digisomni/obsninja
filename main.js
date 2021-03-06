/*
*  Copyright (c) 2020 Steve Seguin. All Rights Reserved.
*
*  Use of this source code is governed by the APGLv3 open-source license
*  that can be found in the LICENSE file in the root of the source
*  tree. Alternative licencing options can be made available on request.
*
*/
/*jshint esversion: 6 */

var formSubmitting = true;
var activatedPreview = false;

function getById(id) {
   var el = document.getElementById(id);
   if (!el) {
	    warnlog(id + " is not defined; skipping.");
		el = document.createElement("span"); // create a fake element
   }
   return el;
}


function changeParam(url,paramName,paramValue){
	var qind = url.indexOf('?');
	var params = url.substring(qind+1).split('&');
	var query = '';
	for(var i=0;i<params.length;i++) {
		var tokens = params[i].split('=');
		var name = tokens[0];
		if (tokens.length > 1 && tokens[1] !== ''){
			var value = tokens[1];
		} else{
			value = "";
		}
		if (name == paramName) {
			value = paramValue;
		}
		if (value!==""){
			value =  '=' + value;
		} 
		
		if(query == '') {
			query = "?"+name + value;
		} else {
			query = query + '&' + name + value;
		}
	}
	return url.substring(0,qind) + query;
}

function updateURL(param, force=false, cleanUrl=false){
	var para = param.split('=');
	if (cleanUrl){
		if (history.pushState){
			var href = new URL(cleanUrl);
			if (para.length==1){
				href = changeParam(cleanUrl, para[0],"")
			} else {
				href = changeParam(cleanUrl, para[0],para[1]);
			}
			log("--"+href.toString());
			window.history.pushState({path:href.toString()},'',href.toString());
		}
	} else if (!(urlParams.has(para[0]))){
		if (history.pushState){
			var arr = window.location.href.split('?');
			var newurl;
			if (arr.length > 1 && arr[1] !== '') {
				newurl = window.location.href + '&' +param;
			} else {
				newurl = window.location.href + '?' +param;
			}
			
			window.history.pushState({path:newurl},'',newurl);
		}
	} else if (force){
		if (history.pushState){
			var href = new URL(window.location.href);
			if (para.length==1){
				href = changeParam(window.location.href, para[0],"")
			} else {
				href = changeParam(window.location.href, para[0], para[1]);
			}
			log("---"+href.toString());
			window.history.pushState({path:href.toString()},'',href.toString());
		}
	}
	if (session.sticky){
		setCookie("settings", encodeURI(window.location.href), 90);
	}
}

var filename=false;
try{
	filename = window.location.pathname.substring(window.location.pathname.lastIndexOf('/')+1);
	filename2 = filename.split("?")[0];
	// split at ???
	if (filename.split(".").length==1){
		if (filename2.length<2){ // easy win
			filename=false;
		} else if (filename.startsWith("&")){  // easy win
			var tmpHref = window.location.href.substring(0, window.location.href.lastIndexOf('/')) + "/?" + filename.split("&").slice(1).join("&");
			log("TMP "+tmpHref);
			updateURL(filename.split("&")[1], true, tmpHref);
			filename=false;
		} else if (filename2.split("&")[0].includes("=")){
			log("asdf  "+ filename.split("&")[0]);
			if (history.pushState){
				var tmpHref = window.location.href.substring(0, window.location.href.lastIndexOf('/'));
				tmpHref = tmpHref+"/?"+filename;
				filename = false;
				//alert("Please ensure your URL is correctly formatted.");
				window.history.pushState({path:tmpHref.toString()},'',tmpHref.toString());
			}
		} else {
			filename = filename2.split("&")[0];
			if (filename2!=filename){
				alert("Warning: Please ensure your URL is correctly formatted.");
			}
		}
	} else {
		filename = false;
	}
	log(filename);
} catch(e){errorlog(e);}


(function (w) {
    w.URLSearchParams = w.URLSearchParams || function (searchString) {
        var self = this;
        self.searchString = searchString;
        self.get = function (name) {
            var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(self.searchString);
            if (results == null) {
                return null;
            }
            else {
                return decodeURI(results[1]) || 0;
            }
        };
    };

})(window);
var urlParams = new URLSearchParams(window.location.search);

sanitizeStreamID = function(streamID){
	streamID = streamID.trim();
	
	if (streamID.length < 1){
		streamID = session.generateStreamID(8);
		if (!(session.cleanOutput)){
			alert("No streamID was provided; one will be generated randomily.\n\nStream ID: "+streamID);
		}
	}
	var streamID_sanitized = streamID.replace(/[\W]+/g,"_");
	if (streamID !== streamID_sanitized){
		if (!(session.cleanOutput)){
			alert("Info: Only AlphaNumeric characters should be used for the stream ID.\n\nThe offending characters have been replaced by an underscore");
		}
	}
	if  (streamID_sanitized.length > 24){
		streamID_sanitized = streamID_sanitized.substring(0, 24);
		if (!(session.cleanOutput)){
			alert("The Stream ID should be less than 25 alPhaNuMeric characters long.\n\nWe will trim it to length.");
		}
	}
	return streamID_sanitized;
};
	
sanitizeRoomName = function(roomid){
	roomid = roomid.trim();
	if (roomid===""){return roomid;}
	else if (roomid===false){return roomid;}
	
	var santized = roomid.replace(/[\W]+/g,"_");
	if (santized!==roomid){
		if (!(session.cleanOutput)){
			alert("Info: Only AlphaNumeric characters should be used for the room name.\n\nThe offending characters have been replaced by an underscore");
		}
	}
	if (santized.length > 30){
		santized = santized.substring(0, 30);
		if (!(session.cleanOutput)){
			alert("The Room name should be less than 31 alPhaNuMeric characters long.\n\nWe will trim it to length.");
		}
	} 
	return santized;
};

sanitizePassword = function(passwrd){
	if (passwrd===""){return passwrd;}
	else if (passwrd===false){return passwrd;}
	else if (passwrd===null){return passwrd;}
	passwrd = passwrd.trim();
	if (passwrd.length < 1){
		if (!(session.cleanOutput)){
			alert("The password provided was blank.");
		}
	}
	var santized = passwrd.replace(/[\W]+/g,"_");
	if (santized!==passwrd){
		if (!(session.cleanOutput)){
			alert("Info: Only AlphaNumeric characters should be used in the password.\n\nThe offending characters have been replaced by an underscore");
		}
	}
	return santized;
};

function getChromeVersion(){     
    var raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
    return raw ? parseInt(raw[2], 10) : false;
}

if (window.obsstudio){
	session.disableWebAudio = true; // default true; might be useful to disable on slow or old computers?
	session.audioMeterGuest = false;
	session.audioEffects = false;  
	session.obsfix=15; // can be manually set via URL.  ; VP8=15, VP9=30. (previous was 20.)
	try{
		log("OBS VERSION:"+window.obsstudio.pluginVersion);
		log("macOS: "+navigator.userAgent.indexOf('Mac OS X') != -1);
		log(window.obsstudio);
		
		// Upgrade to OBS v26.1.2 to obtain native support for OBS.Ninja.
    
	} catch(e){errorlog(e);}
	
	window.addEventListener('obsSceneChanged', function(event){
		log("OBS EVENT");
		log(event.detail.name);
		
		window.obsstudio.getCurrentScene(function(scene) {
			log("OBS SCENE");
			log(scene);
		});
		
		window.obsstudio.getStatus(function (status) {
			log("OBS STATUS:");
			log(status);
		});
	});
	
}

window.onload = function() { // This just keeps people from killing the live stream accidentally. Also give me a headsup that the stream is ending
	window.addEventListener("beforeunload", function (e) {
		try{
			session.ws.close();
		} catch (e){
		}
		//setTimeout(function(){session.hangup();},0);
		return undefined; // ADDED OCT 29th; get rid of popup. Just close the socket connection if the user is refreshing the page.  It's one or the other.
		
	});
};

getById("credits").innerHTML = "Version: "+session.version+" - "+getById("credits").innerHTML;

var lastTouchEnd = 0;
document.addEventListener('touchend', function (event) {
	var now = (new Date()).getTime();
	if (now - lastTouchEnd <= 300) {
		event.preventDefault();
	}
	lastTouchEnd = now;
}, false);


document.addEventListener('click', function (event) {
	if (session.firstPlayTriggered==false){
		playAllVideos();
		session.firstPlayTriggered=true;
		history.pushState({}, '');
	}
});
var Callbacks = [];
var CtrlPressed = false; // global
var AltPressed = false; 
document.addEventListener("keydown", event => { 

	if ((event.ctrlKey) || (event.metaKey) ){  // detect if CTRL is pressed
		CtrlPressed = true;
	} else {
		CtrlPressed = false;
	}
	if (event.altKey){
		AltPressed = true;
	} else {
		AltPressed = false;
	}
	
	
	if (CtrlPressed && event.keyCode){
	
	  if (event.keyCode == 77) {  // m
	    if (event.metaKey){ 
			if (AltPressed){
				toggleMute(); // macOS
			}
		} else {
			toggleMute(); // Windows
		}
	 // } else if (event.keyCode == 69) { // e 
	//	hangup();
	  } else if (event.keyCode == 66) { // b
		toggleVideoMute();
	  }
	}
	
	
});

document.addEventListener("keyup", event => {
	if (!((event.ctrlKey) || (event.metaKey))){ 
		if (CtrlPressed){
			CtrlPressed = false;
			for (var i in Callbacks){
				var cb = Callbacks[i];
				log(cb.slice(1));
				cb[0](...cb.slice(1)); // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax#A_better_apply
			}
			Callbacks=[];
		}
	}
	if (!(event.altKey)){
		AltPressed = false;
	}
});

window.onpopstate = function() {
	if (session.firstPlayTriggered){
		window.location.reload(true);
	}
}; 

if (typeof session === 'undefined') { // make sure to init the WebRTC if not exists.
	var session = WebRTC.Media;
	session.streamID = session.generateStreamID();
	errorlog("Serious error: WebRTC session didn't load in time");
}


function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  var expires = "expires="+d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

if (getCookie("redirect") == "yes"){
	setCookie("redirect", "", 0);
	session.sticky = true;
} else if (getCookie("settings") != ""){
	session.sticky = confirm("Would you like you load your previous session's settings?");
	if (!session.sticky){
		setCookie("settings", "", 0);
		log("deleting cookie as user said no");
	} else {
		var cookieSettings = decodeURI(getCookie("settings"));
		setCookie("redirect", "yes", 1);
		window.location.replace(cookieSettings);
	}
}
if (urlParams.has('sticky')){
	if (getCookie("permission")==""){
		session.sticky = confirm("Would you allow us to store a cookie to keep your session settings persistent?");
	} else {
		session.sticky = true;
	}
	if (session.sticky){
		setCookie("permission", "yes", 999);
		setCookie("settings", encodeURI(window.location.href), 90);
	}
}


if (urlParams.has('retrytimeout')){
	session.retryTimeout = parseInt(urlParams.get('retrytimeout'));
}

var screensharebutton=true;
if (urlParams.has('nosettings') || urlParams.has('ns')){
	screensharebutton=false;
	session.showSettings = false;
}

if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
	//session.webcamonly = true;
	getById("shareScreenGear").style.display="none";
	screensharebutton=false;
	getById("container-2").className = 'column columnfade advanced'; // Hide screen share on mobile
	getById("dropButton").style.display="none";
	//session.disableWebAudio = true; // default true; might be useful to disable on slow or old computers?
	session.audioEffects = false; // disable audio inbound effects also.
	session.audioMeterGuest = false;
} else if ((iOS) || (iPad)){
	getById("shareScreenGear").style.display="none";
	screensharebutton=false;
	getById("container-2").className = 'column columnfade advanced'; // Hide screen share on mobile
	getById("dropButton").style.display="none";
	session.audiobitrate = false; // iOS devices seem to get distortion with custom audio bitrates.  Disable for now.
	session.maxiosbitrate = 10; // this is 10-kbps by default already.
	//session.disableWebAudio = true; // default true; might be useful to disable on slow or old computers?
	session.audioEffects = false; // disable audio inbound effects also.
	session.audioMeterGuest=false;
}

if (urlParams.has('ssb')){
	screensharebutton=true;;
}

if (/CriOS/i.test(navigator.userAgent) && /iphone|ipod|ipad/i.test(navigator.userAgent)){
    alert("Chrome on iPhones/iPads do not support the required technology to use this site.\n\nPlease use Safari instead.");
}

if (urlParams.has('broadcast') || urlParams.has('bc')){ 
	log("Broadcast flag set");
	session.broadcast = urlParams.get('broadcast') || urlParams.get('bc');
	if ((iOS) || (iPad)){
		session.nopreview=false;
	} else {
		session.nopreview=true;
	}
	session.style=1;
	getById("header").style.display="none";
	getById("header").style.opacity = 0;
}

var directorLanding = false;
if (urlParams.has('director')){
	directorLanding = urlParams.get('director');
	if (directorLanding===null){
		directorLanding = true;
	} else if (directorLanding.length===0){
		directorLanding = true;
	} else {
		directorLanding = false;
	}
} else if (filename==="director"){
	directorLanding=true;
	filename=false;
}


if (urlParams.has('webcam') || urlParams.has('wc')){
	session.webcamonly = true;
} else if (urlParams.has('screenshare') || urlParams.has('ss')){
	session.screenshare = true;
} else if (urlParams.has('fileshare') || urlParams.has('fs')){
	getById("container-5").classList.remove('advanced');
	getById("container-5").classList.add("skip-animation");
	getById("container-5").classList.remove('pointer');
} else if (directorLanding){
	getById("container-1").classList.remove('advanced');
	getById("container-1").classList.add("skip-animation");
	getById("container-1").classList.remove('pointer');
} else if (urlParams.has('website') || urlParams.has('iframe')){
	getById("container-6").classList.remove('advanced');
	getById("container-6").classList.add("skip-animation");
	getById("container-6").classList.remove('pointer');
}

if (urlParams.has('mute') || urlParams.has('muted') || urlParams.has('m')){
	session.muted = true;
}

if (session.screenshare==true){
	getById("container-3").className = 'column columnfade advanced'; // Hide screen share on mobile
	getById("container-2").classList.add("skip-animation");
	getById("container-2").classList.remove('pointer');
}

if (urlParams.has('manual')){
	session.manual = true;
}

if (urlParams.has('hands') || urlParams.has('hand')){
	session.raisehands = true;
}

if (urlParams.has('bigbutton')){
	session.bigmutebutton=true;
	getById("mutebutton").style.width = "min(40vh,40vw)";
	getById("mutebutton").style.height = "min(40vh,40vw)";
	getById("mutetoggle").style.width = "min(40vh,40vw)";
	getById("mutetoggle").style.height = "min(40vh,40vw)";
	
}

if (urlParams.has('scene')){
	session.scene = parseInt(urlParams.get('scene')) || 0;
	session.disableWebAudio = true;
	session.audioEffects = false; 
	session.audioMeterGuest = false;
}


if (session.webcamonly==true){
	getById("container-2").className = 'column columnfade advanced'; // Hide screen share on mobile
	getById("container-3").classList.add("skip-animation");
	getById("container-3").classList.remove('pointer');
	setTimeout(function(){previewWebcam();},100);
}

getById("main").classList.remove('hidden');

if (urlParams.has('password') || urlParams.has('pass') || urlParams.has('pw') || urlParams.has('p')){
	session.password = urlParams.get('password') || urlParams.get('pass') || urlParams.get('pw') || urlParams.get('p');
	if (session.password.length==0){
		session.password = prompt("Please enter the password below: \n\n(Note: Passwords are case-sensitive and you will not be alerted if it is incorrect.)");
	} else if (session.password==="false"){
		session.password=false;
		session.defaultPassword=false;
	} else if (session.password==="0"){
		session.password=false;
		session.defaultPassword=false;
	} else if (session.password==="off"){
		session.password=false;
		session.defaultPassword=false;
	}
}

if (session.password){
	session.password = sanitizePassword(session.password);
	getById("passwordRoom").value = session.password;
	session.defaultPassword = false;
}


if (urlParams.has('hash') || urlParams.has('crc') || urlParams.has('check')){  // could be brute forced in theory, so not as safe as just not using a hash check.
    session.taintedSession=null; // waiting to see if valid or not.
	var hash_input = urlParams.get('hash') || urlParams.get('crc') || urlParams.get('check');
	if (session.password===false){
		session.password = prompt("Please enter the password below: \n\n(Note: Passwords are case-sensitive and you will not be alerted if it is incorrect.)");
		session.password = sanitizePassword(session.password);
		getById("passwordRoom").value = session.password;
		session.defaultPassword = false;
	} 
	
	session.generateHash(session.password+session.salt,6).then(function(hash){ // million to one error. 
		log("hash is "+hash);
		if (hash.substring(0, 4) !== hash_input){ // hash crc checks are just first 4 characters.
		    session.taintedSession=true;
			if (!(session.cleanOutput)){
				getById("request_info_prompt").innerHTML = "The password was incorrect.\n\nRefresh and try again.";
				getById("request_info_prompt").style.display = "block";
				getById("mainmenu").style.display = "none";
				getById("head1").style.display = "none";
				session.cleanOutput = true;
				
			} else {
				getById("request_info_prompt").innerHTML = "";
				getById("request_info_prompt").style.display = "block";
				getById("mainmenu").style.display = "none";
				getById("head1").style.display = "none";
			}
		} else {
			session.taintedSession=false;
			session.hash = hash;
		}
	});
}

if (session.defaultPassword!==false){
	session.password = session.defaultPassword; // no user entered password; let's use the default password if its not disabled.
}

if (urlParams.has('showlabels') || urlParams.has('showlabel')  || urlParams.has('sl')){
	session.showlabels = urlParams.get('showlabels') || urlParams.get('showlabel')  || urlParams.get('sl') || "";
	session.showlabels = session.showlabels.replace(/[\W]+/g,"_").replace(/_+/g, '_'); 
	if (session.showlabels==""){
		session.showlabels = true;
		session.labelstyle = false;
	} else {
		session.labelstyle = session.showlabels;
		session.showlabels = true;
	}
}

if (urlParams.has('label') || urlParams.has('l')){
	session.label = urlParams.get('label') || urlParams.get('');
	if (session.label == null || session.label.length==0){
		session.label = prompt("Please enter your display name:");
	} else {
		session.label = decodeURIComponent(session.label);
	}
	if (session.label!=null){
		session.label = session.label.replace(/[\W]+/g,"_").replace(/_+/g, '_'); // but not what others might get.
		document.title=session.label.replace(/_/g, ' '); // what the result is.
		updateURL("label="+session.label, true);
	}
}

if (urlParams.has('transparent')){ // sets the window to be transparent - useful for IFRAMES?
	getById("main").style.backgroundColor = "rgba(0,0,0,0)";
}

if (urlParams.has('stereo') || urlParams.has('s') || urlParams.has('proaudio')){ // both peers need this enabled for HD stereo to be on. If just pub, you get no echo/noise cancellation. if just viewer, you get high bitrate mono 
	log("STEREO ENABLED");
	session.stereo = urlParams.get('stereo') || urlParams.get('s') || urlParams.get('proaudio');
	
	if (session.stereo){
		session.stereo = session.stereo.toLowerCase();
	}
	
	if (session.stereo==="false"){
		session.stereo = 0;
	} else if (session.stereo==="0"){
		session.stereo = 0;
	} else if (session.stereo==="no"){
		session.stereo = 0;
	} else if (session.stereo==="off"){
		session.stereo = 0;
	} else if (session.stereo==="1"){
		session.stereo = 1;
	} else if (session.stereo==="both"){
		session.stereo = 1;
	} else if (session.stereo==="3"){
		session.stereo = 3;
	} else if (session.stereo==="out"){
		session.stereo = 3;
	} else if (session.stereo==="mono"){
		session.stereo = 3;
	} else if (session.stereo==="4"){
		session.stereo = 4;
	} else if (session.stereo==="2"){  
		session.stereo = 2;
	} else if (session.stereo==="in"){  
		session.stereo = 2;
	} else {
		session.stereo = 5; // guests; no stereo in, no high bitrate in, but otherwise like stereo=1
	}
}

if ((session.stereo==1) || (session.stereo==3) || (session.stereo==4) || (session.stereo==5)){
	session.echoCancellation = false;
	session.autoGainControl = false;
	session.noiseSuppression = false;
}

if (urlParams.has('mono')){
	if ((session.stereo==1) || (session.stereo==3) || (session.stereo==4) || (session.stereo==5)){
		session.stereo = 3;
	}
}

if (urlParams.has("aec") || urlParams.has("ec")){
	
	session.echoCancellation = urlParams.get('aec') || urlParams.get('ec');
	
	if (session.echoCancellation){
		session.echoCancellation = session.echoCancellation.toLowerCase();
	}
	if (session.echoCancellation=="false"){
		session.echoCancellation = false;
	} else if (session.echoCancellation=="0"){
		session.echoCancellation = false;
	} else if (session.echoCancellation=="no"){
		session.echoCancellation = false;
	} else if (session.echoCancellation=="off"){
		session.echoCancellation = false;
	} else {
		session.echoCancellation = true;
	}
}


if (urlParams.has("autogain") || urlParams.has("ag")){
	
	session.autoGainControl = urlParams.get('autogain') || urlParams.get('ag');
	if (session.autoGainControl){
		session.autoGainControl = session.autoGainControl.toLowerCase();
	}
	if (session.autoGainControl=="false"){
		session.autoGainControl = false;
	} else if (session.autoGainControl=="0"){
		session.autoGainControl = false;
	} else if (session.autoGainControl=="no"){
		session.autoGainControl = false;
	} else if (session.autoGainControl=="off"){
		session.autoGainControl = false;
	} else {
		session.autoGainControl = true;
	}
}

if (urlParams.has("denoise") || urlParams.has("dn")){
	
	session.noiseSuppression = urlParams.get('denoise') || urlParams.get('dn');
	
	if (session.noiseSuppression){
		session.noiseSuppression = session.noiseSuppression.toLowerCase();
	}
	if (session.noiseSuppression=="false"){
		session.noiseSuppression = false;
	} else if (session.noiseSuppression=="0"){
		session.noiseSuppression = false;
	} else if (session.noiseSuppression=="no"){
		session.noiseSuppression = false;
	} else if (session.noiseSuppression=="off"){
		session.noiseSuppression = false;
	} else {
		session.noiseSuppression = true;
	}
}


if (urlParams.has('roombitrate') || urlParams.has('roomvideobitrate') || urlParams.has('rbr')){ 
	log("Room BITRATE SET");
	session.roombitrate = urlParams.get('roombitrate') || urlParams.get('rbr') || urlParams.get('roomvideobitrate');
	session.roombitrate = parseInt(session.roombitrate);
	if (session.roombitrate<1){
		session.roombitrate=0;
	}
}


if (urlParams.has('audiobitrate') || urlParams.has('ab')){ // both peers need this enabled for HD stereo to be on. If just pub, you get no echo/noise cancellation. if just viewer, you get high bitrate mono 
	log("AUDIO BITRATE SET");
	session.audiobitrate = urlParams.get('audiobitrate') || urlParams.get('ab');
	session.audiobitrate = parseInt(session.audiobitrate);
	if (session.audiobitrate<1){
		session.audiobitrate=false;
	} else if (session.audiobitrate>510){
		session.audiobitrate=510;
	} // this is to just prevent abuse
}
if ((iOS) || (iPad)){
	session.audiobitrate = false; // iOS devices seem to get distortion with custom audio bitrates.  Disable for now.
}

/* if (urlParams.has('whitebalance') || urlParams.has('temp')){ // Need to be applied after the camera is selected. bleh. not enforcible. remove for now.
	var temperature = urlParams.get('whitebalance') || urlParams.get('temp');
	try{
		updateCameraConstraints('colorTemperature',  parseFloat(temperature));
	} catch (e){errorlog(e);}
} */

if (urlParams.has('streamid') || urlParams.has('view') || urlParams.has('v') || urlParams.has('pull')){  // the streams we want to view; if set, but let blank, we will request no streams to watch.  
	session.view = urlParams.get('streamid') || urlParams.get('view') || urlParams.get('v') || urlParams.get('pull'); // this value can be comma seperated for multiple streams to pull
	
	getById("headphonesDiv2").style.display="inline-block";
	getById("headphonesDiv").style.display="inline-block";
	
	if (session.view==null){
		session.view="";
	}
	if (session.view){
		if (session.view.split(",").length>1){
			session.view_set = session.view.split(",");
		} 
	}
}

if (urlParams.has('nopreview') || urlParams.has('np')){
	log("preview OFF");
    session.nopreview = true;
} else if ((urlParams.has('preview')) || (urlParams.has('showpreview'))){
	log("preview ON");
    session.nopreview = false;
} 

if (urlParams.has('obsfix')){
	session.obsfix = urlParams.get('obsfix');
	if (session.obsfix){
		session.obsfix = session.obsfix.toLowerCase();
	}
	if (session.obsfix=="false"){
		session.obsfix = false;
	} else if (session.obsfix=="0"){
		session.obsfix = false;
	} else if (session.obsfix=="no"){
		session.obsfix = false;
	} else if (session.obsfix=="off"){
		session.obsfix = false;
	} else if (parseInt(session.obsfix)>0){
		session.obsfix = parseInt(session.obsfix);
	} else {
		session.obsfix = 1; // aggressive.
	}
}

if (urlParams.has('controlroombitrate') || urlParams.has('crb')){
	session.controlRoomBitrate=true;
}

if (urlParams.has('remote') || urlParams.has('rem')){
	log("remote ENABLED");
	session.remote = urlParams.get('remote') || urlParams.get('rem');
    session.remote =  session.remote.trim();
}

if (urlParams.has('latency') || urlParams.has('al')  || urlParams.has('audiolatency')){
	log("latency  ENABLED");
	session.audioLatency = urlParams.get('latency') || urlParams.get('al') || urlParams.get('audiolatency');
	session.audioLatency = parseInt(session.audioLatency) || 0 ;
	session.disableWebAudio=false;
}

if (urlParams.has('audiogain') || urlParams.has('gain')){
	log("audio gain  ENABLED");
	session.audioGain = urlParams.get('audiogain') || urlParams.get('gain');
	session.audioGain = parseInt(session.audioGain) || 0 ;
	session.disableWebAudio=false;
}
if (urlParams.has('compressor') || urlParams.has('comp')){
	log("audio gain  ENABLED");
	session.compressor = 1;
	session.disableWebAudio=false;
} else if (urlParams.has('limiter')){
	log("audio gain  ENABLED");
	session.compressor = 2;
	session.disableWebAudio=false;
} 
if ((urlParams.has('equalizer')) || (urlParams.has('eq'))){
	session.equalizer = true;
	session.disableWebAudio=false;
}

if (urlParams.has('keyframeinterval') || urlParams.has('keyframerate') || urlParams.has('keyframe') ||urlParams.has('fki')){
	log("keyframerate ENABLED");
	session.keyframerate = parseInt(urlParams.get('keyframeinterval') || urlParams.get('keyframerate') || urlParams.get('keyframe') || urlParams.get('fki')) || 0;
}

if (urlParams.has('optimize')){
	var optimize = parseInt(urlParams.get('optimize'));
	if (optimize!==0){
		optimize = optimize || 600;
	}
	session.optimize = optimize;
}

if (urlParams.has('tallyoff') || urlParams.has('obsoff') || urlParams.has('oo')){
	log("OBS feedback disabled");
    session.disableOBS = true;
}


if (urlParams.has('chroma')){
	log("Chroma ENABLED");
	getById("main").style.backgroundColor = "#"+(urlParams.get('chroma') || "000");
}

if (urlParams.has("videodevice") || urlParams.has("vdevice")  || urlParams.has("vd")  || urlParams.has("device")  || urlParams.has("d")){
	
	session.videoDevice = urlParams.get("videodevice") || urlParams.get("vdevice")  || urlParams.get("vd")  || urlParams.get("device")  || urlParams.get("d");
	
	if (session.videoDevice===null){
		session.videoDevice = "1";
	} else if (session.videoDevice){
		session.videoDevice = session.videoDevice.toLowerCase().replace(/[\W]+/g,"_");
	}
	if (session.videoDevice=="false"){
		session.videoDevice = 0;
	} else if (session.videoDevice=="0"){
		session.videoDevice = 0;
	} else if (session.videoDevice=="no"){
		session.videoDevice = 0;
	} else if (session.videoDevice=="off"){
		session.videoDevice = 0;
	} else if (session.videoDevice=="snapcam"){
		session.videoDevice = "snap_camera";
	} else if (session.videoDevice=="canon"){
		session.videoDevice = "eos";
	} else if (session.videoDevice=="camlink"){
		session.videoDevice = "cam_link";
	} else if (session.videoDevice=="ndi"){
		session.videoDevice = "newtek_ndi_video";
	} else if (session.videoDevice==""){
		session.videoDevice = 1;
	} else if (session.videoDevice=="1"){
		session.videoDevice = 1;
	} else if (session.videoDevice=="default"){
		session.videoDevice = 1;
	} else {
		// whatever the user entered I guess, santitized.
		session.videoDevice = session.videoDevice.replace(/[\W]+/g,"_").toLowerCase();
	}
	
	if (session.videoDevice === 0){
		getById("add_camera").innerHTML = "Share your Microphone";
		miniTranslate(getById("add_camera"),"share-your-mic");
	}
	
	getById("videoMenu").style.display="none";
	log("session.videoDevice:"+session.videoDevice);
}

// audioDevice
if (urlParams.has("audiodevice") || urlParams.has("adevice")  || urlParams.has("ad")  || urlParams.has("device")  || urlParams.has("d")){
	
	session.audioDevice = urlParams.get("audiodevice") || urlParams.get("adevice")  || urlParams.get("ad")  || urlParams.get("device")  || urlParams.get("d");
	
	if (session.audioDevice===null){
		session.audioDevice="1";
	} else if (session.audioDevice){
		session.audioDevice = session.audioDevice.toLowerCase().replace(/[\W]+/g,"_");
	}
	
	if (session.audioDevice=="false"){
		session.audioDevice = 0;
	} else if (session.audioDevice=="0"){
		session.audioDevice = 0;
	} else if (session.audioDevice=="no"){
		session.audioDevice = 0;
	} else if (session.audioDevice=="off"){
		session.audioDevice = 0;
	} else if (session.audioDevice==""){
		session.audioDevice = 1;
	} else if (session.audioDevice=="1"){
		session.audioDevice = 1;
	} else if (session.audioDevice=="default"){
		session.audioDevice = 1;
	} else if (session.audioDevice=="ndi"){
		session.audioDevice="line_newtek_ndi_audio";
	} else {
		// whatever the user entered I guess
		session.audioDevice = session.audioDevice.replace(/[\W]+/g,"_").toLowerCase();
	}
	
	
	if (session.videoDevice === 0){
		if (session.audioDevice === 0){
			getById("add_camera").innerHTML = "Click Start to Join";
			miniTranslate(getById("add_camera"),"click-start-to-join");
			getById("container-2").className = 'column columnfade advanced'; // Hide screen share on mobile
			getById("container-3").classList.add("skip-animation");
			getById("container-3").classList.remove('pointer');
			setTimeout(function(){previewWebcam();},100);
			session.webcamonly = true;
		}
	}
	
	log("session.audioDevice:" + session.audioDevice);
	
	getById("audioMenu").style.display="none";
	getById("headphonesDiv").style.display="none";
	getById("headphonesDiv2").style.display="none";
	getById("audioScreenShare1").style.display="none";	
	
}


if (urlParams.has("autojoin") || urlParams.has("autostart") || urlParams.has("aj") || urlParams.has("as")){
	session.autostart = true;
}

if (urlParams.has('noiframe') || urlParams.has('noiframes') || urlParams.has('nif')){
	
	session.noiframe = urlParams.get('noiframe') || urlParams.get('noiframes') || urlParams.get('nif');
	
	if (!(session.noiframe)){
		session.noiframe=[];
	} else {
		session.noiframe = session.noiframe.split(",");
	}
	log("disable iframe playback");
	log(session.noiframe);
}


if (urlParams.has('exclude') || urlParams.has('ex')){
	
	session.exclude = urlParams.get('exclude') || urlParams.get('ex');
	
	if (!(session.exclude)){
		session.exclude = false;
	} else {
		session.exclude = session.exclude.split(",");
	}
	log("exclude video playback");
	log(session.exclude);
}


if (urlParams.has('novideo') || urlParams.has('nv') || urlParams.has('hidevideo') || urlParams.has('showonly') ){
	
	session.novideo = urlParams.get('novideo') || urlParams.get('nv') || urlParams.get('hidevideo') || urlParams.get('showonly');
	
	if (!(session.novideo)){
		session.novideo=[];
	} else {
		session.novideo = session.novideo.split(",");
	}
	log("disable video playback");
	log(session.novideo);
}

if (urlParams.has('noaudio') || urlParams.has('na') || urlParams.has('hideaudio') ){
	
	session.noaudio = urlParams.get('noaudio') || urlParams.get('na') || urlParams.get('hideaudio') ;
	
	if (!(session.noaudio)){
		session.noaudio=[];
	} else {
		session.noaudio = session.noaudio.split(",");
	}
	log("disable audio playback");
}

if (urlParams.has('forceios')){
	log("allow iOS to work in video group chat; for this user at least");
    session.forceios = true;
}

if (urlParams.has('nocursor')){
	session.nocursor = true;
	log("DISABLE CURSOR");
	var style = document.createElement('style');
	style.innerHTML = `
	video {
		margin: 0;
		padding: 0;
		overflow: hidden;
		cursor: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=), none;
		user-select: none;
	}
	`;
	document.head.appendChild(style);
}

if (urlParams.has('vbr')){
	session.cbr = 0;
} 
 
if (urlParams.has('order')){
	session.order = parseInt(urlParams.get('order')) || 0;
} 

if (urlParams.has('minptime')){
	session.minptime =  parseInt(urlParams.get('minptime')) || 10;
	if (session.minptime<10){session.minptime=10;}
	if (session.minptime>300){session.minptime=300;}
}

if (urlParams.has('maxptime')){
	session.maxptime = parseInt(urlParams.get('maxptime')) || 60;
	if (session.maxptime<10){session.maxptime=10;}
	if (session.maxptime>300){session.maxptime=300;}
}

if (urlParams.has('ptime')){
	session.ptime =  parseInt(urlParams.get('ptime')) || 20;
	if (session.minptime<10){session.ptime=10;}
	if (session.minptime>300){session.ptime=300;}
}


if (urlParams.has('codec')){
	log("CODEC CHANGED");
    session.codec = urlParams.get('codec').toLowerCase();
} //else if (window.obsstudio){
	//if (session.obsfix===false){
	//	session.codec = "h264"; // H264 --- It's too laggy!!! FUCKEEEEEEE
	//}
//}

if (urlParams.has('scale')){
	log("Resolution scale requested");
    session.scale = urlParams.get('scale');
}

var ConfigSettings = getById("main-js");
var ln_template = false;
var translation = false;
try {
	if (ConfigSettings){
		ln_template = ConfigSettings.getAttribute('data-translation');   // Translations
		if (typeof ln_template === "undefined" ) {
		   ln_template = false;
		} else if (ln_template === null ) {
		   ln_template = false;
		}
	}

	if (urlParams.has('ln')){
		ln_template = urlParams.get('ln');
	} 
} catch (e){errorlog(e);}

if (ln_template){  // checking if manual lanuage override enabled
	try {
		log("Template: "+ln_template);
		fetch("./translations/"+ln_template+'.json').then(function(response){
			if (response.status !== 200) {
				log('Looks like there was a problem. Status Code: ' +
				response.status);
				return;
			}
			response.json().then(function(data) {
				log(data);
				translation = data;
				var trans = data.innerHTML;
				var allItems = document.querySelectorAll('[data-translate]');
				allItems.forEach(function(ele){
					if (ele.dataset.translate in trans){
						ele.innerHTML = trans[ele.dataset.translate];
					}
				});
				trans = data.titles;
				var allTitles = document.querySelectorAll('[title]');
				allTitles.forEach(function(ele){
					var key = ele.title.replace(/[\W]+/g,"-").toLowerCase();
					if (key in trans){
						ele.title = trans[key];
					}
				});
				trans = data.placeholders;
				var allPlaceholders = document.querySelectorAll('[placeholder]');
				allPlaceholders.forEach(function(ele){
					var key = ele.placeholder.replace(/[\W]+/g,"-").toLowerCase();
					if (key in trans){
						ele.placeholder = trans[key];
					}
				});
					
					
				getById("mainmenu").style.opacity = 1;
			}).catch(function(err){
				errorlog(err);
				getById("mainmenu").style.opacity = 1;
			});
		}).catch(function(err){
			errorlog(err);
			getById("mainmenu").style.opacity = 1;
		});
	
	} catch (error){
		errorlog(error);
		getById("mainmenu").style.opacity = 1;
	}
} else if (location.hostname !== "obs.ninja"){
	if (location.hostname === "rtc.ninja"){
		try{
			if (session.label===false){
				document.title = "";
			}
			getById("qos").innerHTML = "";
			getById("logoname").innerHTML = "";
			getById("helpbutton").style.display = "none";
			getById("helpbutton").style.opacity = 0;
			getById("reportbutton").style.display = "none";
			getById("mainmenu").style.opacity = 1;
			getById("mainmenu").style.margin = "30px 0";
			getById("translateButton").style.display = "none";
			getById("translateButton").style.opacity = 0;
			getById("info").style.display = "none";
			getById("info").style.opacity = 0;
			getById("chatBody").innerHTML = "";
			
		} catch(e){}
	}
	try {
		fetch("./translations/blank.json").then(function(response){
			if (response.status !== 200) {
				log('Looks like there was a problem. Status Code: ' +
				response.status);
				return;
			}
			response.json().then(function(data) {
				log(data);
				
				var trans = data.innerHTML;
				var allItems = document.querySelectorAll('[data-translate]');
				allItems.forEach(function(ele){
					if (ele.dataset.translate in trans){
						ele.innerHTML = trans[ele.dataset.translate];
					}
				});
				trans = data.titles;
				var allTitles = document.querySelectorAll('[title]');
				allTitles.forEach(function(ele){
					var key = ele.title.replace(/[\W]+/g,"-").toLowerCase();
					if (key in trans){
						ele.title = trans[key];
					}
				});
				trans = data.placeholders;
				var allPlaceholders = document.querySelectorAll('[placeholder]');
				allPlaceholders.forEach(function(ele){
					var key = ele.placeholder.replace(/[\W]+/g,"-").toLowerCase();
					if (key in trans){
						ele.placeholder = trans[key];
					}
				});
				
				if (session.label===false){
					document.title = location.hostname;
				}
				getById("qos").innerHTML = location.hostname;
				getById("logoname").innerHTML = getById("qos").outerHTML ;
				getById("helpbutton").style.display = "none";
				getById("reportbutton").style.display = "none";
				getById("mainmenu").style.opacity = 1;
			}).catch(function(err){
				errorlog(err);
				getById("mainmenu").style.opacity = 1;
			});
		}).catch(function(err){
			errorlog(err);
			getById("mainmenu").style.opacity = 1;
		});
		if (session.label===false){
			document.title = location.hostname;
		}
		getById("qos").innerHTML = location.hostname;
		getById("logoname").innerHTML = getById("qos").outerHTML;
		getById("helpbutton").style.display = "none";
		getById("reportbutton").style.display = "none";
		getById("chatBody").innerHTML = "";
	} catch (error){
		errorlog(error);
	}
} else {  // check if automatic language translation is available
	getById("mainmenu").style.opacity = 1;
}

try{
	if (location.hostname === "rtc.ninja"){ // an extra-brand-free version of OBS.Ninja
		if (session.label===false){
			document.title = "";
		}
		getById("qos").innerHTML = "";
		getById("logoname").innerHTML = "";
		getById("helpbutton").style.display = "none";
		getById("helpbutton").style.opacity = 0;
		getById("reportbutton").style.display = "none";
		getById("mainmenu").style.opacity = 1;
		getById("mainmenu").style.margin = "30px 0";
		getById("translateButton").style.display = "none";
		getById("translateButton").style.opacity = 0;
		getById("info").style.display = "none";
		getById("info").style.opacity = 0;
		getById("chatBody").innerHTML = "";
	} else if (location.hostname !== "obs.ninja"){
		if (session.label===false){
			document.title = location.hostname;
		}
		getById("qos").innerHTML = location.hostname;
		getById("logoname").innerHTML = getById("qos").outerHTML;
		getById("helpbutton").style.display = "none";
		getById("reportbutton").style.display = "none";
	}
	
} catch(e){}

function miniTranslate(ele, ident=false){
	if (ident){
		ele.dataset.translate = ident;
	} else {
		ident = ele.dataset.translate;
	}
	try {
		if (ident in translation.innerHTML){
			ele.innerHTML = translation.innerHTML[ident];
		}
	} catch(e){}
}
function changeLg(lang){
		fetch("./translations/"+lang+'.json').then(function(response){
			if (response.status !== 200) {
				logerror('Language translation file not found.' + response.status);
				return;
			}
			response.json().then(function(data) {
				log(data);
				translation = data; // translation.innerHTML[ele.dataset.translate]
				var trans = data.innerHTML;
				var allItems = document.querySelectorAll('[data-translate]');
				allItems.forEach(function(ele){
					if (ele.dataset.translate in trans){
						ele.innerHTML = trans[ele.dataset.translate];
					}
				});
				trans = data.titles;
				var allTitles = document.querySelectorAll('[title]');
				allTitles.forEach(function(ele){
					var key = ele.title.replace(/[\W]+/g,"-").toLowerCase();
					if (key in trans){
						ele.title = trans[key];
					}
				});
				trans = data.placeholders;
				var allPlaceholders = document.querySelectorAll('[placeholder]');
				allPlaceholders.forEach(function(ele){
					var key = ele.placeholder.replace(/[\W]+/g,"-").toLowerCase();
					if (key in trans){
						ele.placeholder = trans[key];
					}
				});
			});
		}).catch(function(err){
			errorlog(err);
		});
}

if (urlParams.has('videobitrate') || urlParams.has('bitrate') || urlParams.has('vb')){
	session.bitrate = urlParams.get('videobitrate') || urlParams.get('bitrate') || urlParams.get('vb');
	if (session.bitrate){
		if ((session.view_set) && (session.bitrate.split(",").length>1)){
			session.bitrate_set = session.bitrate.split(",");
			session.bitrate = parseInt(session.bitrate_set[0]);
		} else {
			session.bitrate = parseInt(session.bitrate);
		}
		if (session.bitrate<1){session.bitrate=false;}
		log("BITRATE ENABLED");
		log(session.bitrate);
		
	}
}

if (urlParams.has('maxvideobitrate') || urlParams.has('maxbitrate') || urlParams.has('mvb')){
	session.maxvideobitrate = urlParams.get('maxvideobitrate') || urlParams.get('maxbitrate') || urlParams.get('mvb');
    session.maxvideobitrate = parseInt(session.maxvideobitrate);
	
	if (session.maxvideobitrate<1){session.maxvideobitrate=false;}
	log("maxvideobitrate ENABLED");
	log(session.maxvideobitrate);
} 

if (urlParams.has('totalroombitrate') || urlParams.has('totalroomvideobitrate')|| urlParams.has('trb')){
	session.totalRoomBitrate = urlParams.get('totalroombitrate') || urlParams.get('totalroomvideobitrate') || urlParams.get('trb');
    session.totalRoomBitrate = parseInt(session.totalRoomBitrate);
	
	if (session.totalRoomBitrate<1){session.totalRoomBitrate=false;}
	log("totalRoomBitrate ENABLED");
	log(session.totalRoomBitrate);
} 


if (urlParams.has('height') || urlParams.has('h')){
	session.height = urlParams.get('height') || urlParams.get('h');
	session.height = parseInt(session.height);
}

if (urlParams.has('width') || urlParams.has('w')){
	session.width = urlParams.get('width') || urlParams.get('w');
	session.width = parseInt(session.width);
}

if (urlParams.has('quality') || urlParams.has('q')){
	try{
		session.quality = urlParams.get('quality') || urlParams.get('q') || 0;
		session.quality = parseInt(session.quality);
		getById("gear_screen").parentNode.removeChild(getById("gear_screen"));
		getById("gear_webcam").parentNode.removeChild(getById("gear_webcam"));
	} catch(e){
		errorlog(e);
	}
}

if (urlParams.has('sink')){
	session.sink = urlParams.get('sink');
} else if (urlParams.has('outputdevice') || urlParams.has('od') || urlParams.has('audiooutput')){
	session.outputDevice = urlParams.get('outputdevice') || urlParams.get('od') || urlParams.get('audiooutput');
	if (session.outputDevice){
		session.outputDevice = session.outputDevice.toLowerCase().replace(/[\W]+/g,"_");
	} else {
		session.outputDevice = false;
	}

	if (session.outputDevice){
		try {
			enumerateDevices().then(function(deviceInfos){
				for (let i = 0; i !== deviceInfos.length; ++i) {
						if (deviceInfos[i].kind === 'audiooutput'){
							if (deviceInfos[i].label.replace(/[\W]+/g,"_").toLowerCase().includes(session.outputDevice)){
							session.sink = deviceInfos[i].deviceId;
							log("AUDIO OUT DEVICE: "+deviceInfos[i].deviceId);
							break
						}
					}
				}
			});
		} catch (e){}
	}
}

if (urlParams.has('fullscreen')){
	session.fullscreen=true;
}
if (urlParams.has('stats')){
	session.statsMenu=true;
}


if (urlParams.has('cleandirector') || urlParams.has('cdv')){
	session.cleanDirector = true;
}


if (urlParams.has('cleanoutput') || urlParams.has('clean')){
	session.cleanOutput = true;
	getById("translateButton").style.display="none";
	getById("credits").style.display="none";
	getById("header").style.display="none";
	getById("controlButtons").style.display="none";
	var style = document.createElement('style');
	style.innerHTML = `
	video {
		background-image: none;
	}
	`;
	document.head.appendChild(style);
	
}

if (urlParams.has('channels')){ // must be loaded before channelOffset
    session.audioChannels = parseInt(urlParams.get('channels'));
	session.offsetChannel = 0;
	log("max channels is 32; channels offset");
	session.audioEffects=true;  
}
if (urlParams.has('channeloffset')){
    session.offsetChannel = parseInt(urlParams.get('channeloffset'));
	log("max channels is 32; channels offset");
	session.audioEffects=true;
}
if (urlParams.has('enhance')){
	//if (parseInt(urlParams.get('enhance')>0){
	session.enhance = true;//parseInt(urlParams.get('enhance'));
	//}
}

if (urlParams.has('maxviewers') || urlParams.has('mv') ){
	
	session.maxviewers = urlParams.get('maxviewers') || urlParams.get('mv');
	if (session.maxviewers.length==0){
		session.maxviewers = 1;
	} else {
		session.maxviewers = parseInt(session.maxviewers);
	}
	log("maxviewers set");
}

if (urlParams.has('maxpublishers') || urlParams.has('mp') ){
	
	session.maxpublishers = urlParams.get('maxpublishers') || urlParams.get('mp');
	if (session.maxpublishers.length==0){
		session.maxpublishers = 1;
	} else {
		session.maxpublishers = parseInt(session.maxpublishers);
	}
	log("maxpublishers set");
}

if (urlParams.has('maxconnections') || urlParams.has('mc') ){
	
	session.maxconnections = urlParams.get('maxconnections') || urlParams.get('maxconnections');
	if (session.maxconnections.length==0){
		session.maxconnections = 1;
	} else {
		session.maxconnections = parseInt(session.maxconnections);
	}
	
	log("maxconnections set");
}


if (urlParams.has('secure')){
	session.security = true;
	if (!(session.cleanOutput)){
		setTimeout(function() {alert("Enhanced Security Mode Enabled.");}, 100);
	}
}

if (urlParams.has('random') || urlParams.has('randomize')){
	session.randomize = true;
}

if (urlParams.has('framerate') || urlParams.has('fr') || urlParams.has('fps')){
	session.framerate = urlParams.get('framerate') || urlParams.get('fr') || urlParams.get('fps');
    session.framerate = parseInt(session.framerate);
	log("framerate Changed");
	log(session.framerate);
}



if (urlParams.has('buffer')){ // needs to be before sync
    session.buffer = parseFloat(urlParams.get('buffer')) || 0;
	log("buffer Changed: "+session.buffer);
	session.sync=0;
	session.audioEffects=true;
}

if (urlParams.has('sync')){
    session.sync = parseFloat(urlParams.get('sync'));
	log("sync Changed; in milliseconds.  If not set, defaults to auto.");
	log(session.sync);
	session.audioEffects=true;
	if (session.buffer===false){
		session.buffer=0;
	}
}

if (urlParams.has('mirror')){
	if (urlParams.get('mirror')=="3"){
		getById("main").classList.add("mirror");
	} else if (urlParams.get('mirror')=="2"){
		session.mirrored = 2;
	} else if (urlParams.get('mirror')=="0"){
		session.mirrored = 0;
	} else if (urlParams.get('mirror')=="false"){
		session.mirrored = 0;
	} else if (urlParams.get('mirror')=="off"){
		session.mirrored = 0;
	} else {
		session.mirrored = 1;
	}
}

if (urlParams.has('flip')){
	if (urlParams.get('flip')=="0"){
		session.flipped = false;
	} else if (urlParams.get('flip')=="false"){
		session.flipped = false;
	} else if (urlParams.get('flip')=="off"){
		session.flipped = false;
	} else {
		session.flipped = true;
	}
}

if ((session.mirrored) && (session.flipped)){
	try {
		log("Mirror all videos");
		var mirrorStyle = document.createElement('style');
		mirrorStyle.innerHTML = "video {transform: scaleX(-1) scaleY(-1); }";
		document.getElementsByTagName("head")[0].appendChild(mirrorStyle);
	} catch (e){errorlog(e);}
} else if (session.mirrored){  // mirror the video horizontally
	try {
		log("Mirror all videos");
		var mirrorStyle = document.createElement('style');
		mirrorStyle.innerHTML = "video {transform: scaleX(-1);}"; 
		document.getElementsByTagName("head")[0].appendChild(mirrorStyle);
	} catch (e){errorlog(e);}
} else if (session.flipped){  // mirror the video vertically
	try {
		log("Mirror all videos");
		var mirrorStyle = document.createElement('style');
		mirrorStyle.innerHTML = "video {transform: scaleY(-1);}";
		document.getElementsByTagName("head")[0].appendChild(mirrorStyle);
	} catch (e){errorlog(e);}
}


if (urlParams.has('icefilter')){
	log("ICE FILTER ENABLED");
    session.icefilter =  urlParams.get('icefilter');
}


if (urlParams.has('effects') || urlParams.has('effect')){
	session.effects = urlParams.get('effects') || urlParams.get('effect');
	session.effects = parseInt(session.effects);
	if (session.effects<=0){ 
		sesson.effects = false;
	}
	// mirror == 2
	// face == 1
}


if (urlParams.has('style') || urlParams.has('st')){
	session.style = urlParams.get('style') || urlParams.get('st') || 1;
	if ((parseInt(session.style)==1 ) || (session.style=="justvideo")){ // no audio only
		session.style = 1;
	} else if ((parseInt(session.style)==2) || (session.style=="waveform")){  // audio waveform
		session.style = 2;
		session.audioEffects=true; ////!!!!!!! Do I want to enable the audioEffects myself? or do it here?
	} else if ((parseInt(session.style)==3) || (session.style=="volume")){ // photo is taken? upload option? canvas?
		session.style = 3;
		session.audioEffects=true;
	} else {
		sesson.style = 1;
	}
}


if (urlParams.has('samplerate') || urlParams.has('sr')){
	session.sampleRate = parseInt(urlParams.get('samplerate')) || parseInt(urlParams.get('samplerate')) || 48000;
	if (session.audioCtx){
		session.audioCtx.close(); // close the default audio context.
	}
	session.audioCtx = new AudioContext({  // create a new audio context with a higher sample rate. 
	  sampleRate: session.sampleRate
	})
	session.audioEffects=true;
}


if (urlParams.has('noaudioprocessing') || urlParams.has('noap')){
	session.disableWebAudio = true; // default true; might be useful to disable on slow or old computers?
	session.audioEffects = false; // disable audio inbound effects also.
	session.audioMeterGuest = false;
}

if (urlParams.has('turn')){
	var turnstring = urlParams.get('turn');
	if (turnstring=="twilio"){
		try{
			var request = new XMLHttpRequest();
			request.open('GET', 'https://api.obs.ninja/twilio', false);  // `false` makes the request synchronous
			request.send(null);

			if (request.status === 200) {
				log(request.responseText);
				var res = JSON.parse(request.responseText);
				
				session.configuration = {
					iceServers: [
						{ "username": res["1"],
						  "credential": res["2"],
						  "url": "turn:global.turn.twilio.com:3478?transport=tcp",
						  "urls": "turn:global.turn.twilio.com:3478?transport=tcp"
						},
						{ "username": res["1"],
						  "credential": res["2"],
						  "url": "turn:global.turn.twilio.com:443?transport=tcp",
						  "urls": "turn:global.turn.twilio.com:443?transport=tcp"
						}
					],
					sdpSemantics: 'unified-plan' // future-proofing
				};
			}
		} catch(e){errorlog("Twilio Failed");}
		
	} else if ((turnstring=="false") || (turnstring=="off")){ // disable TURN servers
		session.configuration.iceServers = [{ urls: ["stun:stun.l.google.com:19302", "stun:stun4.l.google.com:19302" ]}];
		//session.configuration.iceServers.push(turn);
	} else {
		try {
			turnstring = turnstring.split(";");
			if (turnstring !== "false"){ // false disables the TURN server. Useful for debuggin
				var turn = {};
				turn.username = turnstring[0]; // myusername
				turn.credential = turnstring[1];  //mypassword
				turn.urls = [turnstring[2]]; //  ["turn:turn.obs.ninja:443"];
				session.configuration.iceServers = [{ urls: ["stun:stun.l.google.com:19302", "stun:stun4.l.google.com:19302" ]}];
				session.configuration.iceServers.push(turn);
			}
		} catch (e){
			if (!(session.cleanOutput)){
				alert("TURN server parameters were wrong.");
			}
			errorlog(e);
		}
	}
}


if (urlParams.has('privacy') || urlParams.has('private') || urlParams.has('relay')){ // please only use if you are also using your own TURN service.
	try {
		session.configuration.iceTransportPolicy = "relay";  // https://developer.mozilla.org/en-US/docs/Web/API/RTCIceCandidate/address
	} catch (e){
		if (!(session.cleanOutput)){
			alert("Privacy mode failed to configure.");
		}
		errorlog(e);
	}
}

if (urlParams.has('wss')){
	if (urlParams.get('wss')){
		session.wss = "wss://" + urlParams.get('wss');
	}
}

window.onmessage = function(e){ // iFRAME support
	log(e);
	try {
		if ("function" in e.data){ // these are calling in-app functions, with perhaps a callback -- TODO: add callbacks
			var ret = null;
			if (e.data.function === "previewWebcam"){
				ret = previewWebcam();
			} else if (e.data.function === "changeHTML"){
				try {
					ret = getById(e.data.target);
					ret.innerHTML = e.data.value;
				} catch(e){}
			} else if (e.data.function === "publishScreen"){
				ret = publishScreen();
			} 
		}
	} catch (err){errorlog(err);}
	
	if ("sendChat" in e.data){
		sendChat(e.data.sendChat); // sends to all peers; more options down the road
	}
	// Chat out gets called via getChatMessage function
	// Related code: parent.postMessage({"chat": {"msg":-----,"type":----,"time":---} }, "*");
	
	if ("mic" in e.data){  // this should work for the director's mic mute button as well. Needs to be manually enabled the first time still tho.
		if (e.data.mic === true){ // unmute
			session.muted = false; // set
			log(session.muted);
			toggleMute(true); // apply 
		} else if (e.data.mic === false){ // mute
			session.muted = true; // set
			log(session.muted);
			toggleMute(true); // apply
		} else if (e.data.mic === "toggle"){ // toggle
			toggleMute();
		} 
	}
	
	if ("camera" in e.data){  // this should work for the director's mic mute button as well. Needs to be manually enabled the first time still tho.
		if (e.data.camera === true){ // unmute
			session.videoMuted = false; // set
			log(session.videoMuted);
			toggleVideoMute(true); // apply 
		} else if (e.data.camera === false){ // mute
			session.videoMuted = true; // set
			log(session.videoMuted);
			toggleVideoMute(true); // apply
		} else if (e.data.camera === "toggle"){ // toggle
			toggleVideoMute();
		} 
	} 

	if ("mute" in e.data){
		if (e.data.mute === true){ // unmute
			session.speakerMuted = true; // set
			toggleSpeakerMute(true); // apply 
		} else if (e.data.mute === false){ // mute
			session.speakerMuted = false; // set
			toggleSpeakerMute(true); // apply
		} else if (e.data.mute === "toggle"){ // toggle
			toggleSpeakerMute();
		} 
	} else if ("speaker" in e.data){                  // same thing as mute.
		if (e.data.speaker === true){ // unmute
			session.speakerMuted = false; // set
			toggleSpeakerMute(true); // apply 
		} else if (e.data.speaker === false){ // mute
			session.speakerMuted = true; // set
			toggleSpeakerMute(true); // apply
		} else if (e.data.speaker === "toggle"){ // toggle
			toggleSpeakerMute();
		} 
	}
	
	
	if ("volume" in e.data){
		for (var i in session.rpcs){
			try {
				session.rpcs[i].videoElement.volume = parseFloat(e.data.volume);
			} catch(e){
				errorlog(e);
			}
		}
    }
	
	
	
	if ("bitrate" in e.data){
		for (var i in session.rpcs){
			try {
				session.requestRateLimit(parseInt(e.data.bitrate),i);
			} catch(e){
				errorlog(e);
			}
		}
	}
	
	if ("sceneState" in e.data){  // TRUE OR FALSE - tells the connected peers if they are live or not via a tally light change.
		
		var visibility = e.data.sceneState;
		var bundle = {};
		bundle.sceneUpdate = [];
		
		for (var UUID in session.rpcs){
			if (session.rpcs[UUID].visibility!==visibility){ // only move forward if there is a change; the event likes to double fire you see.
				
				session.rpcs[UUID].visibility = visibility;
				var msg = {};
				msg.visibility = visibility;
				
				if (session.rpcs[UUID].videoElement.style.display == "none"){  // Flag will be left alone, but message will say its disabled.
					msg.visibility = false;
				}
				
				msg.UUID = UUID;
				session.sendRequest(msg, UUID); 
				bundle.sceneUpdate.push(msg)
			}
		}
		session.sendRequest(bundle); // we want all publishing peers to know the state
	}
	
	if ("sendMessage" in e.data){  // webrtc send to viewers
		session.sendMessage(e.data);
	}
	
	if ("sendRequest" in e.data){  // webrtc send to publishers
		session.sendRequest(e.data);
	}
	
	if ("sendPeers" in e.data){ // webrtc send message to every connected peer; like send and request; a hammer vs a knife.
		session.sendPeers(e.data)
	}
	
	if ("reload" in e.data){
        location.reload();
    } 
		
	if ("getStats" in e.data){
		
		var stats = {};
		stats.total_outbound_connections = Object.keys(session.pcs).length;
		stats.total_inbound_connections = Object.keys(session.rpcs).length;
		stats.inbound_stats = {};
		for (var i in session.rpcs){
			stats.inbound_stats[session.rpcs[i].streamID] = session.rpcs[i].stats;
		}
		
		
		for (var uuid in session.pcs){
			setTimeout(function(UUID){
				session.pcs[UUID].getStats().then(function(stats){
					stats.forEach(stat=>{
						if (stat.type=="outbound-rtp"){
							if (stat.kind=="video"){
								
								if ("qualityLimitationReason" in stat){
									session.pcs[UUID].stats.quality_Limitation_Reason = stat.qualityLimitationReason;
								}
								if ("framesPerSecond" in stat){
									session.pcs[UUID].stats.resolution = stat.frameWidth+" x "+ stat.frameHeight +" @ "+stat.framesPerSecond;
								}
								if ("encoderImplementation" in stat){
									session.pcs[UUID].stats.encoder = stat.encoderImplementation;
								}
								
							}
						}
						return;
					});
					return;
				});
			},0,uuid);
		}
		setTimeout(function(){
			stats.outbound_stats = {};
			for (var i in session.pcs){  
				stats.outbound_stats[i] = session.pcs[i].stats;
			}
			parent.postMessage({"stats": stats }, "*");
		},1000);
    }
	
	if ("getLoudness" in e.data){
		log("GOT LOUDNESS REQUEST");
		if (e.data.getLoudness == true){
			var loudness = {};
			for (var i in session.rpcs){
				loudness[session.rpcs[i].streamID] = session.rpcs[i].stats.Audio_Loudness;
			}
			parent.postMessage({"loudness": loudness }, "*");
			session.pushLoudness = true;
		} else {
			session.pushLoudness = false;
		}
    }
	
	if ("getStreamIDs" in e.data){
		log("GOT LOUDNESS REQUEST");
		if (e.data.getStreamIDs == true){
			var streamIDs = {};
			for (var i in session.rpcs){
				streamIDs[session.rpcs[i].streamID] = session.rpcs[i].label;
			}
			parent.postMessage({"streamIDs": streamIDs }, "*");
			
		}
    }
	
	if ("close" in e.data){
        for (var i in session.rpcs){
			try {
				session.rpcs[i].close();
			} catch(e){
				errorlog(e);
			}
		}
    }
	
	if ("style" in e.data){
		try{
			const style = document.createElement('style');
			style.textContent =  e.data.style;
			document.head.append(style);
			log(style);
		} catch(e){
			errorlog(e);
		}
	}
	
	if ("automixer" in e.data){
		if (e.data.automixer==true){
			session.manual = false;
			try{
				updateMixer();
			} catch(e){};
		} else if (e.data.automixer==false){
			session.manual = true;
		}
	}
	
	if ("target" in e.data){
		log(e.data);
		for (var i in session.rpcs){
			try {
				if ("streamID" in session.rpcs[i]){
				    if ((session.rpcs[i].streamID == e.data.target) || ( e.data.target == "*")){
						try{
							if ("settings" in e.data){
								for (const property in e.data.settings){
									session.rpcs[i].videoElement[property] = e.data.settings[property];
								}
							} 
							if ("add" in e.data){
								getById("gridlayout").appendChild(session.rpcs[i].videoElement);
								
							} else if ("remove" in e.data){
								try {
									session.rpcs[i].videoElement.parentNode.removeChild(session.rpcs[i].videoElement);
								} catch (e){
									try{
										session.rpcs[i].videoElement.parentNode.parentNode.removeChild(session.rpcs[i].videoElement.parentNode);
									}catch(e){}
								}
							}
						} catch(e){errorlog(e);}
					}
				}
			} catch(e){
				errorlog(e);
			}
		}
	}
};

function pokeIframeAPI(action, value=null, UUID=null){
	try{
		var data = {};
		
		data.action = action;
		
		if (value!==null){
			data.value = value;
		}
		if (UUID !==null){
			data.UUID = UUID;
		}
		
		if (parent){
			parent.postMessage(data, "*");
		}
	} catch(e){errorlog(e);}
}

function jumptoroom(){
	var arr = window.location.href.split('?');
	var roomname = getById("joinroomID").value;
	roomname = sanitizeRoomName(roomname);
	if (roomname.length){
		if (arr.length > 1 && arr[1] !== '') {
			window.location+="&room="+roomname;
		} else {
			window.location+="?room="+roomname;
		}
	}
}

function sleep(ms = 0){  
  return new Promise(r => setTimeout(r, ms));  // LOLz!
}


// session.volume = 100; // needs to be set after?


//////////  Canvas Effects  ///////////////

function drawFrameMirrored(){
	session.canvasCtx.save();
    session.canvasCtx.scale(-1, 1);
    session.canvasCtx.drawImage(session.canvasSource, 0, 0, session.canvas.width*-1, session.canvas.height);
    session.canvasCtx.restore();
}

function setupCanvas(eleName){
	if (session.canvas===null){
		session.canvas = document.createElement("canvas");
		session.canvas.width="1280";
		session.canvas.height="720";
		session.canvasCtx = session.canvas.getContext('2d');
		session.canvasSource = document.createElement("video");
		session.canvasSource.autoplay = true;
		session.canvasSource.srcObject = new MediaStream();
		session.streamSrc = session.canvas.captureStream(30);
		session.videoElement.srcObject = session.streamSrc;
	} 
}

function addTracks(eleName){
	if (session.canvas===null){
		session.canvas = document.createElement("canvas");
		session.canvas.width="1280";
		session.canvas.height="720";
		session.canvasCtx = session.canvas.getContext('2d');
		session.canvasSource = document.createElement("video");
		session.canvasSource.autoplay = true;
		session.canvasSource.srcObject = new MediaStream();
		session.streamSrc = session.canvas.captureStream(30);
		session.videoElement.srcObject = session.streamSrc;
	} 
}

function applyEffects(eleName, track, stream){
	
	if (session.effects==1){
		setupCanvas(eleName);
		session.canvasSource.srcObject.addTrack(track, stream);
		session.canvas.width = track.getSettings().width;
		session.canvas.height = track.getSettings().height;
		if (session.effects==1){
			setTimeout(function(){drawFace();},100);
		}
	} else if (session.effects==2){
		setupCanvas(eleName);
		session.canvasSource.srcObject.addTrack(track, stream);
		session.canvas.width = track.getSettings().width;
		session.canvas.height = track.getSettings().height;
		var drawRate = parseInt(1000/track.getSettings().frameRate)+1;
		if (session.canvasInterval!==null){clearInterval(session.canvasInterval);}
		session.canvasInterval = setInterval(function(){drawFrameMirrored();},drawRate);
	} else {
		session.streamSrc.addTrack(track, stream);
		session.videoElement.srcObject.addTrack(track, stream);
		//session.videoElement.srcObject = outboundAudioPipeline(session.streamSrc); // WE don't do this unless we are prepared re-send all the audio tracks again also; this breaks the audio senders.
	}
}

function drawFace(){
	var faceAlignment = (function(){
		var vid = session.canvasSource;

		var canvas = session.canvas;
		var ctx = session.canvasCtx;
		
		var canvas_tmp = document.createElement("canvas");
		var ctx_tmp = canvas_tmp.getContext('2d');

		//var stream = canvas.captureStream(30);

		var image = new Image();
		var zoom = 10;
		var scale = 1;
		var lastFace = {};
		
		var w = vid.videoWidth;
		var h = vid.videoHeight;
		var x = vid.videoWidth/2;
		var y = vid.videoHeight/2;

		lastFace.x = vid.videoWidth/2;
		lastFace.y = vid.videoHeight/2;
		lastFace.w = vid.videoWidth;
		lastFace.h = vid.videoHeight;
		var yoffset=0;


		if (window.FaceDetector == undefined) {
			//console.error('Face Detection not supported');
			var faceDetector = false;
		} else {
			var faceDetector = new FaceDetector();
			//console.log('FaceD Loaded');
			setTimeout(function(){detect();},300);
			setTimeout(function(){draw();},33);
		}

		canvas.height = vid.videoHeight;
		canvas.width = vid.videoWidth;
		canvas_tmp.height = vid.videoHeight;
		canvas_tmp.width = vid.videoWidth;
		image.src = canvas_tmp.toDataURL();
		scale = canvas.width / image.width;
		lastFace.x = 0;
		lastFace.y = 0;
		lastFace.w = 1280/3/16*zoom;
		lastFace.h = 720/3/9*zoom;
		
		w = 1280/5;
		h = 720/5;
		x = 1280/2;
		y = 720/2 - w*9/zoom/2;
			

		async function detect(){
			

			ctx_tmp.drawImage(vid, 0, 0, vid.videoWidth, vid.videoHeight);
			image.src = canvas_tmp.toDataURL();
			await faceDetector.detect(image).then(faces => {
				
				if (faces.length===0){
					log("NO FACES");
					setTimeout(function(){detect();},10);
					return;
				}
				for (let face of faces) {
					lastFace.x = (face.boundingBox.x+lastFace.x)/2 || face.boundingBox.x;
					lastFace.y = (face.boundingBox.y+lastFace.y)/2 || face.boundingBox.y;
					lastFace.w = (face.boundingBox.width+lastFace.w)/2 || face.boundingBox.width;
					lastFace.h = (face.boundingBox.height+lastFace.h)/2 || face.boundingBox.height;
				}
				
				setTimeout(function(){detect();},300);
			}).catch((e) => {
				console.error("Boo, Face Detection failed: " + e);
			});
			
		}

		function draw() {
			canvas.height = vid.videoHeight;
			canvas.width = vid.videoWidth;

			if (lastFace.w-w<0.15*lastFace.w){
				w = w*0.999 + 0.001*lastFace.w;
			}
			if (lastFace.h-h<0.15*lastFace.h){
				h = h*0.999 + 0.001*lastFace.h;
			}
			if (Math.abs(x-(lastFace.x+lastFace.w/2))>0.15*(lastFace.x+lastFace.w/2.0)){
				x = x*0.999 + 0.001*(lastFace.x+lastFace.w/2.0);
			}
			if (Math.abs(y-(lastFace.y+lastFace.h/2))>0.15*(lastFace.y+lastFace.h/2.0)){
				y = y*0.999 + 0.001*(lastFace.y+lastFace.h/2.0);
			}
			
			yoffset = w*9/zoom/2;

			var yyy = y-w*9/zoom - yoffset;
			var hhh = w*3*9/zoom;
			var www = w*3*16/zoom;
			var xxx = x-w*16/zoom*1.5;
			
			if (www+xxx<1280){xxx=1280-www;}
			if (hhh+yyy<720){yyy=720-hhh;}
			
			if (www+xxx>1280){xxx=1280-www;}
			if (hhh+yyy>720){yyy=720-hhh;}
			
			if (yyy<0){yyy=0;}
			if (xxx<0){xxx=0;}
			
			ctx.drawImage(
					vid,
					xxx,
					yyy,
					www, 
					hhh,
					0,
					0,
					vid.videoWidth, 
					vid.videoHeight
				);

			setTimeout(function(){draw();},30);
		}
	})();
}

////////  END CANVAS EFFECTS  ///////////////////


var permaid=false;

if (urlParams.has('permaid') || urlParams.has('push')){
	permaid  = urlParams.get('permaid') || urlParams.get('push');
	session.streamID = sanitizeStreamID(permaid);
	
	if (urlParams.has('permaid')){
		updateURL("permaid="+session.streamID, true);  // I'm not deleting the permaID first tho...
	} else {
		updateURL("push="+session.streamID, true);  // I'm not deleting the permaID first tho...
	}
	
	if (urlParams.has('director')){ // if I do a short form of this, it will cause duplications in the code elsewhere.
		//var director_room_input = urlParams.get('director');
		//director_room_input = sanitizeRoomName(director_room_input);
		//createRoom(director_room_input);
		permaid = false; // used to avoid a trigger later on.
	} else {
		getById("container-1").className = 'column columnfade advanced';
		getById("container-4").className = 'column columnfade advanced';
		getById("dropButton").className = 'column columnfade advanced';
		
		getById("info").innerHTML = "";
		if (session.videoDevice === 0){
			getById("add_camera").innerHTML = "Share your Microphone";
			miniTranslate(getById("add_camera"),"share-your-mic");
		} else {
			getById("add_camera").innerHTML = "Share your Camera";
			miniTranslate(getById("add_camera"),"share-your-camera");
		}
		getById("add_screen").innerHTML = "Share your Screen";
		miniTranslate(getById("add_screen"),"share-your-screen");
		
		getById("passwordRoom").value = "";
		getById("videoname1").value = "";
		getById("dirroomid").innerHTML = "";
		getById("roomid").innerHTML = "";
		
		getById("mainmenu").style.alignSelf= "center";
		getById("mainmenu").classList.add("mainmenuclass");
		getById("header").style.alignSelf= "center";
		
		if ((iOS) || (iPad)){
			getById("header").style.display= "none"; // just trying to free up space.
		}
		
		if (session.webcamonly==true){  // mobile or manual flag 'webcam' pflag set
			getById("head1").innerHTML = '<font style="color:#CCC;" data-translate="please-accept-permissions">- Please accept any camera permissions</font>';
		} else {	
			getById("head1").innerHTML = '<br /><font style="color:#CCC" data-translate="please-select-which-to-share">- Please select which you wish to share</font>';
		}
	}
} 

if ( (session.roomid) || (urlParams.has('roomid')) || (urlParams.has('r')) || (urlParams.has('room')) ||  (filename) || (permaid!==false)){
	
	var roomid = "";
	if (filename){
		roomid = filename;
	} else if (urlParams.has('room')){
		roomid  = urlParams.get('room');
	} else if (urlParams.has('roomid')){
		roomid  = urlParams.get('roomid');
	} else if (urlParams.has('r')){
		roomid  = urlParams.get('r');
	} else if (session.roomid){
		roomid = session.roomid;
	}
	
	session.roomid = sanitizeRoomName(roomid);
	
	if (!(session.cleanOutput)){
		if (session.roomid==="test"){
			if (session.password===session.defaultPassword){
				var testRoomResponse = confirm("The room name 'test' is very commonly used and may not be secure.\n\nAre you sure you wish to proceed?");
				if (testRoomResponse==false){
					hangup();
					throw new Error("User requested to not enter room 'room'.");
				}
			}
		}
	}
	
	if (session.audioDevice===false){
		getById("headphonesDiv2").style.display="inline-block";
		getById("headphonesDiv").style.display="inline-block";
	}
	getById("info").innerHTML = "";
	getById("info").style.color="#CCC";
	getById("videoname1").value = session.roomid;
	getById("dirroomid").innerText = session.roomid;
	getById("roomid").innerText = session.roomid;
	getById("container-1").className = 'column columnfade advanced';
	getById("container-4").className = 'column columnfade advanced';
	getById("container-7").style.display = 'none';
	getById("container-8").style.display = 'none';
	getById("mainmenu").style.alignSelf= "center";
	getById("mainmenu").classList.add("mainmenuclass");
	getById("header").style.alignSelf= "center";
	
	if (session.webcamonly==true){  // mobile or manual flag 'webcam' pflag set
		getById("head1").innerHTML = '';
	} else {	
		getById("head1").innerHTML = '<font style="color:#CCC" data-translate="please-select-option-to-join">Please select an option to join.</font>';
	}
	
	if (session.roomid.length>0){
		if (session.videoDevice === 0){
			getById("add_camera").innerHTML = "Join room with Microphone";
			miniTranslate(getById("add_camera"),"join-room-with-mic");
		} else {
			getById("add_camera").innerHTML = "Join Room with Camera";
			miniTranslate(getById("add_camera"),"join-room-with-camera");
		}
		getById("add_screen").innerHTML = "Screenshare with Room";
		miniTranslate(getById("add_screen"),"share-screen-with-room");
	} else {
		if (session.videoDevice === 0){
			getById("add_camera").innerHTML = "Share your Microphone";
			miniTranslate(getById("add_camera"),"share-your-mic");
		} else {
			getById("add_camera").innerHTML = "Share your Camera";
			miniTranslate(getById("add_camera"),"share-your-camera");
		}
		getById("add_screen").innerHTML = "Share your Screen";
		miniTranslate(getById("add_screen"),"share-your-screen");
	}
	getById("head3").className = 'advanced';
	if (session.scene !== false){
		getById("container-4").className = 'column columnfade';
		getById("container-3").className = 'column columnfade';
		getById("container-2").className = 'column columnfade';
		getById("container-1").className = 'column columnfade';
		getById("header").className = 'advanced';
		getById("info").className = 'advanced';
		getById("head1").className = 'advanced';
		getById("head2").className = 'advanced';
		getById("head3").className = 'advanced';
		getById("mainmenu").style.display = "none";
		getById("translateButton").style.display = "none";
		log("Update Mixer Event on REsize SET");
		window.addEventListener("resize", updateMixer);
		window.addEventListener("orientationchange", function(){setTimeout(updateMixer, 200);});
		joinRoom(session.roomid); // this is a scene, so we want high resolutions
		getById("main").style.overflow = "hidden";
	} 
} else if (urlParams.has('director')){ // if I do a short form of this, it will cause duplications in the code elsewhere.
	if (directorLanding==false){
		var director_room_input = urlParams.get('director');
		director_room_input = sanitizeRoomName(director_room_input);
		log("director_room_input:"+director_room_input);
		createRoom(director_room_input);
	}
} else if ((session.view) && (permaid===false)){
	session.audioMeterGuest = false;
	if (session.audioEffects===null){
		session.audioEffects=false;
	}
	log("Update Mixer Event on REsize SET");
	getById("translateButton").style.display = "none";
	window.addEventListener("resize", updateMixer);
	window.addEventListener("orientationchange", function(){setTimeout(updateMixer, 200);});
	getById("main").style.overflow = "hidden";
} 

if (session.audioEffects===null){
	session.audioEffects=true;
}

if (urlParams.has('hidemenu') || urlParams.has('hm')){  // needs to happen the room and permaid applications
    getById("mainmenu").style.display="none";
	getById("header").style.display="none";
	getById("mainmenu").style.opacity = 0;
	getById("header").style.opacity = 0;
}

if (urlParams.has('hideheader') || urlParams.has('noheader') || urlParams.has('hh')){  // needs to happen the room and permaid applications
	getById("header").style.display="none";
	getById("header").style.opacity = 0;
}

function checkConnection(){
	if (session.ws===null){return;}
	if (document.getElementById("qos")){  // true or false; null might cause problems?
		if ((session.ws) && (session.ws.readyState === WebSocket.OPEN)) {
			getById("qos").style.color = "white";
		} else {
			getById("qos").style.color = "red";
		}
	}
}
setInterval(function(){checkConnection();},5000);


function printViewStats(menu, statsObj, streamID){  // Stats for viewing a remote video
	var scrollLeft = menu.scrollLeft;
	var scrollTop = menu.scrollTop;
	//menu.innerHTML="rae:"+session.audioEffects+ ", lae:"+ !session.disableWebAudio;
	menu.innerHTML="StreamID: <b>"+streamID+"</b><br />";
	menu.innerHTML+= printValues(statsObj);
	menu.scrollTop = scrollTop;
	menu.scrollLeft = scrollLeft;
	
}
function printValues(obj) {  // see: printViewStats
	var out = "";
	for (var key in obj) {
		if (typeof obj[key] === "object") {
			if (obj[key]!=null){
				out += "<li><h2 title='" + key + "'>"+key+"</h2></li>"
				out += printValues(obj[key]);
			}
		} else {
			if (key.startsWith("_")){
				// if it starts with _, we don't want to show it.
			} else {
				var unit  = '';
				var stat = key;
				if(key == 'Bitrate_in_kbps') {
					var unit = " kbps";
					stat = "Bitrate";
				}
				if(key == 'type') {
					var unit = "";
					stat = 'Type';
				}
				if(key == 'packetLoss_in_percentage') {
					var unit = " %";
					stat = 'Packet Loss 📶';
				}
				if(key == 'Buffer_Delay_in_ms') {
					var unit = " ms";
					stat = 'Buffer Delay';
				}
				if (obj[key]===null){
					obj[key]="null";
				}
				out +="<li><span>"+stat+"</span><span>"+obj[key]+ unit + "</span></li>";
			}
		}
	}
	return out;
}


function printMyStats(menu){  // see: setupStatsMenu
	
    var scrollLeft = getById("menuStatsBox").scrollLeft;
    var scrollTop = getById("menuStatsBox").scrollTop;
	menu.innerHTML="";
	
	session.stats.outbound_connections = Object.keys(session.pcs).length;
	session.stats.inbound_connections = Object.keys(session.rpcs).length;
	printViewValues(session.stats);
	
	function printViewValues(obj) { 
		for (var key in obj) {
			if (typeof obj[key] === "object") {				
				printViewValues(obj[key]);
			} else {
				menu.innerHTML +="<li><span>"+key+"</span><span>"+obj[key]+"</span></li>";
			}
		}
	}
	menu.innerHTML+="<button onclick='session.forcePLI(null,event);' data-translate='send-keyframe-to-viewer'>Send Keyframe to Viewers</button>";
	for (var uuid in session.pcs){
		setTimeout(function(UUID){
			session.pcs[UUID].getStats().then(function(stats){
				stats.forEach(stat=>{
					if (stat.type=="outbound-rtp"){
						if (stat.kind=="video"){
							if ("qualityLimitationReason" in stat){
								session.pcs[UUID].stats.quality_Limitation_Reason = stat.qualityLimitationReason;
							}
							if ("framesPerSecond" in stat){
								session.pcs[UUID].stats.resolution = stat.frameWidth+" x "+ stat.frameHeight +" @ "+stat.framesPerSecond;
							}
							if ("encoderImplementation" in stat){
								session.pcs[UUID].stats.encoder = stat.encoderImplementation;
							}
							
						}
					}
					return;
				});
				printViewValues(session.pcs[UUID].stats);
				menu.innerHTML+="<hr>";
				try{
					getById("menuStatsBox").scrollLeft = scrollLeft;
					getById("menuStatsBox").scrollTop = scrollTop;
				} catch(e){}
				return;
			}).catch(()=>{
				printViewValues(session.pcs[UUID].stats);
				menu.innerHTML+="<hr>";
			});

		},0,uuid);
	}
	try{
		getById("menuStatsBox").scrollLeft = scrollLeft;
		getById("menuStatsBox").scrollTop = scrollTop;
	} catch(e){}
}



function updateStats(obsvc=false){
	log('updateStats - resolution found');
	if (getById('previewWebcam')===null){return;} // Don't show unless preview (or new stats pane is added)
	try {
		getById("webcamstats").innerHTML = "";
		getById('previewWebcam').srcObject.getVideoTracks().forEach(
			function(track) {
				log(track.getSettings());
				if ((obsvc) && (parseInt(track.getSettings().frameRate)==30)){
					getById("webcamstats").innerHTML = "Video Settings: "+(track.getSettings().width||0) +"x"+(track.getSettings().height||0)+" @ up to 60fps";
				} else {
					getById("webcamstats").innerHTML = "Current Video Settings: "+(track.getSettings().width||0) +"x"+(track.getSettings().height||0)+"@"+(parseInt(track.getSettings().frameRate*10)/10)+"fps";
				}
			}
		);
		
	} catch (e){errorlog(e);}
}


function toggleMute(apply=false){ // TODO: I need to have this be MUTE, toggle, with volume not touched.

	log("muting");

	if (session.director){
		if (!session.directorEnabledPPT){
			log("Director doesn't have PPT enabled yet");
			// director has not enabled PTT yet.
			return;
		}
	}
	
	log(session.muted);
	if (apply){
		session.muted =! session.muted;
	}
	try{var ptt = getById("press2talk");} catch(e){var ptt=false;}
	
	if (session.muted==false){
		session.muted = true;
		getById("mutetoggle").className="las la-microphone-slash my-float toggleSize";
		getById("mutebutton").className="float2";
		if (session.streamSrc){
			session.streamSrc.getAudioTracks().forEach((track) => {
			  track.enabled = false;
			});
		}
		if (ptt){
			ptt.innerHTML = "<span data-translate='Push-to-Mute'>🔇 Push to Talk</span>";
		}
		
	} else{
		session.muted=false;
		getById("mutetoggle").className="las la-microphone my-float toggleSize";
		getById("mutebutton").className="float";
		if (session.streamSrc){
			session.streamSrc.getAudioTracks().forEach((track) => {
			  track.enabled = true;
			});
		}
		if (ptt){
			ptt.innerHTML = "<span data-translate='Push-to-Mute'>🔴 Push to Mute</span>";
		}
	}
}


function toggleSpeakerMute(apply=false){ // TODO: I need to have this be MUTE, toggle, with volume not touched.

	if (CtrlPressed){
		resetupAudioOut();
	}

	if (apply){
		session.speakerMuted =! session.speakerMuted; 
	}
	if (session.speakerMuted == false){
		session.speakerMuted = true;
		getById("mutespeakertoggle").className="las la-volume-mute my-float toggleSize";
		getById("mutespeakerbutton").className="float2";
		
		var sounds = document.getElementsByTagName("video");
		for (var i = 0; i < sounds.length; ++i){
			sounds[i].muted = session.speakerMuted;
		}
		
	} else {
		session.speakerMuted = false;
		
		getById("mutespeakertoggle").className="las la-volume-up my-float toggleSize";
		getById("mutespeakerbutton").className="float";
		
		var sounds = document.getElementsByTagName("video");
		for (var i = 0; i < sounds.length; ++i){
			
			if (sounds[i].id === "videosource"){ // don't unmute ourselves. feedback galore if so.
				continue;
			} else if (sounds[i].id === "previewWebcam"){
				continue;
			} else if (sounds[i].id === "screenshare"){
				continue;
			} else {
				sounds[i].muted = session.speakerMuted;
			}
		}
	}
	
	for (var UUID in session.rpcs){
		if (session.rpcs[UUID].videoElement){
			if (UUID === session.directorUUID){
				session.rpcs[UUID].videoElement.muted = false; // unmute director
				log("MAKE SURE DIRECTOR ISN'T MUTED");
			} else {
				session.rpcs[UUID].videoElement.muted = session.speakerMuted;
			}
		}
	}
	
	if ((iOS) || (iPad)){
		resetupAudioOut();
	}
}


function toggleChat(event=null){ // TODO: I need to have this be MUTE, toggle, with volume not touched.
	if (session.chat==false){
		setTimeout(function(){document.addEventListener("click", toggleChat);},10);
		
		getById("chatModule").addEventListener("click",function(e){
			e.stopPropagation(); 
			return false;
		});
		session.chat = true;
		getById("chattoggle").className="las la-comment-dots my-float toggleSize";
		getById("chatbutton").className="float2";
		getById("chatModule").style.display = "block";
		getById("chatInput").focus(); // give it keyboard focus
	} else{
		session.chat=false;
		getById("chattoggle").className="las la-comment-alt my-float toggleSize";
		getById("chatbutton").className="float";
		getById("chatModule").style.display = "none";
		
		document.removeEventListener("click", toggleChat);
		getById("chatModule").removeEventListener("click", function(e){
			e.stopPropagation(); 
			return false;
		});
	}
	if (getById("chatNotification").value){
		getById("chatNotification").value = 0;
	}
	getById("chatNotification").classList.remove("notification");
}

function directorAdvanced(ele){
	var target = document.createElement("div");
	target.style = "position:absolute;float:left;width:270px;height:222px;background-color:#7E7E7E;";
	
	var closeButton = document.createElement("button");
	closeButton.innerHTML = "<i class='las la-times'></i> close";
	closeButton.style.left = "5px";
    closeButton.style.position = "relative";
	closeButton.onclick = function(){
		target.parentNode.removeChild(target);
	};
	target.appendChild(closeButton);
	
	var someButton = document.createElement("button");
	someButton.innerHTML = "<i class='las la-reply'></i> some action ";
	someButton.style.left = "5px";
    someButton.style.position = "relative";
	someButton.onclick = function(){
		var actionMsg = {}; 
		session.sendRequest(actionMsg, ele.dataset.UUID);
	};
	target.appendChild(someButton);
	
	ele.parentNode.appendChild(target);
}

function directorSendMessage(ele){
	var target = document.createElement("div");
	target.style = "position:absolute;float:left;width:275px;height:222px;background-color:#7E7E7E;";
	
	var inputField = document.createElement("textarea");
	inputField.placeholder = "Enter your message here";
	inputField.style.width="255px";
	inputField.style.height="170px";
	inputField.style.margin = "5px 10px 5px 10px";
	inputField.style.padding = "5px";
	
	target.appendChild(inputField);
	
	var sendButton = document.createElement("button");
	sendButton.innerHTML = "<i class='las la-reply'></i> send message ";
	sendButton.style.left = "5px";
    sendButton.style.position = "relative";
	sendButton.onclick = function(){
		var chatMsg = {}; 
		chatMsg.chat=inputField.value;
		if (sendButton.parentNode.overlay){
			chatMsg.overlay = sendButton.parentNode.overlay;
		}
		session.sendRequest(chatMsg, ele.dataset.UUID);
		inputField.value="";
		//target.parentNode.removeChild(target);
	};
	
	
	var closeButton = document.createElement("button");
	closeButton.innerHTML = "<i class='las la-times'></i> close";
	closeButton.style.left = "5px";
    closeButton.style.position = "relative";
	closeButton.onclick = function(){
		inputField.value = "";
		target.parentNode.removeChild(target);
	};

	var overlayMsg = document.createElement("span");
	
	overlayMsg.style.left = "16px";
	overlayMsg.style.top = "6px";
    overlayMsg.style.position = "relative";
	overlayMsg.innerHTML = "<i class='lar la-bell' style='font-size:170%; color:#FFF; cursor:pointer;'></i>";
	target.overlay=true;
	
	overlayMsg.onclick = function(e){
		log(e.target.parentNode.parentNode);
		if (e.target.parentNode.parentNode.overlay===true){
			e.target.parentNode.parentNode.overlay = false;
			e.target.parentNode.innerHTML = "<i class='lar la-bell-slash' style='font-size:170%; color:#DDD; cursor:pointer;'></i>";
		} else {
			e.target.parentNode.parentNode.overlay=true;
			e.target.parentNode.innerHTML = "<i class='lar la-bell' style='font-size:170%; color:#FFF; cursor:pointer;'></i>";
		}
	}
	
	
	inputField.addEventListener("keydown",function(e){
		if(e.keyCode == 13){
			e.preventDefault();
			sendButton.click();
		} else if (e.keyCode == 27){
			e.preventDefault();
			inputField.value="";
			target.parentNode.removeChild(target);
		}
	});
	target.appendChild(closeButton);
	target.appendChild(sendButton);
	target.appendChild(overlayMsg);
	ele.parentNode.appendChild(target);
	inputField.focus();
	inputField.select();
}
function toggleVideoMute(apply=false){ // TODO: I need to have this be MUTE, toggle, with volume not touched.
	if (apply){
		session.videoMuted=!session.videoMuted;
	}
	if (session.videoMuted==false){
		session.videoMuted = true;
		getById("mutevideotoggle").className="las la-eye-slash my-float toggleSize";
		getById("mutevideobutton").className="float2";
		if (session.streamSrc){
			session.streamSrc.getVideoTracks().forEach((track) => {
			  track.enabled = false;
			});
		}
		
	} else{
		session.videoMuted=false;
		
		getById("mutevideotoggle").className="las la-eye my-float toggleSize";
		getById("mutevideobutton").className="float";
		if (session.streamSrc){
			session.streamSrc.getVideoTracks().forEach((track) => {
			  track.enabled = true;
			});
		}
	}
}

var toggleSettingsState = false;
function toggleSettings(forceShow=false){ // TODO: I need to have this be MUTE, toggle, with volume not touched.
	
	getById("multiselect-trigger3").dataset.state="0";
	getById("multiselect-trigger3").classList.add('closed');
	getById("multiselect-trigger3").classList.remove('open');
	getById("chevarrow2").classList.add('bottom');
		
	if (toggleSettingsState==true){if (forceShow==true){return;}} // don't close if already open
	if (getById("popupSelector").style.display=="none"){
		
		updateConstraintSliders();
		
		setTimeout(function(){document.addEventListener("click", toggleSettings);},10);
		
		getById("popupSelector").addEventListener("click",function(e){
			e.stopPropagation(); 
			return false;
		});
		
		enumerateDevices().then(gotDevices2).then(function(){});
	
		getById("popupSelector").style.display="inline-block"
		getById("settingsbutton").classList.add("float2");
		getById("settingsbutton").classList.remove("float");
		setTimeout(function(){getById("popupSelector").style.right="0px";},1);
		toggleSettingsState=true;
	} else{
		document.removeEventListener("click", toggleSettings);
		getById("popupSelector").removeEventListener("click", function(e){
			e.stopPropagation(); 
			return false;
		});
		
		getById("popupSelector").style.right="-400px";
		
		getById("settingsbutton").classList.add("float");
		getById("settingsbutton").classList.remove("float2");
		setTimeout(function(){getById("popupSelector").style.display="none";},200);
		toggleSettingsState=false;
	}
}

function hangup(){ // TODO: I need to have this be MUTE, toggle, with volume not touched.
	getById("main").innerHTML = "<font style='font-size:500%;text-align:center;margin:auto;'>👋</font>";
	setTimeout(function(){session.hangup();},0);
}

function hangupComplete(){
	getById("main").innerHTML = "<font style='font-size:500%;text-align:center;margin:auto;'>👋</font>";
}


function raisehand(){
	if (session.directorUUID==false){
		log("no director in room yet");
		return;
	}
	
	var data = {};
	data.UUID = session.directorUUID;
	
	log(data);
	if (getById("raisehandbutton").dataset.raised=="0"){
		getById("raisehandbutton").dataset.raised="1";
		getById("raisehandbutton").classList.add("raisedHand");
		data.chat = "Raised hand";
		log("hand raised");
	} else {
		log("hand lowered");
		getById("raisehandbutton").dataset.raised="0";
		getById("raisehandbutton").classList.remove("raisedHand");
		data.chat = "Lowered hand";
	}
	session.sendMessage(data, data.UUID);
}
function lowerhand(){
	log("hand lowered");
	getById("raisehandbutton").dataset.raised="0";
	getById("raisehandbutton").classList.remove("raisedHand");
}

var previousRoom="";
var stillNeedRoom=true;
var transferCancelled = false;
function directMigrate(ele, event){  // everyone in the room will hangup this guest also?  I like that idea.  What about the STREAM ID?  I suppose we don't kick out if the viewID matches.

	if (event === false){
		if (previousRoom===null){ // user cancelled in previous callback
			ele.innerHTML = '<i class="las la-paper-plane"></i> <span data-translate="forward-to-room">Transfer</span>';
			ele.style.backgroundColor = null;
			return;
		}
		if (transferCancelled===true){
			ele.innerHTML = '<i class="las la-paper-plane"></i> <span data-translate="forward-to-room">Transfer</span>';
			ele.style.backgroundColor = null;
			return;
		}
		migrateRoom = previousRoom
	} else if ((event.ctrlKey) || (event.metaKey)){
		ele.innerHTML = '<i class="las la-check"></i> <span data-translate="forward-to-room">Armed</span>';
		ele.style.backgroundColor = "#BF3F3F";
		transferCancelled=false;
		Callbacks.push([directMigrate, ele, stillNeedRoom]);
		stillNeedRoom=false;
		log("Migrate queued");
		return;
	} else {
		var migrateRoom = prompt("Transfer guests to room:\n\n(Please note rooms must share the same password)", previousRoom);
		stillNeedRoom=true;
		if (migrateRoom===null){ // user cancelled
			ele.innerHTML = '<i class="las la-paper-plane"></i> <span data-translate="forward-to-room">Transfer</span>';
			ele.style.backgroundColor = null;
			transferCancelled=true;
			return;
		}
		try{
			migrateRoom = sanitizeRoomName(migrateRoom);
			previousRoom = migrateRoom;
		} catch(e){}
		
	}
	ele.innerHTML = '<i class="las la-paper-plane"></i> <span data-translate="forward-to-room">Transfer</span>';
	ele.style.backgroundColor = null;
	
	if (migrateRoom){
		previousRoom = migrateRoom;
		
		var msg = {};
		msg.request = "migrate";
		if (session.password){
			return session.generateHash(migrateRoom+session.password+session.salt,16).then(function(rid){
				var msg = {};
				msg.request = "migrate";
				msg.roomid = rid;
				msg.target = ele.dataset.UUID;
				session.sendMsg(msg); // send to everyone in the room, so they know if they are on air or not.
			});
		} else {
			var msg = {};
			msg.request = "migrate";
			msg.roomid = migrateRoom;
			msg.target = ele.dataset.UUID;
			session.sendMsg(msg); // send to everyone in the room, so they know if they are on air or not.
		}
	}
}
var stillNeedHangupTarget=1;
function directHangup(ele, event){  // everyone in the room will hangup this guest?  I like that idea.
	if (event == false){
		if (stillNeedHangupTarget===1){
			var confirmHangup = confirm("Are you sure you wish to disconnect these users?");
			stillNeedHangupTarget = confirmHangup;
		} else {
			confirmHangup = stillNeedHangupTarget;
		}
	} else if ((event.ctrlKey) || (event.metaKey)){
		ele.innerHTML = '<i class="las la-skull-crossbones"></i> <span data-translate="disconnect-guest" >ARMED</span>';
		ele.style.backgroundColor = "#BF3F3F";
		stillNeedHangupTarget=1;
		Callbacks.push([directHangup, ele, false]);
		log("Hangup queued");
		return;
	} else {
		var confirmHangup = confirm("Are you sure you wish to disconnect this user?");
	}

	if (confirmHangup){
		var msg = {};
		//msg.request = "sendroom";
		msg.hangup = true;
		
		//msg.target = ele.dataset.UUID;
		log(msg);
		log(ele.dataset.UUID);
		session.sendRequest(msg, ele.dataset.UUID);
		//session.anysend(msg); // send to everyone in the room, so they know if they are on air or not.
	} else {
		ele.innerHTML = '<i class="las la-sign-out-alt"></i><span data-translate="disconnect-guest"> Hangup</span>';
		ele.style.backgroundColor = null;
	}
}

function directEnable(ele, event){ // A directing room only is controlled by the Director, with the exception of MUTE.
	if (!((event.ctrlKey) || (event.metaKey))){
		if (ele.dataset.enable==1){
			ele.dataset.enable = 0;
			ele.className = "";
			ele.children[1].innerHTML = "Add to Scene";
			getById("container_"+ele.dataset.UUID).style.backgroundColor = null;
		} else {
			getById("container_"+ele.dataset.UUID).style.backgroundColor = "#649166";
			ele.dataset.enable = 1;
			ele.className = "pressed";
			ele.children[1].innerHTML = "Remove";
		}
	}
	var msg = {};
	msg.request = "sendroom";
	//msg.roomid = session.roomid;
	msg.scene = "1"; // scene
	msg.action = "display";
	msg.value =  ele.dataset.enable;
	msg.target = ele.dataset.UUID;
	
	session.sendMsg(msg); // send to everyone in the room, so they know if they are on air or not.
}


function directMute(ele, event){ // A directing room only is controlled by the Director, with the exception of MUTE.
	log("mute");
	if (!((event.ctrlKey) || (event.metaKey))){
		if (ele.dataset.mute==0){
			ele.dataset.mute = 1;
			ele.className = "";
			ele.children[1].innerHTML = "Mute in scene";
        } else {
			ele.dataset.mute = 0;
			ele.className = "pressed";
			ele.children[1].innerHTML = "Un-mute";
        }
	}
	var msg = {};
	msg.request = "sendroom";
	//msg.roomid = session.roomid;
	msg.scene = "1";
	msg.action = "mute";
	msg.value =  ele.dataset.mute;
	msg.target = ele.dataset.UUID;
	session.sendMsg(msg); // send to everyone in the room, so they know if they are on air or not.
}

function remoteLowerhands(UUID){ 
	var msg = {};
	msg.lowerhand = true;
	msg.UUID = UUID;
	session.sendRequest(msg, UUID);
}


function remoteMute(ele, event){ 
	log("mute");
	if (!((event.ctrlKey) || (event.metaKey))){
		if (ele.dataset.mute==1){
			ele.dataset.mute = 0;
			ele.className = "";
			ele.children[1].innerHTML = "mute guest";
        } else {
			ele.dataset.mute = 1;
			ele.className = "pressed";
			ele.children[1].innerHTML = "Un-mute guest";
        }
	}
	
	try {
		session.rpcs[ele.dataset.UUID].directorMutedState = ele.dataset.mute;
		var volume = session.rpcs[ele.dataset.UUID].directorVolumeState;
	} catch(e){
		errorlog(e);
		var volume = 100;
	}
	
	var msg = {};
	if (ele.dataset.mute==0){
		msg.volume = volume;
	} else {
		msg.volume = 0;
	}
	msg.UUID = ele.dataset.UUID;
	session.sendRequest(msg, ele.dataset.UUID);
}

function directVolume(ele){ // A directing room only is controlled by the Director, with the exception of MUTE.
	log("volume");
	var msg = {};
	msg.request = "sendroom";
	//msg.roomid = session.roomid;
	msg.scene = "1";
	msg.action = "volume";
	msg.target = ele.dataset.UUID; // i want to focus on the STREAM ID, not the UUID...
	msg.value = ele.value;
	session.sendMsg(msg); // send to everyone in the room, so they know if they are on air or not.
}


function remoteVolume(ele){ // A directing room only is controlled by the Director, with the exception of MUTE.
	log("volume");
	var msg = {};
	var muted = session.rpcs[ele.dataset.UUID].directorMutedState;
	if (muted==1){ // 1 is a string, not an int, so == and not ===. this happens in a few places :/  
		session.rpcs[ele.dataset.UUID].directorVolumeState = ele.value;
	} else {
		session.rpcs[ele.dataset.UUID].directorVolumeState = ele.value;
		msg.volume = ele.value;
		msg.UUID = ele.dataset.UUID;
		session.sendRequest(msg, ele.dataset.UUID);
	}
}


function sendChat(chatmessage="hi"){ // A directing room only is controlled by the Director, with the exception of MUTE.
	log("Chat message");
	var msg = {};
	msg.chat = chatmessage;
	session.sendPeers(msg);
}

var activatedStream = false;
function publishScreen(){
	if( activatedStream == true){return;}
	activatedStream = true;
	setTimeout(function(){activatedStream=false;},1000);

	var title = "ScreenShare";//getById("videoname2").value;

	formSubmitting = false;
	
	var quality = parseInt(getById("webcamquality2").elements.namedItem("resolution2").value);
	
	if (session.quality!==false){
		quality=session.quality; // override the user's setting
	}
	
	if (quality==0){
		var width = {ideal: 1920};
		var height = {ideal: 1080};
	} else if (quality==1){
		var width = {ideal: 1280};
		var height = {ideal: 720};
	} else if (quality==2){
		var width = {ideal: 640};
		var height = {ideal: 360};
	} else if (quality>=3){  // lowest
		var width = {ideal: 320};
		var height = {ideal: 180};
	}
	
	if (session.width){
		width = {ideal: session.width};
	}
	if (session.height){
		height = {ideal: session.height};
	}

	var constraints = window.constraints = {
		audio: {
			echoCancellation: false, 
			autoGainControl: false, 
			noiseSuppression: false
		}, 
		video: {width: width, height: height, mediaSource: "screen"}
	};
	
	if (session.noiseSuppression === true){
		constraints.audio.noiseSuppression = true;; // the defaults for screen publishing should be off.
	}
	if (session.autoGainControl === true){
		constraints.audio.autoGainControl = true; // the defaults for screen publishing should be off.
	}
	if (session.echoCancellation === true){
		constraints.audio.echoCancellation = true; // the defaults for screen publishing should be off.
	}
	
	if (session.nocursor){
		constraints.video.cursor = { exact: "none" };  // Not sure this does anything, but whatever.
	} 
	
	if (session.framerate!==false){
		constraints.video.frameRate = session.framerate;
	} else {
		constraints.video.frameRate = {ideal: 60};
	}
	
	var audioSelect = document.querySelector('select#audioSourceScreenshare');
	var outputSelect = document.querySelector('select#outputSourceScreenshare');
	
	
	session.sink = outputSelect.options[outputSelect.selectedIndex].value;
	log("Session SInk: "+session.sink);
	if (session.sink=="default"){session.sink=false;}
	
	/* if (session.sink ===false){
		if (session.outputDevice){
			try {
				for (var i in outputSelect.options){
					log(outputSelect.options[i].label.replace(/[\W]+/g,"_").toLowerCase());
					log(session.outputDevice);
					if (outputSelect.options[i].label.replace(/[\W]+/g,"_").toLowerCase().includes(session.outputDevice)){
						session.sink = outputSelect.options[i].value;
						break;
					}
				}
			} catch (e){}
		}
	} */
	
	log("*");
	session.publishScreen(constraints, title, audioSelect).then((res)=>{
		if (res==false){return;} // no screen selected
		log("streamID is: "+session.streamID);

		if (!(session.cleanOutput)){
			getById("mutebutton").className="float";
			getById("mutespeakerbutton").className="float";
			getById("chatbutton").className="float";
			getById("mutevideobutton").className="float";
			getById("hangupbutton").className="float";
			if (session.showSettings){
				getById("settingsbutton").className="float";
			}
			if (session.raisehands){
				getById("raisehandbutton").className="float";
			}
			if (screensharebutton){
				getById("screensharebutton").className="float";
			}
			getById("controlButtons").style.display="flex";
			getById("helpbutton").style.display = "inherit";
			getById("reportbutton").style.display = "";
		} else {
			getById("controlButtons").style.display="none";
		}
		getById("head1").className = 'advanced';
		getById("head2").className = 'advanced';
	}).catch(()=>{});

}
function publishWebcam(btn = false){
	if (btn){
		if (btn.dataset.ready == "false"){
			warnlog("Clicked too quickly; button not enabled yet");
			return;
		}
	}
	
	if( activatedStream == true){return;}
	activatedStream = true;
	log("PRESSED PUBLISH WEBCAM!!");
	
	var title = "Webcam"; // getById("videoname3").value;
	var ele = getById("previewWebcam");

	formSubmitting = false;
	window.scrollTo(0, 0); // iOS has a nasty habit of overriding the CSS when changing camaera selections, so this addresses that.
	
	getById("head2").className = 'advanced';
	
	if (session.roomid!==false){
		if ((session.roomid==="") && ((!(session.view)) || (session.view===""))){  
					//	no room, no viewing, viewing disabled
		} else {
			log("ROOM ID ENABLED");
			log("Update Mixer Event on REsize SET");
			window.addEventListener("resize", updateMixer);
			window.addEventListener("orientationchange", function(){setTimeout(updateMixer, 200);});
			getById("main").style.overflow = "hidden";
			//session.cbr=0; // we're just going to override it
			
			if (session.stereo==5){
				if (session.roomid===""){
					session.stereo=1;
				} else {
					session.stereo=3;
				}
			}
			joinRoom(session.roomid);
			if (!(session.cleanOutput)){
				getById("head2").className = '';
			}
			
		}
		getById("head3").className = 'advanced';
	} else {
		getById("head3").className = '';
		getById("logoname").style.display = 'none';
	}
	
	log("streamID is: "+session.streamID);
	getById("head1").className = 'advanced';
	

	if (!(session.cleanOutput)){
		getById("mutebutton").className="float";
		getById("mutespeakerbutton").className="float";
		getById("chatbutton").className="float";
		getById("mutevideobutton").className="float";
		getById("hangupbutton").className="float";
		if (session.showSettings){
			getById("settingsbutton").className="float";
		}
		if (session.raisehands){
			getById("raisehandbutton").className="float";
		}
		if (screensharebutton){
			getById("screensharebutton").className="float";
		}
		getById("controlButtons").style.display="flex";
		getById("helpbutton").style.display = "inherit";
		getById("reportbutton").style.display = "";
	} else {
		getById("controlButtons").style.display="none";
	}
	
	if (urlParams.has('permaid')){
		updateURL("permaid="+session.streamID);
	} else {
		updateURL("push="+session.streamID);
	}
	
	session.publishStream(ele, title);

}

function outboundAudioPipeline(stream){
	
	if (session.disableWebAudio){
		return stream;
	}
	//if ((iOS) || (iPad)){
	//	return stream
	//} else {
	try {
		log("Web Audio");
		var tracks = stream.getAudioTracks();
		if (tracks.length){
			for (var waid in session.webAudios){ // TODO:  EXCLUDE CURRENT TRACK IF ALREADY EXISTS ... if (track.id === wa.id){..
				 session.webAudios[waid].stop();
				 delete session.webAudios[waid];
			}
			
			
			var webAudio = {};
			webAudio.compressor = false;
			webAudio.analyser = false;
			webAudio.gainNode = false;
			
			webAudio.lowEQ = false;
			webAudio.midEQ = false;
			webAudio.highEQ = false;
			
			webAudio.id = tracks[0].id; // first track is used.
			
			if (session.audioLatency!==false){ // session.audioLatency could be useful for fixing clicking issues?
				var audioContext = new AudioContext({
				  latencyHint: session.audioLatency/1000.0//, // needs to be in seconds, but OBSN user input is via milliseconds
				 // sampleRate: 48000 // not sure this is a great idea, but might as well add this here, versus later on since it is needed anyways.
				});
			} else {
				var audioContext = new AudioContext();
			}
			
			webAudio.audioContext = audioContext;
			webAudio.mediaStreamSource = audioContext.createMediaStreamSource(stream); // clone to fix iOS issue
			webAudio.destination = audioContext.createMediaStreamDestination();
			webAudio.gainNode = audioGainNode(webAudio.mediaStreamSource, audioContext);
			
			var anonNode = webAudio.gainNode;
			
			if (session.equalizer){  // https://webaudioapi.com/samples/frequency-response/ for a tool to help set values
				webAudio.lowEQ = audioContext.createBiquadFilter();
				webAudio.lowEQ.type = "lowshelf";
				webAudio.lowEQ.frequency.value = 100;
				webAudio.lowEQ.gain.value = 0;
				
				webAudio.midEQ = audioContext.createBiquadFilter();
				webAudio.midEQ.type = "peaking";
				webAudio.midEQ.frequency.value = 1000;
				webAudio.midEQ.Q.value = 0.5;
				webAudio.midEQ.gain.value = 0;
				
				webAudio.highEQ = audioContext.createBiquadFilter();
				webAudio.highEQ.type = "highshelf";
				webAudio.highEQ.frequency.value = 10000;
				webAudio.highEQ.gain.value = 0;
				
				anonNode.connect(webAudio.lowEQ);
				webAudio.lowEQ.connect(webAudio.midEQ);
				webAudio.midEQ.connect(webAudio.highEQ);
				anonNode = webAudio.highEQ;
			} 
			
			if (session.compressor===1){
			    webAudio.compressor = audioCompressor(anonNode, audioContext);
				anonNode = webAudio.compressor;
			} else if (session.compressor===2){
			    webAudio.compressor = audioLimiter(anonNode, audioContext);
				anonNode = webAudio.compressor;
			} 
			
			webAudio.analyser = audioMeter(anonNode, audioContext);
			webAudio.analyser.connect(webAudio.destination);
			
			webAudio.stop = function(){
				try{webAudio.destination.disconnect();}catch(e){}
				try{clearInterval(webAudio.analyser.interval);}catch(e){}
				try{webAudio.analyser.disconnect();}catch(e){}
				try{webAudio.gainNode.disconnect();}catch(e){}
				try{webAudio.compressor.disconnect();}catch(e){}
				try{webAudio.mediaStreamSource.context.close();}catch(e){}
			}
			
			webAudio.mediaStreamSource.onended = function(){
				webAudio.stop();
			};
			
			session.webAudios[webAudio.id] = webAudio;
			
			stream.getTracks().forEach(function(track){
				if (webAudio.id!=track.id){
					log("track added to outboundAudioPipeline out");
					log(track);
					webAudio.destination.stream.addTrack(track, stream);
				}
			});
			
			return webAudio.destination.stream;
		} else {
			return stream; // no audio track
		}
	} catch(e){
		errorlog(e);
		return stream;
	}
}

function changeLowEQ(lowEQ){
	for ( var webAudio in session.webAudios){
		if (!session.webAudios[webAudio].lowEQ){errorlog("EQ not setup");return;}
		session.webAudios[webAudio].lowEQ.gain.setValueAtTime(lowEQ, session.webAudios[webAudio].audioContext.currentTime);
	}
}
function changeMidEQ(midEQ){
	for ( var webAudio in session.webAudios){
		if (!session.webAudios[webAudio].midEQ){errorlog("EQ not setup");return;}
		session.webAudios[webAudio].midEQ.gain.setValueAtTime(midEQ, session.webAudios[webAudio].audioContext.currentTime);
	}
}
function changeHighEQ(highEQ){
	for ( var webAudio in session.webAudios){
		if (!session.webAudios[webAudio].highEQ){errorlog("EQ not setup");return;}
		session.webAudios[webAudio].highEQ.gain.setValueAtTime(highEQ, session.webAudios[webAudio].audioContext.currentTime);
	}
}


function audioGainNode(mediaStreamSource, audioContext){
	var gainNode = audioContext.createGain();
	if (session.audioGain!==false){
		var gain = parseFloat(session.audioGain/100.0) || 0;
	} else {
		var gain = 1.0;
	}
	gainNode.gain.value = gain;
	mediaStreamSource.connect(gainNode);
	return gainNode;
}

function audioMeter(mediaStreamSource, audioContext){
	var analyser = audioContext.createAnalyser();
	mediaStreamSource.connect(analyser);
	analyser.fftSize = 256;
	analyser.smoothingTimeConstant = 0.05;
	
	var bufferLength = analyser.frequencyBinCount;
	var dataArray = new Uint8Array(bufferLength);
	
	
	function draw() {
		analyser.getByteFrequencyData(dataArray);
		var total = 0;
        for (var i = 0; i < dataArray.length; i++){
			total += dataArray[i];
		}
        total = total/100;
		
		if (document.getElementById("meter1")){
			if (total==0){
				getById("meter1").style.width = "1px";
				getById("meter2").style.width = "0px";
			} else if (total<=1){
				getById("meter1").style.width = "1px";
				getById("meter2").style.width = "0px";
			} else if (total<=150){
				getById("meter1").style.width = total+"px";
				getById("meter2").style.width = "0px";
			} else if (total>150){
				if (total>200){total=200;}
				getById("meter1").style.width = "150px";
				getById("meter2").style.width = (total-150)+"px";
			}
		} else if (document.getElementById("mutetoggle")){
			if (total>200){total=200;}
			total = parseInt(total);
			document.getElementById("mutetoggle").style.color = "rgb("+(255-total)+",255,"+(255-total)+")";
		} else {
			clearInterval(analyser.interval);
			warnlog("METERS  NOT FOUND");
			return;
		}
    };
    analyser.interval = setInterval(function(){draw();},100);
	return analyser;
}

function audioCompressor(mediaStreamSource, audioContext){
	var compressor = audioContext.createDynamicsCompressor();
	compressor.threshold.value = -50;
	compressor.knee.value = 40;
	compressor.ratio.value = 12;
	compressor.attack.value = 0;
	compressor.release.value = 0.25;
	mediaStreamSource.connect(compressor);
	return compressor;
}

function audioLimiter(mediaStreamSource, audioContext){
	var compressor = audioContext.createDynamicsCompressor();
	compressor.threshold.value = -5;
	compressor.knee.value = 0;
	compressor.ratio.value = 20.0; // 1 to 20
	compressor.attack.value = 0.001;
	compressor.release.value = 0.1;
	mediaStreamSource.connect(compressor);
	return compressor;
}

function activeSpeaker(){
	
	var changed = false;
	for (var UUID in session.rpcs){
		if(session.rpcs[UUID].stats.Audio_Loudness_average){
			session.rpcs[UUID].stats.Audio_Loudness_average =  parseFloat(session.rpcs[UUID].stats.Audio_Loudness + session.rpcs[UUID].stats.Audio_Loudness_average)/2;
		} else {
			session.rpcs[UUID].stats.Audio_Loudness_average = 1;
		}
		log(session.rpcs[UUID].stats.Audio_Loudness_average);
		
		if (session.rpcs[UUID].stats.Audio_Loudness_average>10){
			if (session.rpcs[UUID].videoElement.style.display!="block"){
				session.rpcs[UUID].videoElement.style.display="block";
				changed=true;
			}
		} else {
			if (session.rpcs[UUID].videoElement){
				if (session.rpcs[UUID].videoElement.style.display!="none"){
					changed=true;
					session.rpcs[UUID].videoElement.style.display="none";
				} 
			} else {
				session.rpcs[UUID].videoElement.style.display="none";
			}
		}
		
	}
	if (changed){
		updateMixer();
	}
}
//setInterval(function(){activeSpeaker()},1000);


function randomizeArray(unshuffled) {
	
	var arr = unshuffled.map((a) => ({sort: Math.random(), value: a})).sort((a, b) => a.sort - b.sort).map((a) => a.value); // shuffle once
	
    for (var i = arr.length - 1; i > 0; i--) {  // shuffle twice
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
    }
	return arr
}

function joinRoom(roomname){
	if (roomname.length){
		roomname = sanitizeRoomName(roomname);
		log("Join room");
		log(roomname);
		session.joinRoom(roomname).then(function(response){  // callback from server; we've joined the room. Just the listing is returned
			
			if (session.joiningRoom === "seedPlz"){ // allow us to seed, now that we have joined the room.
				session.joiningRoom = false; // joined
				session.seedStream();
			} else {
				session.joiningRoom = false;  // no seeding callback
			}

			log("Members in Room");
			log(response);
			
			if (session.randomize===true){
				response = randomizeArray(response);
				log("Randomized List of Viewers");
				log(response);
				for (var i in response){
					if ("UUID" in response[i]){
						if ("streamID" in response[i]){
							if (response[i].UUID in session.rpcs){
								log("RTC already connected"); /// lets just say instead of Stream, we have 
							} else {
								log(response[i].streamID);
								var streamID = session.desaltStreamID(response[i].streamID);
								log("STREAM ID DESALTED 3: "+streamID);
								setTimeout(function(sid){play(sid);} ,(Math.floor(Math.random()*100)), streamID); // add some furtherchance with up to 100ms added latency							
							}
						}
					}
				}
			} else {
				for (var i in response){
					if ("UUID" in response[i]){
						if ("streamID" in response[i]){
							if (response[i].UUID in session.rpcs){
								log("RTC already connected"); /// lets just say instead of Stream, we have 
							} else {
								log(response[i].streamID);
								var streamID = session.desaltStreamID(response[i].streamID);
								log("STREAM ID DESALTED 3: "+streamID);
								play(streamID);  // play handles the group room mechanics here
							}
						}
					}
				}
			}
		},function(error){return {};});
	} else {
		log("Room name not long enough or contained all bad characaters");
	}	
}

function createRoom(roomname=false){
	
	if (roomname==false){
		roomname = getById("videoname1").value;
		roomname = sanitizeRoomName(roomname);
		if (roomname.length!=0){
			updateURL("director="+roomname, true); // make the link reloadable.
		}
	}
	if (roomname.length==0){
		if (!(session.cleanOutput)){
			alert("Please enter a room name before continuing");
		}
		return;
	}
	log(roomname);
	session.roomid = roomname;
	
	getById("dirroomid").innerHTML =  decodeURIComponent(session.roomid);
	getById("roomid").innerHTML = session.roomid;
	
	var passwordRoom = getById("passwordRoom").value;
	passwordRoom = sanitizePassword(passwordRoom);
	if (passwordRoom.length){
		session.password=passwordRoom;
		session.defaultPassword = false;
		updateURL("password="+session.password);
	}
	
	var passAdd="";
	var passAdd2="";
	
	if ((session.defaultPassword === false) && (session.password)){
			passAdd2="&password="+session.password;
			return session.generateHash(session.password+session.salt,4).then(function(hash){
				passAdd="&hash="+hash;
				createRoomCallback(passAdd, passAdd2);
			});
	} else {
		createRoomCallback(passAdd, passAdd2);
	}
}

function hideDirectorinvites(ele){
	if (getById("directorLinks").style.display=="none"){
		ele.innerHTML='<i class="las la-caret-down"></i><span data-translate="hide-the-links"> LINKS (GUEST INVITES & SCENES)</span>';
		getById("directorLinks").style.display="grid";
		ele.parentNode.style.marginBottom = "0px";
		ele.parentNode.style.paddingBottom = "0px";
	} else {
		ele.innerHTML='<i class="las la-caret-right"></i><span data-translate="hide-the-links"> LINKS (GUEST INVITES & SCENES)</span>'
		getById("directorLinks").style.display="none";
		ele.parentNode.style.marginBottom = "10px";
		ele.parentNode.style.paddingBottom = "10px";
		getById("help_directors_room").style.display="none";
		getById("roomnotes2").style.display="none";
		
	}
	//document.querySelector(".directorContainer.half").style.display="none";
	//document.querySelector(".directorContainer").style.display="none";
}
function createRoomCallback(passAdd, passAdd2){

	var gridlayout = getById("gridlayout");
	gridlayout.classList.add("directorsgrid");

	var broadcastFlag = getById("broadcastFlag");
	try{
		if (broadcastFlag.checked){
			broadcastFlag=true;
		} else {
			broadcastFlag=false;
		}
	} catch (e){broadcastFlag=false;}
	
	var broadcastString = "";
	if (broadcastFlag){
		broadcastString = "&broadcast";
		getById("broadcastSlider").checked=true;
	}

	var codecGroupFlag = getById("codecGroupFlag");
	
	if (codecGroupFlag.value){
		if (codecGroupFlag.value==="vp9"){
			codecGroupFlag = "&codec=vp9";
		} else if (codecGroupFlag.value==="h264"){
			codecGroupFlag = "&codec=h264";
		} else if (codecGroupFlag.value==="vp8"){
			codecGroupFlag = "&codec=vp8";
		} else{
			codecGroupFlag = "";
		}
	} else {
		codecGroupFlag = "";
	}
	if (codecGroupFlag){
		session.codecGroupFlag = codecGroupFlag;
	}
	
	formSubmitting = false;


	var m = getById("mainmenu");
	m.remove();

	getById("head1").className = 'advanced';
	getById("head2").className = 'advanced';
	getById("head3").className = 'advanced';
	getById("head4").className = '';

	try{
		if (session.label===false){
			if (document.title==""){
				document.title = "Control Room";
			} else {
				document.title += " - Control Room";
			}
		}
	} catch(e){errorlog(e);};
	
	
	session.director = true;
	getById("reshare").parentNode.removeChild(getById("reshare"));
	
	
	//getById("mutespeakerbutton").style.display = null;
	session.speakerMuted = true; // the director will start with audio playback muted.
	toggleSpeakerMute(true);
	
	
	if (session.cleanDirector==false){
		
		getById("roomHeader").style.display = "";
		getById("directorLinks").style.display = "";
		
		getById("director_block_1").dataset.raw = "https://"+location.host+location.pathname+"?room="+session.roomid+broadcastString+passAdd;
		getById("director_block_1").href= "https://"+location.host+location.pathname+"?room="+session.roomid+broadcastString+passAdd;
		getById("director_block_1").innerText= "https://"+location.host+location.pathname+"?room="+session.roomid+broadcastString+passAdd;
		
		getById("director_block_2").dataset.raw = "https://"+location.host+location.pathname+"?room="+session.roomid+passAdd+"&view";
		getById("director_block_2").href= "https://"+location.host+location.pathname+"?room="+session.roomid+passAdd+"&view";
		getById("director_block_2").innerText= "https://"+location.host+location.pathname+"?room="+session.roomid+passAdd+"&view";
		
		getById("director_block_3").dataset.raw = "https://"+location.host+location.pathname+"?scene=1&room="+session.roomid+codecGroupFlag+passAdd2;
		getById("director_block_3").href= "https://"+location.host+location.pathname+"?scene=1&room="+session.roomid+codecGroupFlag+passAdd2;
		getById("director_block_3").innerText= "https://"+location.host+location.pathname+"?scene=1&room="+session.roomid+codecGroupFlag+passAdd2;
		
		getById("director_block_4").dataset.raw = "https://"+location.host+location.pathname+"?scene=0&room="+session.roomid+codecGroupFlag+passAdd2;
		getById("director_block_4").href= "https://"+location.host+location.pathname+"?scene=0&room="+session.roomid+codecGroupFlag+passAdd2;
		getById("director_block_4").innerText= "https://"+location.host+location.pathname+"?scene=0&room="+session.roomid+codecGroupFlag+passAdd2;
		
	} else {
		getById("guestFeeds").innerHTML = '';
	}
	getById("guestFeeds").style.display = "";
	
	if (!(session.cleanOutput)){
		getById("chatbutton").classList.remove("advanced");
		getById("controlButtons").style.display = "inherit";
		getById("mutespeakerbutton").classList.remove("advanced");
		getById("controlButtons").innerHTML += '<span id="miniPerformer" style="pointer-events: auto;"><button id="press2talk" style="margin-left:5px;height:45px;background-color:#6666;border-radius: 38px;" class="grey" onclick="press2talk(true);" title="You can also enable the director`s Video Output afterwards by clicking the Setting`s button"><i class="las la-headset"></i><span data-translate="push-to-talk-enable"> enable director`s microphone (or video)</span></button></span>';
	} else {
		getById("miniPerformer").style.display = "none";
		getById("controlButtons").style.display = "none";
	}
	
	joinRoom(session.roomid);

}
function requestAudioSettings(ele){
	var UUID = ele.dataset.UUID;
	if (ele.dataset.active=="true"){
		ele.dataset.active="false";
		ele.classList.remove("pressed");
		getById("advanced_audio_director_"+UUID).innerHTML = "";
		getById("advanced_audio_director_"+UUID).className = "advanced";
	} else {
		ele.dataset.active="true";
		ele.classList.add("pressed");
		getById("advanced_audio_director_"+UUID).innerHTML = "";
		var actionMsg = {}; 
		actionMsg.getAudioSettings = true;
		session.sendRequest(actionMsg, UUID);
	}
}
function requestVideoSettings(ele){
	var UUID = ele.dataset.UUID;
	if (ele.dataset.active=="true"){
		ele.dataset.active="false";
		ele.classList.remove("pressed");
		getById("advanced_video_director_"+UUID).innerHTML = "";
		getById("advanced_video_director_"+UUID).className = "advanced";
	} else {
		ele.dataset.active="true";
		ele.classList.add("pressed");
		getById("advanced_video_director_"+UUID).innerHTML = "";
		var actionMsg = {}; 
		actionMsg.getVideoSettings = true;
		session.sendRequest(actionMsg, UUID);
	}
}
function createControlBox(UUID, soloLink, streamID){
	if (document.getElementById("deleteme")){
		getById("deleteme").parentNode.removeChild(getById("deleteme"));
	}
	var controls = getById("controls_blank").cloneNode(true);
	
	var container = document.createElement("div");	
	container.id = "container_"+UUID; // needed to delete on user disconnect
	container.className = "vidcon";
	container.style.margin="15px 20px 0 0 ";
	
	controls.style.display = "block";
	controls.id = "controls_"+UUID;
	getById("guestFeeds").appendChild(container); 
	
	var buttons = "<div class='streamID' onmousedown='copyFunction(this.firstElementChild.innerText)' onclick='popupMessage(event);copyFunction(this.firstElementChild.innerText)'>ID:<span style='user-select: none;'> "+streamID+"</span>\
	<i class='las la-copy' title='Copy this Stream ID to the clipboard' style='cursor:pointer'></i>\
	<span id='label_"+UUID+"'></span>\
	</div>";

	if (!session.rpcs[UUID].voiceMeter){
		session.rpcs[UUID].voiceMeter = getById("voiceMeterTemplate").cloneNode(true);
		session.rpcs[UUID].voiceMeter.style.opacity = 0; // temporary
		session.rpcs[UUID].voiceMeter.style.display = "block";
		session.rpcs[UUID].voiceMeter.dataset.level = 0;
	}
	
	session.rpcs[UUID].voiceMeter.style.top = "1vh";
	session.rpcs[UUID].voiceMeter.style.right = "1vh";
	
	var videoContainer = document.createElement("div");	
	videoContainer.id = "videoContainer_"+UUID; // needed to delete on user disconnect
	videoContainer.style.margin="0";
	videoContainer.style.position = "relative";
	
	controls.innerHTML += "<div style='margin:10px;' id='advanced_audio_director_"+UUID+"' class='advanced'></div>";
	controls.innerHTML += "<div style='margin:10px;' id='advanced_video_director_"+UUID+"' class='advanced'></div>";
	
	var handsID = "hands_"+UUID;

	controls.innerHTML += "<div>\
		<div style='padding:5px;word-wrap: break-word; overflow:hidden; white-space: nowrap; overflow: hidden; font-size:0.7em; text-overflow: ellipsis;' title='A direct solo view of the video/audio stream with nothing else. Its audio can be remotely controlled from here'> \
		<a class='soloLink' data-drag='1' draggable='true' onmousedown='copyFunction(this)' onclick='popupMessage(event);copyFunction(this)' \
		value='"+soloLink+"' href='"+soloLink+"'/>"+soloLink+"</a>\
		<button class='pull-right' style='width:100%;' onmousedown='copyFunction(this.previousElementSibling)' onclick='popupMessage(event);copyFunction(this.previousElementSibling)'><i class='las la-user'></i> copy Solo link</button>\
		</div>\
		<button data-action-type=\"hand-raised\" id='"+handsID+"' style='margin: auto;margin-bottom:10px;display:none;background-color:yellow;' data-value='0' title=\"This guest raised their hand. Click this to clear notification.\" onclick=\"remoteLowerhands('"+UUID+"');this.style.display='none';\">\
			<i class=\"las la-hand-paper\"></i>\
			<span data-translate=\"user-raised-hand\">Guest Raised Hand</span>\
		</button>\
		</div>";
		
	controls.querySelectorAll('[data-action-type]').forEach((ele)=>{  // give action buttons some self-reference
		ele.dataset.UUID = UUID;
	});
	
	container.innerHTML = buttons;
	container.appendChild(videoContainer);
	videoContainer.appendChild(session.rpcs[UUID].voiceMeter);
	container.appendChild(controls);
}

function createDirectorCam(vid, clean){
	vid.style.width="80px";
	vid.style.height="35px";
	vid.style.padding ="0";
	vid.title = "This is the mini-preview of the Director's audio and video output";
	if (clean==false){
		getById("press2talk").innerHTML = "<span data-translate='Push-to-Mute'>🔴 Push to Mute</span>";
		getById("press2talk").outerHTML += '<button class="grey" style="margin: 10px 15px;" title="Change the Audio or Video device here" onclick="toggleSettings()"><i class="las la-cog"></i></button>';
	} else {
		getById("press2talk").innerHTML = "";
		getById("press2talk").outerHTML = "";
	}
	getById("miniPerformer").appendChild(vid);
	getById("press2talk").dataset.enabled="true";
	session.muted=false;
	toggleMute(true);
	updateURL("push="+session.streamID);
}

function press2talk(clean=false){
	var ele = getById("press2talk");
	ele.style.minWidth="127px";
	ele.style.padding="7px";
	getById("settingsbutton").classList.remove("advanced");
	if (!session.directorEnabledPPT){
		if (clean==true){
			ele.innerHTML="";
		} else {
			ele.innerHTML = "<span data-translate='Push-to-Mute'>🔴 Push to Mute</span>";
		}
		session.publishDirector(clean);
		session.muted=false;
		toggleMute(true);
		return;
	}
	toggleMute();
}


function toggle(ele, tog=false, inline=true) {
  var x = ele;
  if (x.style.display === "none") {
	if(inline){
		x.style.display = "inline-block";
	} else {
		x.style.display = "block";
	}
  } else {
    x.style.display = "none";
  }
  if (tog){
	  if (tog.dataset.saved){
		  tog.innerHTML= tog.dataset.saved;
		  delete(tog.dataset.saved);
	  } else {
		  tog.dataset.saved = tog.innerHTML;
		  tog.innerHTML = "Hide This";
	  }
  }
}


var SelectedAudioOutputDevices = []; // order matters.
var SelectedAudioInputDevices = []; // ..
var SelectedVideoInputDevices = []; // ..

function enumerateDevices() {
	
	log("enumerated start");
	
	if (typeof navigator.enumerateDevices === "function") {
		log("enumerated failed 1");
		return navigator.enumerateDevices();
	} else if (typeof navigator.mediaDevices === "object" && typeof navigator.mediaDevices.enumerateDevices === "function") {
		return navigator.mediaDevices.enumerateDevices();
	} else {
		return new Promise((resolve, reject) => {
			try {
				if (window.MediaStreamTrack == null || window.MediaStreamTrack.getSources == null) {
					throw new Error();
				}
				window.MediaStreamTrack.getSources((devices) => {
					resolve(devices
						.filter(device => {
							return device.kind.toLowerCase() === "video" || device.kind.toLowerCase() === "videoinput";
						})
						.map(device => {
							return {
								deviceId: device.deviceId != null ? device.deviceId : "",
								groupId: device.groupId,
								kind: "videoinput",
								label: device.label,
								toJSON: /* istanbul ignore next */ function () {
									return this;
								}
							};
						}));
				});
			}
			catch (e) {
				errorlog(e);
			}
		});
	}
}

function requestOutputAudioStream(){
	try {
		//warnlog("GET USER MEDIA");
		return navigator.mediaDevices.getUserMedia({audio:true, video:false }).then(function(stream1){ // Apple needs thi to happen before I can access EnumerateDevices. 
			log("get media sources; request audio stream");
			  return enumerateDevices().then(function(deviceInfos){
					stream1.getTracks().forEach(function(track) { // We don't want to keep it without audio; so we are going to try to add audio now.
						track.stop(); // I need to do this after the enumeration step, else it breaks firefox's labels
					});
					const audioOutputSelect = document.querySelector('#outputSourceScreenshare');
					audioOutputSelect.remove(0);
					audioOutputSelect.removeAttribute("onclick");
					
					for (let i = 0; i !== deviceInfos.length; ++i) {
							const deviceInfo = deviceInfos[i];
							if (deviceInfo==null){continue;}
							const option = document.createElement('option');
							option.value = deviceInfo.deviceId;
							if (deviceInfo.kind === 'audiooutput') {
								const option = document.createElement('option');
								if (audioOutputSelect.length===0){
									option.dataset.default = true;
								} else {
									option.dataset.default = false;
								}
								option.value = deviceInfo.deviceId || "default";
								if (option.value == session.sink){
									option.selected = true;
								}
								option.text = deviceInfo.label || `Speaker ${audioOutputSelect.length + 1}`;
								audioOutputSelect.appendChild(option);
							} else {
								log('Some other kind of source/device: ', deviceInfo);
							}
					}
			  });
	  });
   } catch (e){
	   if (!(session.cleanOutput)){
		   if (window.isSecureContext) {
				alert("An error has occured when trying to access the default audio device. The reason is not known.");
		   } else if ((iOS) || (iPad)){
				alert("iOS version 13.4 and up is generally recommended; older than iOS 11 is not supported.");
		   } else {
				alert("Error acessing the default audio device.\n\nThe website may be loaded in an insecure context.\n\nPlease see: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia");
		   }
	   }
   }
}


function requestAudioStream(){
	try {
		//warnlog("GET USER MEDIA");
		return navigator.mediaDevices.getUserMedia({audio:true, video:false }).then(function(stream1){ // Apple needs thi to happen before I can access EnumerateDevices. 
			log("get media sources; request audio stream");
			  return enumerateDevices().then(function(deviceInfos){
					stream1.getTracks().forEach(function(track) { // We don't want to keep it without audio; so we are going to try to add audio now.
						track.stop(); // I need to do this after the enumeration step, else it breaks firefox's labels
					});
					log("updating audio");
					const audioInputSelect = document.querySelector('select#audioSourceScreenshare');
					audioInputSelect.remove(1);
					audioInputSelect.removeAttribute("onchange");
									
					
					for (let i = 0; i !== deviceInfos.length; ++i) {
							const deviceInfo = deviceInfos[i];
							if (deviceInfo==null){continue;}
							const option = document.createElement('option');
							option.value = deviceInfo.deviceId;
							if (deviceInfo.kind === 'audioinput') {
								option.text = deviceInfo.label || `Microphone ${audioInputSelect.length + 1}`;
								audioInputSelect.appendChild(option);
							} else {
								log('Some other kind of source/device: ', deviceInfo);
							}
					}
					audioInputSelect.style.minHeight = ((audioInputSelect.childElementCount + 1)*1.15 * 16) + 'px';
					audioInputSelect.style.minWidth = "342px";
			  });
	  });
   } catch (e){
	   if (!(session.cleanOutput)){
		   if (window.isSecureContext) {
				alert("An error has occured when trying to access the default audio device. The reason is not known.");
		   } else if ((iOS) || (iPad)){
				alert("iOS version 13.4 and up is generally recommended; older than iOS 11 is not supported.");
		   } else {
				alert("Error acessing the default audio device.\n\nThe website may be loaded in an insecure context.\n\nPlease see: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia");
		   }
	   }
   }
}


function gotDevices(deviceInfos) { // https://github.com/webrtc/samples/blob/gh-pages/src/content/devices/input-output/js/main.js#L19

	log("got devices!");
	log(deviceInfos);
	try{
		const audioInputSelect = document.querySelector('#audioSource');
		
		audioInputSelect.innerHTML = "";

		var option = document.createElement('input');
		option.type="checkbox";
		option.value = "ZZZ";
		option.name = "multiselect1";
		option.id = "multiselect1";
		option.style.display = "none";
		option.checked = true;
		
		
		var label = document.createElement('label');
		label.for = option.name;
		label.innerHTML = '<span data-translate="no-audio">No Audio</span>';
		
		var listele = document.createElement('li');
		listele.appendChild(option);
		listele.appendChild(label);
		audioInputSelect.appendChild(listele);
		
		
		option.onchange = function(event){  // make sure to clear 'no audio option' if anything else is selected
			if (!(getById("multiselect1").checked)){
				getById("multiselect1").checked= true;
				SelectedAudioInputDevices.push(event.currentTarget.value);
				log("CHECKED 1");
			} else {
				$(this).parent().parent().find('input[type="checkbox"]').not('#multiselect1').prop('checked', false); // EVIL, but validated.
				var index = SelectedAudioInputDevices.indexOf(event.currentTarget.value);
				if (index > -1) {
					SelectedAudioInputDevices.splice(index,1);
				}
			}
			errorlog(SelectedAudioInputDevices);
		};
		
		getById('multiselect-trigger').dataset.state = '0';
		getById('multiselect-trigger').classList.add('closed');
		getById('multiselect-trigger').classList.remove('open'); 
		getById('chevarrow1').classList.add('bottom');
		
		const videoSelect = document.querySelector('select#videoSourceSelect');
		const audioOutputSelect = document.querySelector('#outputSource');
		const selectors = [ videoSelect];

		const values = selectors.map(select => select.value);
		selectors.forEach(select => {
			while (select.firstChild) {
				select.removeChild(select.firstChild);
			}
		});
		
		
		function comp(a, b) {
			if (a.kind === 'audioinput'){return 0;}
			else if (a.kind === 'audiooutput'){return 0;}
			const labelA = a.label.toUpperCase();
			const labelB = b.label.toUpperCase();
			if (labelA > labelB) { return 1;} 
			else if (labelA < labelB) {	return -1;	}
			return 0;
		}
		//deviceInfos.sort(comp); // I like this idea, but it messes with the defaults.  I just don't know what it will do.
		
		// This is to hide NDI from default device. NDI Tools fucks up.
		var tmp = [];
		for (let i = 0; i !== deviceInfos.length; ++i) {
			deviceInfo = deviceInfos[i];
			if (!((deviceInfo.kind === 'videoinput')  &&  (deviceInfo.label.toLowerCase().startsWith("ndi") || deviceInfo.label.toLowerCase().startsWith("newtek")))){
				tmp.push(deviceInfo);
			}
		}
		
		for (let i = 0; i !== deviceInfos.length; ++i) {
			deviceInfo = deviceInfos[i];
			if ((deviceInfo.kind === 'videoinput')  &&  (deviceInfo.label.toLowerCase().startsWith("ndi") || deviceInfo.label.toLowerCase().startsWith("newtek"))){
				tmp.push(deviceInfo);
				log("V DEVICE FOUND = "+deviceInfo.label.replace(/[\W]+/g,"_").toLowerCase());
			}
		}
		deviceInfos = tmp;
		log(deviceInfos);
		
		if ((session.audioDevice) && (session.audioDevice!==1)){  // this sorts according to users's manual selection
			var tmp = [];
			for (let i = 0; i !== deviceInfos.length; ++i) {
				deviceInfo = deviceInfos[i];
				if ((deviceInfo.kind === 'audioinput')  &&  (deviceInfo.label.replace(/[\W]+/g,"_").toLowerCase().includes(session.audioDevice))){
					tmp.push(deviceInfo);
					log("A DEVICE FOUND = "+deviceInfo.label.replace(/[\W]+/g,"_").toLowerCase());
				}
			}
			for (let i = 0; i !== deviceInfos.length; ++i) {
				deviceInfo = deviceInfos[i];
				if (!((deviceInfo.kind === 'audioinput')  &&  (deviceInfo.label.replace(/[\W]+/g,"_").toLowerCase().includes(session.audioDevice)))){
					tmp.push(deviceInfo);
				}
			}
			
			deviceInfos = tmp;
			log(session.audioDevice);
			log(deviceInfos);
		}
		
		
		if ((session.videoDevice) && (session.videoDevice!==1)){  // this sorts according to users's manual selection
			var tmp = [];
			for (let i = 0; i !== deviceInfos.length; ++i) {
				deviceInfo = deviceInfos[i];
				if ((deviceInfo.kind === 'videoinput')  &&  (deviceInfo.label.replace(/[\W]+/g,"_").toLowerCase().includes(session.videoDevice))){
					tmp.push(deviceInfo);
					log("V DEVICE FOUND = "+deviceInfo.label.replace(/[\W]+/g,"_").toLowerCase());
				}
			}
			for (let i = 0; i !== deviceInfos.length; ++i) {
				deviceInfo = deviceInfos[i];
				if (!((deviceInfo.kind === 'videoinput')  &&  (deviceInfo.label.replace(/[\W]+/g,"_").toLowerCase().includes(session.videoDevice)))){
					tmp.push(deviceInfo);
				}
			}
			deviceInfos = tmp;
			log("VDECICE:"+session.videoDevice);
			log(deviceInfos);
		}
		
		
		var counter = 1;
		for (let i = 0; i !== deviceInfos.length; ++i) {
			const deviceInfo = deviceInfos[i];
			if (deviceInfo==null){continue;}
			
			if (deviceInfo.kind === 'audioinput') {
				option = document.createElement('input');
				option.type="checkbox";
				counter++;
				listele = document.createElement('li');
				if (counter==2){
					option.checked=true;
					listele.style.display="block";
					option.style.display="none";
					getById("multiselect1").checked = false;
					getById("multiselect1").parentNode.style.display="none";
				} else {
					listele.style.display="none";
				}
				
				
				option.value = deviceInfo.deviceId || "default";
				option.name = "multiselect"+counter;
				option.id = "multiselect"+counter;
				label = document.createElement('label');
				label.for = option.name;
				
				label.innerHTML = " " + (deviceInfo.label || ("microphone "+ ((audioInputSelect.length || 0)+1)));
				
				listele.appendChild(option);
				listele.appendChild(label);
				audioInputSelect.appendChild(listele);
				
				option.onchange = function(event){  // make sure to clear 'no audio option' if anything else is selected
					getById("multiselect1").checked = false;
					log("UNCHECKED");
					if (!(CtrlPressed)){ 
						document.querySelectorAll("#audioSource input[type='checkbox']").forEach(function(item) {
						  if (event.currentTarget.id !== item.id){
								item.checked = false;
								var index = SelectedAudioInputDevices.indexOf(item.value);
								if (index > -1) {
									SelectedAudioInputDevices.splice(index,1);
								}
						  } else {
							    item.checked = true;
							    SelectedAudioInputDevices.push(event.currentTarget.value);
						  }
						});
					}
					errorlog(SelectedAudioInputDevices);
				};
		
			} else if (deviceInfo.kind === 'videoinput') {
				option = document.createElement('option');
				option.value = deviceInfo.deviceId || "default";
				option.text = deviceInfo.label || `camera ${videoSelect.length + 1}`;
				videoSelect.appendChild(option);
			} else if (deviceInfo.kind === 'audiooutput'){
				option = document.createElement('option');
				if (audioOutputSelect.length===0){
					option.dataset.default = true;
				} else {
					option.dataset.default = false;
				}
				option.value = deviceInfo.deviceId || "default";
				if (option.value == session.sink){
					option.selected = true;
				} 
				option.text = deviceInfo.label || `Speaker ${audioOutputSelect.length + 1}`;
				audioOutputSelect.appendChild(option);
			} else {
				log('Some other kind of source/device: ', deviceInfo);
			}
		}
		
		if (audioOutputSelect.childNodes.length==0){
			option = document.createElement('option');
			option.value = "default";
			option.text = "System Default";
			audioOutputSelect.appendChild(option);
		}
		
		
		option = document.createElement('option');
		option.text = "Disable Video";
		option.value = "ZZZ";
		videoSelect.appendChild(option); // NO AUDIO OPTION
		
		selectors.forEach((select, selectorIndex) => {
			if (Array.prototype.slice.call(select.childNodes).some(n => n.value === values[selectorIndex])) {
				select.value = values[selectorIndex];
			}
		});
		
	} catch (e){
		errorlog(e);
	}
}


if (location.protocol !== 'https:') {
	if (!(session.cleanOutput)){
		alert("SSL (https) is not enabled. This site will not work without it!");
	}
}


function getUserMediaVideoParams(resolutionFallbackLevel, isSafariBrowser) {
	switch (resolutionFallbackLevel) {
		case 0:
			if (isSafariBrowser) {
				return {
					width: { min: 360, ideal: 1920, max: 1920 },
					height: { min: 360, ideal: 1080, max: 1080 }
					};
			} else {
				return {
					width: { min: 720, ideal: 1920, max: 1920 },
					height: { min: 720, ideal: 1080, max: 1920 }
				};
			}
		case 1:
			if (isSafariBrowser) {
				return {
					width: { min: 360, ideal: 1280, max: 1280 },
					height: { min: 360, ideal: 720, max: 720 }
					};
			} else {
				return {
					width: { min: 720, ideal: 1280, max: 1280 },
					height: { min: 720, ideal: 720, max: 1280 }
				};
			}
		case 2:
			if (isSafariBrowser) {
				return {
					width: { min: 640 },
					height: { min: 360 }
				};
			} else {
				return {
					width: { min: 240, ideal: 640, max: 1280 },
					height: { min: 240, ideal: 360, max: 1280 }
				};
			}
		case 3:
			if (isSafariBrowser) {
				return {
					width: { min: 360, ideal: 1280, max: 1440 }
				};
			}
			else {
				return {
					width: { min: 360, ideal: 1280, max: 1440 }
				};
			}
		case 4:
			if (isSafariBrowser) {
				return {
					height: { min: 360, ideal: 720, max: 960 }
				};
			}
			else {
				return {
					height: { ideal: 720, max: 960 }
				};
			}
		case 5:
			if (isSafariBrowser) {
				return {
					width: { min: 360, ideal: 640, max: 1440 },
					height: { min: 360, ideal: 360, max: 720 }
				};
			}
			else {
				return {
					width: { ideal:640, max:1920}, 
					height: { ideal: 360, max:1920}}; // same as default, but I didn't want to mess with framerates until I gave it all a try first
			}
		case 6:
			if (isSafariBrowser) {
				return {}; // iphone users probably don't need to wait any longer, so let them just get to it
			}
			else {
				return {
					width: { min: 360, ideal: 640, max: 3840 },
					height: { min: 360, ideal: 360, max: 2160 }
				};
				
			}
		case 7:
			return { // If the camera is recording in low-light, it may have a low framerate. It coudl also be recording at a very high resolution.
				width: { min: 360, ideal: 640 },
				height: { min: 360, ideal: 360 },
			};

		case 8:
			return {
				width: {min:360}, 
				height: {min:360},
				frameRate: 10
				}; // same as default, but I didn't want to mess with framerates until I gave it all a try first
		case 9:
			return {frameRate: 0 };  // Some Samsung Devices report they can only support a framerate of 0.
		case 10:
			return {}
		default:
			return {}; 
	}
}

function addScreenDevices(device){
	if (device.kind=="audio"){
		const audioInputSelect = document.querySelector('#audioSource3');
		const listele = document.createElement('li');
		listele.style.display="block";
		const option = document.createElement('input');
		option.type="checkbox";
		option.checked = true;		
		
		if (getById('multiselect-trigger3').dataset.state==0){
			option.style.display = "none";
		}
		
		option.value = device.id;
		option.name = device.label;
		option.dataset.type = "screen";
		const label = document.createElement('label');
		label.for = option.name;
		label.innerHTML = " "+device.label;
		listele.appendChild(option);
		listele.appendChild(label);
		
		option.onchange = function(event){  // make sure to clear 'no audio option' if anything else is selected
			if (!(CtrlPressed)){ 
				document.querySelectorAll("#audioSource3 input[type='checkbox']").forEach(function(item) {
					log(event.currentTarget);
					log(item);
				  if (event.currentTarget.value !== item.value){ // this shoulnd't happen, but if it does.
					item.checked = false;
					activatedPreview=false;
					grabAudio("videosource","#audioSource3"); // exclude item.id
					
					if (item.dataset.type == "screen"){
						item.parentElement.parentElement.removeChild(item.parentElement);
					}
					
					var index = SelectedAudioInputDevices.indexOf(item.value);
					if (index > -1) {
						SelectedAudioInputDevices.splice(index,1);
					}
					
				  } else {
					SelectedAudioInputDevices.push(event.currentTarget.value);
					
					event.currentTarget.checked = true;
					activatedPreview=false;
					grabAudio("videosource","#audioSource3",item.value); // exclude item.id. 
				  }
				});
			}
			errorlog(SelectedAudioInputDevices);
			event.stopPropagation();
			return false;
		};
		audioInputSelect.appendChild(listele);
		getById("audioSourceNoAudio2").checked=false;
		
	} else if (device.kind=="video"){
		const videoSelect = document.querySelector('select#videoSource3');
		//const selectors = [ videoSelect];
		//const values = selectors.map(select => select.value);
		const option = document.createElement('option');
		option.value = device.label;
		option.text = device.label;
		option.selected = true;
		videoSelect.appendChild(option);
	}
}

function gotDevices2(deviceInfos){
	log("got devices!");
	log(deviceInfos);
	
	getById("multiselect-trigger3").dataset.state="0";
	getById("multiselect-trigger3").classList.add('closed');
	getById("multiselect-trigger3").classList.remove('open');
	getById("chevarrow2").classList.add('bottom');
	
	var knownTrack = false;
	
	try{
		const audioInputSelect = document.querySelector('#audioSource3');
		const videoSelect = document.querySelector('select#videoSource3');
		const audioOutputSelect = document.querySelector('#outputSource3');
		const selectors = [ videoSelect];
							

		[audioInputSelect].forEach(select => {
			while (select.firstChild) {
				select.removeChild(select.firstChild);
			}
		});
		
		const values = selectors.map(select => select.value);
		selectors.forEach(select => {
			while (select.firstChild) {
				select.removeChild(select.firstChild);
			}
		});
		
		[audioOutputSelect].forEach(select => {
			while (select.firstChild) {
				select.removeChild(select.firstChild);
			}
		});
		
		var counter = 0;
		for (let i = 0; i !== deviceInfos.length; ++i){
			const deviceInfo = deviceInfos[i];
			if (deviceInfo==null){continue;}
			
			if (deviceInfo.kind === 'audioinput') {
				const option = document.createElement('input');
				option.type="checkbox";
				counter++;
				const listele = document.createElement('li');
				listele.style.display="none";
				
				try {
					session.streamSrc.getAudioTracks().forEach(function(track){
						log(track);
						if (deviceInfo.label==track.label){
							option.checked = true;
							listele.style.display="inherit";
						} 
					});
				} catch(e){errorlog(e);}
				
				option.style.display = "none"
				option.value = deviceInfo.deviceId || "default";
				option.name = "multiselecta"+counter;
				option.id = "multiselecta"+counter;
				option.dataset.label = deviceInfo.label || ("microphone "+ ((audioInputSelect.length || 0)+1));
				
				const label = document.createElement('label');
				label.for = option.name;
				
				label.innerHTML = " " + (deviceInfo.label || ("microphone "+ ((audioInputSelect.length || 0)+1)));
				
				listele.appendChild(option);
				listele.appendChild(label);
				audioInputSelect.appendChild(listele);
				
				option.onchange = function(event){  // make sure to clear 'no audio option' if anything else is selected
					if (!(CtrlPressed)){
						document.querySelectorAll("#audioSource3 input[type='checkbox']").forEach(function(item) {
							if (event.currentTarget.value !== item.value){
								item.checked = false;
								if (item.dataset.type == "screen"){
									item.parentElement.parentElement.removeChild(item.parentElement);
								} 
								var index = SelectedAudioInputDevices.indexOf(item.value);
								if (index > -1) {
									SelectedAudioInputDevices.splice(index,1);
								}
							} else {
								item.checked = true;
								SelectedAudioInputDevices.push(event.currentTarget.value);
							}
						});
					} else {
						SelectedAudioInputDevices.push(event.currentTarget.value);
						getById("audioSourceNoAudio2").checked=false;
					}
					errorlog(SelectedAudioInputDevices);
				};
		
			} else if (deviceInfo.kind === 'videoinput'){
				const option = document.createElement('option');
				option.value = deviceInfo.deviceId || "default";
				option.text = deviceInfo.label || `camera ${videoSelect.length + 1}`;
				try {
					session.streamSrc.getVideoTracks().forEach(function(track){
						if (option.text==track.label){
							option.selected = true;
							knownTrack=true;
						}
					});
				} catch(e){errorlog(e);}
				videoSelect.appendChild(option);
				
			} else if (deviceInfo.kind === 'audiooutput'){
				const option = document.createElement('option');
				if (audioOutputSelect.length===0){
					option.dataset.default = true;
				} else {
					option.dataset.default = false;
				}
				option.value = deviceInfo.deviceId || "default";
				if (option.value == session.sink){
					option.selected = true;
				}
				option.text = deviceInfo.label || `Speaker ${outputSelect.length + 1}`;
				audioOutputSelect.appendChild(option);
				
			} else {
				log('Some other kind of source/device: ', deviceInfo);
			}
		}
		
		if (audioOutputSelect.childNodes.length==0){
			const option = document.createElement('option');
			option.value = "default";
			option.text = "System Default";
			audioOutputSelect.appendChild(option);
		}
		
		////////////
		
		session.streamSrc.getAudioTracks().forEach(function(track){ // add active ScreenShare audio tracks to the list
			log("Checking for screenshare audio");
			log(track);
			var matched=false;
			for (var i = 0; i !== deviceInfos.length; ++i){
				var deviceInfo = deviceInfos[i];
				if (deviceInfo==null){continue;}
				log("---");
				if (track.label == deviceInfo.label){
					matched=true;
					continue;
				}
			}
			if (matched==false){ // Not a gUM device
			
				var listele = document.createElement('li');
				listele.style.display="block";
				var option = document.createElement('input');
				option.type="checkbox";
				option.value = track.id;
				option.checked = true;
				option.style.display = "none";
				option.name = track.label;
				option.dataset.type="screen";
				const label = document.createElement('label');
				label.for = option.name;
				label.innerHTML = " "+track.label;
				listele.appendChild(option);
				listele.appendChild(label);
				option.onchange = function(event){  // make sure to clear 'no audio option' if anything else is selected
					if (!(CtrlPressed)){
						document.querySelectorAll("#audioSource3 input[type='checkbox']").forEach(function(item) {
						  if (event.currentTarget.value !== item.value){ // this shoulnd't happen, but if it does.
							item.checked = false;
							activatedPreview=false;
							if (item.dataset.type == "screen"){
								item.parentElement.parentElement.removeChild(item.parentElement);
							}
							grabAudio("videosource","#audioSource3"); // exclude item.id
						  } else {
							  
							event.currentTarget.checked = true;
							activatedPreview=false;
							grabAudio("videosource","#audioSource3",item.value); // exclude item.id. 
						  }
						});
					} else {
						getById("audioSourceNoAudio2").checked=false;
					}
					errorlog(SelectedAudioInputDevices);
					event.stopPropagation();
					return false;
				};
				audioInputSelect.appendChild(listele);
			}
		});
		/////////// no video option
		
		option = document.createElement('option'); // no video
		option.text = "Disable Video";
		option.value = "ZZZ";
		videoSelect.appendChild(option); 
		if (session.streamSrc.getVideoTracks().length==0){
			option.selected = true;
		} else if (knownTrack==false){
			option = document.createElement('option'); // no video
			option.text = session.streamSrc.getVideoTracks()[0].label;
			option.value = "YYY";
			videoSelect.appendChild(option); 
			option.selected = true;
			
		}
		
		
		
		/////////////  /// NO AUDIO appended option
		
		var option = document.createElement('input');  
		option.type="checkbox";
		option.value = "ZZZ";
		option.style.display = "none"
		option.id = "audioSourceNoAudio2";
		
		var label = document.createElement('label');
		label.for = option.name;
		label.innerHTML = " No Audio";
		var listele = document.createElement('li');
		
		if (session.streamSrc.getAudioTracks().length==0){
			option.checked = true;
		} else {
			listele.style.display="none";
			option.checked = false;
		}	
		option.onchange = function(event){  // make sure to clear 'no audio option' if anything else is selected
			log("Audio OPTION HAS CHANGED?");
			if (!(CtrlPressed)){
				document.querySelectorAll("#audioSource3 input[type='checkbox']").forEach(function(item) {
					if (event.currentTarget.value !== item.value){
						item.checked = false;
						if (item.dataset.type == "screen"){
							item.parentElement.parentElement.removeChild(item.parentElement);
						}
						var index = SelectedAudioInputDevices.indexOf(item.value);
						if (index > -1) {
							SelectedAudioInputDevices.splice(index,1);
						}
					} else {
						item.checked = true;
						SelectedAudioInputDevices.push(event.currentTarget.value);
					}
					errorlog(SelectedAudioInputDevices);
				});
			} else {
				document.querySelectorAll("#audioSource3 input[type='checkbox']").forEach(function(item) {
					if (event.currentTarget.value === item.value){
						event.currentTarget.checked = true;
						SelectedAudioInputDevices.push(event.currentTarget.value);
					} else {
						item.checked = false;
						if (item.dataset.type == "screen"){
							item.parentElement.parentElement.removeChild(item.parentElement);
						}
						var index = SelectedAudioInputDevices.indexOf(item.value);
						if (index > -1) {
							SelectedAudioInputDevices.splice(index,1);
						}
					}
					errorlog(SelectedAudioInputDevices);
				});
			}
		}; 
		listele.appendChild(option);
		listele.appendChild(label);
		audioInputSelect.appendChild(listele);
		
		////////////
		
		
		selectors.forEach((select, selectorIndex) => {
			if (Array.prototype.slice.call(select.childNodes).some(n => n.value === values[selectorIndex])) {
				select.value = values[selectorIndex];
			}
		});
		
		audioInputSelect.onchange = function(){
			log("Audio OPTION HAS CHANGED? 2");
			activatedPreview=false;
			grabAudio("videosource","#audioSource3");
		};
		videoSelect.onchange = function(event){
			log("video source changed");
			activatedPreview=false;
			grabVideo(session.quality, "videosource", "select#videoSource3");
			enumerateDevices().then(gotDevices2).then(function(){ScreeShareState=false;});
		};
		getById("refreshVideoButton").onclick = function(){
			if (ScreeShareState){log("can't refresh a screenshare");return;}
			log("video source changed");
			activatedPreview=false;
			grabVideo(session.quality, "videosource", "select#videoSource3");
		};
		
		audioOutputSelect.onchange = function(){
			
			if ((iOS) || (iPad)){
				return;
			}
			
			var outputSelect = document.querySelector('select#outputSource3');
			session.sink = outputSelect.options[outputSelect.selectedIndex].value;
			//if (session.sink=="default"){session.sink=false;} else {
			getById("videosource").setSinkId(session.sink).then(() => {
				log("New Output Device:"+session.sink);
			}).catch(error => {
				errorlog(error);
			});
			for (UUID in session.rpcs){
				session.rpcs[UUID].videoElement.setSinkId(session.sink).then(() => {
					log("New Output Device for: "+UUID);
				}).catch(error => {
					errorlog(error);
				});
			}
		}
		
	} catch (e){
		errorlog(e);
	}
}

function playtone(screen=false){
	
	if ((iOS) || (iPad)){
	//	try{
	//		session.audioContext.resume();
	//	} catch(e){errorlog(e);}
		var testtone = document.getElementById("testtone");
		if (testtone){
			testtone.play();
		}
		return;
	}
	
	if (screen){
		var outputSelect = document.querySelector('select#outputSourceScreenshare');
		session.sink = outputSelect.options[outputSelect.selectedIndex].value;
	}
	
	var testtone = document.getElementById("testtone");
	if (testtone){
		if (session.sink){
			testtone.setSinkId(session.sink).then(() => {  // TODO: iOS doens't support sink. Needs to bypass if IOS
				log("changing audio sink:"+session.sink);
				testtone.play();
			}).catch(error => {
				errolog("couldn't set sink");
				errorlog(error);
			});
		} else {
			testtone.play();
		}
	}
}

async function getAudioOnly(selector, trackid=null, override=false){
	var audioSelect = document.querySelector(selector).querySelectorAll("input"); 
	var audioList = [];
	var streams = [];
	log("getAudioOnly()");
	log(trackid);
	for (var i=0; i<audioSelect.length;i++){
		if (audioSelect[i].value=="ZZZ"){
			log("ZZZ as Audio");
			continue;
		} else if (trackid==audioSelect[i].value){ // skip already excluded
			continue;
		} else if ("screen"==audioSelect[i].dataset.type){ // skip already excluded ---------- !!!!!!  DOES THIS MAKE SENSE? TODO: CHECK
			warnlog("We're not going to touch SCREEN AUDIO");
			continue;
		} else if (audioSelect[i].checked){
			log(audioSelect[i]);
			audioList.push(audioSelect[i]);
		}
	}
	log(audioList);
	for (var i=0; i<audioList.length;i++){
		
		if ((audioList[i].value=="default") && (session.echoCancellation!==false) && (session.autoGainControl!==false) && (session.noiseSuppression!==false)){
			var constraint = {audio: true};
		} else { // Just trying to avoid problems with some systems that don't support these features
			var constraint = {audio: {deviceId: {exact: audioList[i].value}}};
			if (session.echoCancellation===false){
				constraint.audio.echoCancellation=false;
			} 
			if (session.autoGainControl===false){
				constraint.audio.autoGainControl=false;
			}
			if (session.noiseSuppression===false){
				constraint.audio.noiseSuppression=false;
			}
		}
		constraint.video = false;
		log(constraint);
		if (override!==false){
			constraint = override;
		}
		
		var stream = await navigator.mediaDevices.getUserMedia(constraint).then(function (stream2){
			log("pushing stream2");
			return stream2;
		}).catch(function(err){
			errorlog(err);
			if (!(session.cleanOutput)){
				if (override!==false){
					if (err.name){
						if (err.constraint){
							alert(err['name']+": "+err['constraint']);
						}
					}
				}
			}
		}); // More error reporting maybe?
		if (stream){
			streams.push(stream);
		}
	} 
	
	return streams;
}

function applyMirror(mirror, eleName='previewWebcam'){  // true unmirrors as its already mirrored
	
	var transFlip = "";
	var transNorm = "";
	if ((eleName=='videosource') && (session.windowed)){
		 transFlip = " translate(0, 50%)";
		 transNorm = " translate(0, -50%)";
	}
	
	if (session.mirrored==2){
		mirror=true;
	} else if (session.mirrored===0){
		mirror=true;
	}
	
	
	if (mirror){ 
		if (session.mirrored && session.flipped){
			 getById(eleName).style.transform = " scaleX(-1) scaleY(-1)"+transFlip;
			 getById(eleName).classList.add("mirrorControl");
		} else if (session.mirrored){
			 getById(eleName).style.transform = "scaleX(-1)"+transNorm;
			 getById(eleName).classList.add("mirrorControl");
		} else if (session.flipped){
			 getById(eleName).style.transform = "scaleY(-1) scaleX(1)"+transFlip;
			 getById(eleName).classList.remove("mirrorControl");
		} else {
			 getById(eleName).style.transform = "scaleX(1)"+transNorm; 
			 getById(eleName).classList.remove("mirrorControl");
		}
	} else {
		if (session.mirrored && session.flipped){
			 getById(eleName).style.transform = " scaleX(1) scaleY(-1)"+transFlip;
			 getById(eleName).classList.remove("mirrorControl");
		} else if (session.mirrored){
			 getById(eleName).style.transform = "scaleX(1)"+transNorm; 
			 getById(eleName).classList.remove("mirrorControl");
		} else if (session.flipped){
			 getById(eleName).style.transform = "scaleY(-1) scaleX(-1)"+transFlip;
			 getById(eleName).classList.add("mirrorControl");
		} else {
			 getById(eleName).style.transform = "scaleX(-1)"+transNorm;
			 getById(eleName).classList.add("mirrorControl");
		}
	}	
}

function cleanupMediaTracks(){
	try{
		if (session.streamSrc){
			session.streamSrc.getTracks().forEach(function(track) {
				track.stop();
				session.streamSrc.removeTrack(track);
				log("stopping old track");
			});
		}
		if (session.videoElement){
			session.videoElement.srcObject.getTracks().forEach(function(track) {
				track.stop();
				session.videoElement.srcObject.removeTrack(track);
				log("stopping old track");
			});
		}
		activatedPreview=false;
	} catch (e){
		errorlog(e);
	}
}

///  Detect system changes; handle change or use for debugging
var lastAudioDevice=null;
var lastVideoDevice=null;
var lastPlaybackDevice=null;

var audioReconnectTimeout = null;
var videoReconnectTimeout = null;
var grabDevicesTimeout = null;
var playbackReconnectTimeout = null;
function reconnectDevices(event){   ///  TODO: Perhaps change this to only if there is a DISCONNECT; rather than ON NEW DEVICE?
	if ((iOS) || (iPad)){
	//	try{
	//		session.audioContext.resume();
	//	} catch(e){errorlog(e);}
		resetupAudioOut();
		return;
	}
	warnlog("A media device has changed");
	
	if (document.getElementById("previewWebcam")){
		var outputSelect =  document.getElementById("outputSource");
		if (!outputSelect){errorlog("resetup audio failed");return;}
	
		session.sink = outputSelect.options[outputSelect.selectedIndex].value;
		getById("previewWebcam").setSinkId(session.sink).then(() => {
		}).catch(error => {
			errorlog("4960");
			errorlog(error);
		});
		return;
	}
	
	
	if (session.streamSrc===null){return;}
	if (document.getElementById("videosource")===null){return;}
	
	try{
		session.streamSrc.getTracks().forEach(function(track){
			
			if (track.readyState == "ended"){
				if (track.kind=="audio"){
					lastAudioDevice = track.label;
				} else if (track.kind=="video"){
					lastVideoDevice = track.label;
				}
				session.streamSrc.removeTrack(track);
				log("remove ended old track");
			}
		});
		
		session.videoElement.srcObject.getTracks().forEach(function(track){
			if (track.readyState == "ended"){
				session.videoElement.srcObject.removeTrack(track);
				log("remove ended old track");
			}
		});
		
	} catch (e){
		errorlog(e);
	}
	
	clearTimeout(audioReconnectTimeout);
	audioReconnectTimeout=null;
	if (lastAudioDevice){
		audioReconnectTimeout = setTimeout(function(){  // only reconnect same audio device.  If reconnected, clear the disconnected flag.
			enumerateDevices().then(gotDevices2).then(function(){
				// TODO: check to see if any audio is connected?
				var streamConnected=false;
				var audioSelect = document.querySelector("#audioSource3").querySelectorAll("input"); 
				for (var i=0; i<audioSelect.length;i++){
					if (audioSelect[i].value == "ZZZ"){ continue;}
					else if (audioSelect[i].checked){
						log("checked");
						streamConnected=true;
						break;
					}
				}
				
				if (!streamConnected){
					for (var i=0; i<audioSelect.length;i++){
						if (audioSelect[i].value == "ZZZ"){ continue;}
						errorlog(lastAudioDevice +  " : " + audioSelect[i].dataset.label);
						if (lastAudioDevice == audioSelect[i].dataset.label){ // if the last disconnected device matches.
							audioSelect[i].checked=true;
							streamConnected=true;
							lastAudioDevice=null;
							warnlog("DISCONNECTED AUDIO DEVICE RECONNECTED");
							//for (var j=0; j<audioSelect.length;j++){
							//	if (audioSelect[j].value == "ZZZ"){audioSelect[j].checked=false;break;}
							//}
							break;
						}
					}
				}
				// see what previous state was.  We don't want to add a track if it's set to no audio.
				// 
			//	if (!streamConnected){ // don't add a new audio track if one already exists.
				//	var audioSelect = document.querySelector("#audioSource3").querySelectorAll("input"); 
			//		audioSelect[0].checked=true;
			//	}
				
				activatedPreview=false;
				grabAudio("videosource","#audioSource3");
				setTimeout(function(){enumerateDevices().then(gotDevices2).then(function(){});},1000);
			});
		},2000);
	}
	
	clearTimeout(videoReconnectTimeout);  // only reconnect same video device.
	videoReconnectTimeout=null;
	if (lastVideoDevice){
		videoReconnectTimeout = setTimeout(function(){
			enumerateDevices().then(gotDevices2).then(function(){
				var streamConnected=false;
				var videoSelect = getById("videoSource3");
				errorlog(videoSelect.value);
				
				if (videoSelect.value == "ZZZ"){
					//errorlog(videoSelect.options)
					for (var i =0;i<videoSelect.options.length;i++){
						try{
							if (videoSelect.options[i].innerHTML == lastVideoDevice){
								videoSelect.options[i].selected = true;
								streamConnected=true;
								lastVideoDevice=null;
								break;
							}
						} catch(e){errorlog(e);}
					}
				}
				
				if (streamConnected){
					//videoSelect.options[0].selected = true;
					activatedPreview=false;
					grabVideo(session.quality, "videosource", "select#videoSource3");
					setTimeout(function(){enumerateDevices().then(gotDevices2).then(function(){});},1000);
				}
				
			});
		},2000);
	}
	
//	clearTimeout(grabDevicesTimeout);  // I just don't want to have this fired more than once, if multiple devices get plugged in.
//	if ((!audioReconnectTimeout) && (!videoReconnectTimeout)){ 
//		grabDevicesTimeout = setTimeout(function(){enumerateDevices().then(gotDevices2).then(function(){});},500);
//	}
	
	
	// enumerate devices -> check if session.sink still exists -> if not, select default default (track past last sink) -> if last disconnected devices comes back, reconnect it.
	
	// lastPlaybackDevice
	//if (session.sink){ //  Let Chrome handle the audio automatically, since not manually specified.
	clearTimeout(playbackReconnectTimeout);
	playbackReconnectTimeout = setTimeout(function(){
		enumerateDevices().then(gotDevices2).then(function(){
			resetupAudioOut();
		});
	},500);
	
}

function resetupAudioOut(){
	if ((iOS) || (iPad)){
		for (var UUID in session.rpcs){
			if (session.rpcs[UUID].videoElement){
				session.rpcs[UUID].videoElement.pause().then(() => {
					setTimeout(function(uuid){
						session.rpcs[uuid].videoElement.play().then(() => {log("toggle pause/play");});
					},0, UUID)
					
				});
			}
		}
		return;
	}
	
	var outputSelect =  document.getElementById("outputSource3");
	if (!outputSelect){errorlog("resetup audio failed");return;}
	log("Resetting Audio Output");
	var sinkSet = false;
	for (var i =0; i < outputSelect.options.length; i++){
		if (outputSelect.options[i].value==session.sink){
			outputSelect.options[i].selected=true;
			sinkSet=true;
		}
	}
	if (sinkSet==false){
		if (outputSelect.options[0]){
			outputSelect.options[0].selected=true;
			sinkSet = outputSelect.value;
		}
	} else {
		sinkSet = session.sink;
	}
	if (sinkSet){
		session.videoElement.setSinkId(sinkSet).then(() => {}).catch(error => {	errorlog(error);});
		for (UUID in session.rpcs){
			session.rpcs[UUID].videoElement.setSinkId(sinkSet).then(() => {
				log("New Output Device for: "+UUID);
			}).catch(error => {
				errorlog(error);
			});
		}
	}
}

function obfuscateURL(input){
	if (input.startsWith("https://obs.ninja/")){
		input = input.replace('https://obs.ninja/', '');
	} else if (input.startsWith("http://obs.ninja/")){
		input = input.replace('http://obs.ninja/', '');
	} else if (input.startsWith("obs.ninja/")){
		input = input.replace('obs.ninja/', '');
	}
	
	input = input.replace('&view=', '&v=');
	input = input.replace('&view&', '&v&');
	input = input.replace('?view&', '?v&');
	input = input.replace('?view=', '?v=');
	
	input = input.replace('&videobitrate=', '&vb=');
	input = input.replace('?videobitrate=', '?vb=');
	input = input.replace('&bitrate=', '&vb=');
	input = input.replace('?bitrate=', '?vb=');
	
	input = input.replace('?audiodevice=', '?ad=');
	input = input.replace('&audiodevice=', '&ad=');
	
	input = input.replace('?label=', '?l=');
	input = input.replace('&label=', '&l=');
	
	input = input.replace('?stereo=', '?s=');
	input = input.replace('&stereo=', '&s=');
	input = input.replace('&stereo&', '&s&');
	input = input.replace('?stereo&', '?s&');
	
	input = input.replace('?webcam&', '?wc&');
	input = input.replace('&webcam&', '&wc&');
	
	input = input.replace('?remote=', '?rm=');
	input = input.replace('&remote=', '&rm=');
	
	input = input.replace('?password=', '?p=');
	input = input.replace('&password=', '&p=');
	
	input = input.replace('&maxvideobitrate=', '&mvb=');
	input = input.replace('?maxvideobitrate=', '?mvb=');
	
	input = input.replace('&maxbitrate=', '&mvb=');
	input = input.replace('?maxbitrate=', '?mvb=');
	
	input = input.replace('&height=', '&h=');
	input = input.replace('?height=', '?h=');
	
	input = input.replace('&width=', '&w=');
	input = input.replace('?width=', '?w=');
	
	input = input.replace('&quality=', '&q=');
	input = input.replace('?quality=', '?q=');
	
	input = input.replace('&cleanoutput=', '&clean=');
	input = input.replace('?cleanoutput=', '?clean=');
	
	input = input.replace('&maxviewers=', '&clean=');
	input = input.replace('?maxviewers=', '?clean=');
	
	input = input.replace('&framerate=', '&fr=');
	input = input.replace('?framerate=', '?fr=');
	
	input = input.replace('&fps=', '&fr=');
	input = input.replace('?fps=', '?fr=');
	
	input = input.replace('&permaid=', '&push=');
	input = input.replace('?permaid=', '?push=');
	
	input = input.replace('&roomid=', '&r=');
	input = input.replace('?roomid=', '?r=');
	
	input = input.replace('&room=', '&r=');
	input = input.replace('?room=', '?r=');
	
	console.log(input);
	var key  = "OBSNINJAFORLIFE";
	var encrypted = CryptoJS.AES.encrypt(input, key);
	var output = "https://invite.cam/"+ encrypted.toString();
	return output;
}

document.addEventListener("visibilitychange", function() {
	console.log(document.hidden, document.visibilityState);
	if ((iOS) || (iPad)){  // fixes a bug on iOS devices.  Not need with other devices?
		if (document.visibilityState === 'visible') {
			setTimeout(function(){resetupAudioOut();},500);
		}
	}
});

try {
	navigator.mediaDevices.ondevicechange = reconnectDevices;
} catch(e){errorlog(e);}


function updateConnectionStatus() {
  warnlog("Connection type changed from " + session.stats.network_type + " to " + Connection.effectiveType);
  session.stats.network_type = Connection.effectiveType + " / " +Connection.type;
}
 
try{
	var Connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
	session.stats.network_type = Connection.effectiveType + " / " +Connection.type;
	Connection.addEventListener('change', updateConnectionStatus);
} catch(e){}

var ScreeShareState=false;
async function toggleScreenShare(ele){
	if (ScreeShareState==false){
		await grabScreen(quality=0, audio=true, videoOnEnd=true).then(res=>{
			if (res!=false){
				ScreeShareState=true;
				getById("screensharebutton").classList.add("float2");
				getById("screensharebutton").classList.remove("float");
			}
		});
	} else {
		//activatedPreview = false;
		toggleSettings(forceShow=true);
		//grabVideo(eleName='videosource', selector="select#videoSource3");  
		//getById("screensharebutton").classList.add("float");
		//getById("screensharebutton").classList.remove("float2");
		//ScreeShareState=false;
	}
}

async function grabScreen(quality=0, audio=true, videoOnEnd=false){
	if (!navigator.mediaDevices.getDisplayMedia){
		if (!(session.cleanOutput)){
			setTimeout(function(){alert("Sorry, your browser is not supported. Please use the desktop versions of Firefox or Chrome instead");},1);
		}
		return false;
	}
	
	
	if (quality==0){  // I'm going to go with default quality in most cases, as I assume Dynamic screenshare is going to want low-fps / high def.
		var width = {ideal: 1920};
		var height = {ideal: 1080};
	} else if (quality==1){
		var width = {ideal: 1280};
		var height = {ideal: 720};
	} else if (quality==2){
		var width = {ideal: 640};
		var height = {ideal: 360};
	} else if (quality>=3){  // lowest
		var width = {ideal: 320};
		var height = {ideal: 180};
	}
	
	if (session.width){
		width = {ideal: session.width};
	}
	if (session.height){
		height = {ideal: session.height};
	}

	var constraints = { // this part is a bit annoying. Do I use the same settings?  I can add custom setting controls here later
		audio: {
			echoCancellation: false,   // For screen sharing, we want it off by default.
			autoGainControl: false, 
			noiseSuppression: false 
		}, 
		video: {width: width, height: height, mediaSource: "screen"}
		//,cursor: {exact: "none"}
	};

	if (session.echoCancellation===true){
		constraints.audio.echoCancellation=true;
	} 
	if (session.autoGainControl===true){
		constraints.audio.autoGainControl=true;
	}
	if (session.noiseSuppression===true){
		constraints.audio.noiseSuppression=true;
	}
	if (audio==false){
		constraints.audio=false;
	}
	
	if (session.framerate){
		constraints.video.frameRate = session.framerate;
	}	
	
	return navigator.mediaDevices.getDisplayMedia(constraints).then(function (stream) {
		log("adding video tracks 2245");
		
		var eleName = "videosource";
		try {
			if (session.streamSrc){
				session.streamSrc.getVideoTracks().forEach(function(track){
					track.stop();
					session.streamSrc.removeTrack(track);
					log("stopping video track");
				});
				session.videoElement.srcObject.getVideoTracks().forEach(function(track){
					track.stop();
					session.videoElement.srcObject.removeTrack(track);
					log("stopping video track");
				});
			} else {
				session.streamSrc = new MediaStream();
				session.videoElement.srcObject = session.streamSrc;
				log("CREATE NEW STREAM");
			}
		} catch(e){
			errorlog(e);
		}
		//session.videoElement.srcObject = session.streamSrc;
		
		//  Let's not pass the AUDIO thru the webaudio filter. It's screen share after all.
		
		try {
			stream.getVideoTracks()[0].onended = function () { // if screen share stops, 
				if (videoOnEnd==true){
					//activatedPreview = false;
					toggleSettings(forceShow=true);
					//grabVideo(eleName='videosource', selector="select#videoSource3");  
					ScreeShareState=false;
					getById("screensharebutton").classList.add("float");
					getById("screensharebutton").classList.remove("float2");
				} else {
					grabScreen();
				} 
			};
		} catch(e){log("No Video selected; screensharing?");}
		
		stream.getTracks().forEach(function(track){
			log(track);
			addScreenDevices(track);
			
			session.streamSrc.addTrack(track, stream); // Lets not add the audio to this preview; echo can be annoying
			session.videoElement.srcObject.addTrack(track, stream); //  
				
			if (track.kind == "video"){
				toggleVideoMute(true);
				for (UUID in session.pcs){
					try {
						if ((session.pcs[UUID].guest==true) && (session.roombitrate===0)) {
							log("room rate restriction detected. No videos will be published to other guests");
						} else  if (session.pcs[UUID].allowVideo==true){  // allow 
							var senders = session.pcs[UUID].getSenders(); // for any connected peer, update the video they have if connected with a video already.
							var added=false;
							senders.forEach((sender) => { // I suppose there could be a race condition between negotiating and updating this. if joining at the same time as changnig streams?
								if (sender.track){
									if (sender.track.kind == "video"){ 
										sender.replaceTrack(track);  // replace may not be supported by all browsers.  eek.
										added=true;
									} 
								}
							});
							if (added==false){
								session.pcs[UUID].addTrack(track, stream);
							}
						}
					} catch (e){
						errorlog(e);
					}
				}
			} else {
				toggleMute(true);  // I might want to move this outside the loop, but whatever
				for (UUID in session.pcs){
					try {
						if (session.pcs[UUID].allowAudio==true){
							session.pcs[UUID].addTrack(track, stream); // If screen sharing, we will add audio; not replace. 
						}
					} catch (e){
						errorlog(log);
					}
				}
			}
		});
		applyMirror(true,eleName);
		return true;
	}).catch(function(err){
		errorlog(err); /* handle the error */
		getById("screensharebutton").classList.add("float");
		getById("screensharebutton").classList.remove("float2");
		ScreeShareState=false;
		if ((err.name == "NotAllowedError") || (err.name == "PermissionDeniedError")){
			// User Stopped it.
		} else {
			if (audio==true){
				setTimeout(function(){grabScreen(quality, false);},1);
			}
			if (!(session.cleanOutput)){
				setTimeout(function(){alert(err);},1); // TypeError: Failed to execute 'getDisplayMedia' on 'MediaDevices': Audio capture is not supported
			}
		}
		return false;
	});
}

var getUserMediaRequestID=0;
var grabVideoUserMediaTimeout = null;
var grabVideoTimer = null;
async function grabVideo(quality=0, eleName='previewWebcam', selector="select#videoSourceSelect"){
	if( activatedPreview == true){log("activated preview return 2");return;}
	activatedPreview = true;
	log("Grabbing video: "+quality);
	if (grabVideoTimer){
		clearTimeout(grabVideoTimer);
	}
	log("quality of grab:"+quality);
	log("element:"+eleName);
	
	try {
		if (session.streamSrc){
			session.streamSrc.getVideoTracks().forEach(function(track){
				session.streamSrc.removeTrack(track);
				track.stop();
				log("track removed");
			});
			if (session.videoElement.srcObject){
				session.videoElement.srcObject.getVideoTracks().forEach(function(track){
					session.videoElement.srcObject.removeTrack(track);
					track.stop();
				});
			
			}
		} else {
			//log(session.videoElement.srcObject.getTracks());
			session.streamSrc = new MediaStream();
			session.videoElement.srcObject = session.streamSrc;
			log("CREATE NEW STREAM");
		}
	} catch(e){
		errorlog(e);
	}
	
	session.videoElement.controls=false;
	
	log("selector: " + selector);
	var videoSelect = document.querySelector(selector);
	log(videoSelect);
	var mirror=false;
	
	if (videoSelect.value == "ZZZ"){  // if there is no video, or if manually set to audio ready, then do this step.
		warnlog("ZZZ SET - so no VIDEO");
		if (eleName=="previewWebcam"){
			if (session.autostart){
				publishWebcam();  // no need to mirror as there is no video...
				return;
			} else {
				log("4462");
				updateStats();
				var gowebcam = getById("gowebcam");
				if (gowebcam){
					gowebcam.disabled = false;
					gowebcam.dataset.ready = "true";
					gowebcam.style.backgroundColor = "#3C3";
					gowebcam.style.color = "black";
					gowebcam.style.fontWeight="bold";
					gowebcam.innerHTML = "START";
					miniTranslate(gowebcam,"start");
				}
			}
		} else {  // If they disabled the video but not in preview mode; but actualy live. We will want to remove the stream from the publishing
				// we don't want to do this otherwise, as we are "replacing" the track in other cases.
				// this does cause a problem, as previous bitrate settings & resolutions might not be applied if switched back....  must test
			for (UUID in session.pcs){
				var senders = session.pcs[UUID].getSenders(); // for any connected peer, update the video they have if connected with a video already.
				senders.forEach((sender) => { // I suppose there could be a race condition between negotiating and updating this. if joining at the same time as changnig streams?
					if (sender.track){
						if (sender.track.kind == "video"){ 
							session.pcs[UUID].removeTrack(sender);  // replace may not be supported by all browsers.  eek.
							errorlog("DELETED SENDER");
						} else {
							log("sender.track.kind: "+sender.track.kind);
						}
					}
				});
				
			}
		}
		// end
	} else {
		var sq=0;
		if (session.quality===false){
			sq = session.quality_wb;
		} else if (session.quality>2){  // 1080, 720, and 360p 
			sq = 2; // hacking my own code. TODO: ugly, so I need to revisit this. 
		} else {
			sq = session.quality;
		}
		
		if ((quality===false) || (quality<sq)){
			quality=sq; // override the user's setting
		}
		

		if ((iOS) || (iPad)){  // iOS will not work correctly at 1080p; likely a h264 codec issue.
			if (quality==0){
				quality=1;
			}
		} 
	
		var constraints = {  
			audio: false,
			video: getUserMediaVideoParams(quality, iOS)
		};
		
		log("Quality selected:"+quality);
		var _, sUsrAg = navigator.userAgent;
		
		
		log(videoSelect.options[videoSelect.selectedIndex].text.includes("NDI Video"));
		
		if ((iOS) || (iPad)){
			constraints.video.deviceId =  {exact: videoSelect.value}; // iPhone 6s compatible ? Needs to be exact for iPhone 6s
			
		} else if (sUsrAg.indexOf("Firefox") > -1){
			constraints.video.deviceId =  {exact: videoSelect.value}; // Firefox is a dick. Needs it to be exact.
			
		} else if (videoSelect.options[videoSelect.selectedIndex].text.includes("NDI Video")) {  // NDI does not like "EXACT"
			constraints.video.deviceId = videoSelect.value;
			
		} else {
			constraints.video.deviceId =  {exact: videoSelect.value}; //  Default. Should work for Logitech, etc.  
		}
		
		if (session.width){ 
			constraints.video.width = {exact: session.width}; // manually specified - so must be exact
		}
		if (session.height){
			constraints.video.height = {exact: session.height};
		}
		if (session.framerate){
			constraints.video.frameRate = {exact: session.framerate};
		} else if (session.maxframerate){
			constraints.video.frameRate = {max: session.maxframerate};
		}
		
		var obscam = false;
		log(videoSelect.options[videoSelect.selectedIndex].text);  
		if (videoSelect.options[videoSelect.selectedIndex].text.startsWith("OBS-Camera")){  // OBS Virtualcam
			mirror=true;
			obscam = true;
		} else if (videoSelect.options[videoSelect.selectedIndex].text.startsWith("OBS Virtual Camera")){  // OBS Virtualcam
			mirror=true;
			obscam = true;
		} else if (videoSelect.options[videoSelect.selectedIndex].text.includes(" back")){  // Android
			mirror=true;
		} else if (videoSelect.options[videoSelect.selectedIndex].text.includes(" rear")){  // Android
			mirror=true;
		} else if (videoSelect.options[videoSelect.selectedIndex].text.includes("NDI Video")){ // NDI Virtualcam 
			mirror=true;
		} else if (videoSelect.options[videoSelect.selectedIndex].text.startsWith("Back Camera")){  // iPhone and iOS
			mirror=true;
		} else {
			mirror=false;
		}
		session.mirrorExclude = mirror;
		
		log(constraints);
		clearTimeout(grabVideoUserMediaTimeout);
		getUserMediaRequestID+=1;
		grabVideoUserMediaTimeout = setTimeout(function(gumID){
			navigator.mediaDevices.getUserMedia(constraints).then(function(stream){
				
				if (getUserMediaRequestID!==gumID){
					errorlog("GET USER MEDIA CALL HAS EXPIRED");
					return;
				}
				log("adding video tracks 2412");
				stream.getVideoTracks().forEach(function(track){
					if (!session.streamSrc){
						session.streamSrc = new MediaStream();
					}
					if (!session.videoElement){
						if (document.getElementById("previewWebcam")){
							session.videoElement = document.getElementById("previewWebcam");
						} else if (document.getElementById("videosource")){
							session.videoElement = document.getElementById("videosource");
						}
					}
						
					if (session.effects){
						applyEffects(eleName, track, stream);
					} else {
						log(session.videoElement);
						log(track);
						session.streamSrc.addTrack(track, stream); // add video track to the preview video
						session.videoElement.srcObject.addTrack(track, stream); // add video track to the preview video
						//session.videoElement.srcObject = outboundAudioPipeline(session.streamSrc); // WE DONT DO THIS UNLESS ADDING A NEW AUDIO TRACK ANDDDDD ARE PREPARED TO SETUP AUDIO RE_SENDERS
					}
					
					toggleVideoMute(true);
					for (UUID in session.pcs){
						try {
							if (((iOS) || (iPad)) && (session.pcs[UUID].guest==true)){
								warnlog("iOS and GUest detected");
							} else if ((session.pcs[UUID].guest==true) && (session.roombitrate===0)) {
								log("room rate restriction detected. No videos will be published to other guests");
							} else  if (session.pcs[UUID].allowVideo==true){  // allow 
						
								// for any connected peer, update the video they have if connected with a video already.
								var added=false;
								session.pcs[UUID].getSenders().forEach((sender) => { // I suppose there could be a race condition between negotiating and updating this. if joining at the same time as changnig streams?
									if (sender.track){
										if (sender.track.kind == "video"){ 
											sender.replaceTrack(track);  // replace may not be supported by all browsers.  eek.
											added=true;
										}
									}
								});
								if (added==false){
									session.pcs[UUID].addTrack(track, stream); // can't replace, so adding
								}
							}
							
						} catch (e){
							errorlog(e);
						}
					}
					
				});
				
				applyMirror(mirror,eleName);
				
				if (eleName=="previewWebcam"){
					if (session.autostart){
						publishWebcam();
					} else {
						log("4620");
						updateStats(obscam);
						var gowebcam = getById("gowebcam");
						if (gowebcam){
							gowebcam.disabled = false;
							gowebcam.dataset.ready = "true";
							gowebcam.style.backgroundColor = "#3C3";
							gowebcam.style.color = "black";
							gowebcam.style.fontWeight="bold";
							gowebcam.innerHTML = "START";
							miniTranslate(gowebcam,"start");
						}
					}
				}
				
				// Once crbug.com/711524 is fixed, we won't need to wait anymore. This is
				// currently needed because capabilities can only be retrieved after the
				// device starts streaming. This happens after and asynchronously w.r.t.
				// getUserMedia() returns.
				if (grabVideoTimer){
					clearTimeout(grabVideoTimer);
					if (eleName=="previewWebcam"){
						session.videoElement.controls=true;
					}
				}
				if (getById("popupSelector_constraints_video")){
					getById("popupSelector_constraints_video").innerHTML = "";
				}
				if (getById("popupSelector_constraints_audio")){
					getById("popupSelector_constraints_audio").innerHTML = "";
				}
				if (getById("popupSelector_constraints_loading")){
					getById("popupSelector_constraints_loading").style.display="";
				}
				
				grabVideoTimer = setTimeout(function(){
					if (getById("popupSelector_constraints_loading")){
						getById("popupSelector_constraints_loading").style.display="none";
					}
					if (eleName=="previewWebcam"){
						session.videoElement.controls=true;
					}
					updateConstraintSliders();
					
					dragElement(session.videoElement);
				},1000);  // focus
				
				log("DONE - found stream");
			}).catch(function(e){
				activatedPreview = false;
				errorlog(e);
				if (e.name === "OverconstrainedError"){
					errorlog(e.message);
					log("Resolution or framerate didn't work");
				} else if (e.name === "NotReadableError"){
					if (quality<=10){
						grabVideo(quality+1, eleName, selector);
					} else {
						if (!(session.cleanOutput)){
							if (iOS){
								alert("An error occured. Closing existing tabs in Safari may solve this issue.");
							} else {
								alert("Error: Could not start video source.\n\nTypically this means the Camera is already be in use elsewhere. Most webcams can only be accessed by one program at a time.\n\nTry a different camera or perhaps try re-plugging in the device.");
							}
						}
						activatedPreview=true;
						if (getById('gowebcam')){
							getById('gowebcam').innerHTML="Problem with Camera";
						}
						
					}
					return;
				} else if (e.name === "NavigatorUserMediaError"){
					if (getById('gowebcam')){
						getById('gowebcam').innerHTML="Problem with Camera";
					}
					if (!(session.cleanOutput)){
						alert("Unknown error: 'NavigatorUserMediaError'"); 
					}
					return;
				} else if (e.name === "timedOut"){
					activatedPreview=true;
					if (getById('gowebcam')){
						getById('gowebcam').innerHTML="Problem with Camera";
					}
					if (!(session.cleanOutput)){
						alert(e.message);
					}
					return;
				} else {
					errorlog("An unknown camera error occured");
				}
				
				if (quality<=10){
					grabVideo(quality+1, eleName, selector);
				} else {
					errorlog("********Camera failed to work");
					activatedPreview=true;
					if (getById('gowebcam')){
						getById('gowebcam').innerHTML="Problem with Camera";
					}
					if (!(session.cleanOutput)){
						if (session.width || session.height || session.framerate){
							alert("Camera failed to load.\n\nPlease ensure your camera supports the resolution and framerate that has been manually specified. Perhaps use &quality=0 instead.");
						} else {
							alert("Camera failed to load.\n\nPlease make sure it is not already in use by another application.\n\nPlease make sure you have accepted the camera permissions.");
						}
					}
				}
			});
		},100, getUserMediaRequestID);
	}
}


async function grabAudio(eleName="previewWebcam", selector="#audioSource", trackid = null, override=false){ // trackid is the excluded track
	if( activatedPreview == true){log("activated preview return 2");return;}
	activatedPreview = true;
	warnlog("GRABBING AUDIO");
	log("TRACK EXCLUDED:"+trackid);
	try {
		log("Resetting Audio Streams");
		if (session.videoElement.srcObject){
			
			log("REMOVING AUDIO TRACKS");
		
			var audioSelect = document.querySelector(selector).querySelectorAll("input"); 
			
			
			var audioExcludeList = [];
			try {
				for (var i=0; i<audioSelect.length;i++){
					log(audioSelect[i]);
					if ("screen"==audioSelect[i].dataset.type){ // skip already excluded ---------- !!!!!!  DOES THIS MAKE SENSE? TODO: CHECK
						if (audioSelect[i].checked){
							log(audioSelect[i]);
							audioExcludeList.push(audioSelect[i]);
						}
					}
				}
			} catch(e){errorlog(e);}
		
			session.videoElement.srcObject.getAudioTracks().forEach(function(track){
				log(track);
				for (var i=0; i<audioExcludeList.length;i++){
					if (audioExcludeList[i].name == track.label){warnlog("DONE");return;}
				}
				session.videoElement.srcObject.removeTrack(track);
				track.stop();
			});
			
			session.streamSrc.getAudioTracks().forEach(function(track){
				log(track);
				for (var i=0; i<audioExcludeList.length;i++){
					if (audioExcludeList[i].name == track.label){warnlog("DONE");return;}
				}
				session.streamSrc.removeTrack(track);
				track.stop();
			});
			
			
		} else { // if no stream exists
			session.streamSrc = new MediaStream();
			session.videoElement.srcObject = session.streamSrc;
			log("CREATE NEW SOURCE FOR AUDIO");
		}
	} catch(e){
		errorlog(e);
	}
	
	var streams = await getAudioOnly(selector, trackid, override); // Get audio streams
	warnlog(streams);
	try {
		for (var i=0; i<streams.length;i++){
			streams[i].getAudioTracks().forEach(function(track){
				session.streamSrc.addTrack(track, streams[i]); // add video track to the preview video
			});
		}
		session.videoElement.srcObject = outboundAudioPipeline(session.streamSrc);
		
		toggleMute(true);
		if (session.videoElement.srcObject.getAudioTracks()){
			
			for (UUID in session.pcs){
				if (session.pcs[UUID].allowAudio==true){

						//var sender = session.pcs[UUID].replaceTrack(track, session.videoElement.srcObject);
						//sender.track.onended =  tryAgain;
						//log("ADDED TRACK TO SENDER");
						
						///
						var audioSenders = [];
						session.pcs[UUID].getSenders().forEach((sender) => { // I suppose there could be a race condition between negotiating and updating this. if joining at the same time as changnig streams?
							if (sender.track){
								if (sender.track.kind == "audio"){ 
									audioSenders.push(sender);
								}
							}
						});
						
						
						var totalAudioTracks = session.videoElement.srcObject.getAudioTracks().length; 
						if (audioSenders.length>totalAudioTracks){
							for ( var cc = totalAudioTracks; cc<audioSenders.length; cc+=1 ){  // we are going to remove excess tracks that are not used.
								session.pcs[UUID].removeTrack(audioSenders[cc]); // I suppose we do this before we add tracks to avoid having two tracks of the same audio source at the same time.
							}
						}
						
						var counter=0;
						session.videoElement.srcObject.getAudioTracks().forEach(function(track){
							if (counter<audioSenders.length){
								log("replacing audio sender track");
								audioSenders[counter].replaceTrack(track);  // replace may not be supported by all browsers.  eek. TODO: CHECK THIS OUT AGAIN -- maybe i can have it fall back to ADD track if this doens't work. remvoe then add?
								audioSenders[counter].track.onended =  tryAgain;
							} else {
								log("adding new audio sender track");
								var sender = session.pcs[UUID].addTrack(track, session.videoElement.srcObject);
								sender.track.onended =  tryAgain;
							}
							counter+=1
						});
				}
			}
		}
	} catch (e){
		errorlog(e);
	}
	var gowebcam = getById("gowebcam");
	if (gowebcam){
		gowebcam.disabled =false;
		gowebcam.dataset.ready = "true";
		gowebcam.style.backgroundColor = "#3C3";
		gowebcam.style.color = "black";
		gowebcam.style.fontWeight="bold";
		gowebcam.innerHTML = "START";
		miniTranslate(gowebcam,"start");
	}
}

function tryAgain(event){  // audio or video agnostic track reconnect ------------not actually in use,.  maybe out of date
	log("TRY AGAIN TRIGGERED");
	errorlog(event);
}
	

function enterPressed(event, callback){
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13){
    // Cancel the default action, if needed
    event.preventDefault();
    // Trigger the button element with a click
    callback();
  }
}


function dragElement(elmnt) {
	var  millis = Date.now();
	try {
		var input = getById("zoomSlider");
		var stream = elmnt.srcObject;
		try {
			var track0 = stream.getVideoTracks();
		} catch(e){return;}
		
		if (!(track0.length)){return;}
		
		track0 = track0[0];
		if (track0.getCapabilities){
			var capabilities = track0.getCapabilities();
			var settings = track0.getSettings();

			// Check whether zoom is supported or not. 
			if (!('zoom' in capabilities)) {
				log('Zoom is not supported by ' + track0.label);
				return;
			}

			// Map zoom to a slider element.
			input.min = capabilities.zoom.min;
			input.max = capabilities.zoom.max;
			input.step = capabilities.zoom.step;
			input.value = settings.zoom;
		}
	} catch(e){errorlog(e);return;}
	
	log("drag on");
    elmnt.onmousedown = dragMouseDown;
	elmnt.onclick = onvideoclick;
	elmnt.ontouchstart = dragMouseDown;
	
	var pos0 = 1;
	function onvideoclick(e){
		log(e);
		log("onvideoclick");
		e = e || window.event;
		e.preventDefault();
		return false;
	}
	
	function dragMouseDown(e) {
		log(e);
		log("dragMouseDown");
		
		//closeDragElement(null);
		
		//elmnt.controls = false;
		e = e || window.event;
		e.preventDefault();

		pos0 = input.value;
		if(e.type == 'touchstart' || e.type == 'touchmove' || e.type == 'touchend' || e.type == 'touchcancel'){
			var touch = e.touches[0] ||e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
			pos3 = touch.clientX;
			pos4 = touch.clientY;
		} else if (e.type == 'mousedown' || e.type == 'mouseup' || e.type == 'mousemove' || e.type == 'mouseover'|| e.type=='mouseout' || e.type=='mouseenter' || e.type=='mouseleave') {
			pos3 = e.clientX;
			pos4 = e.clientY;
		}
		document.ontouchup = closeDragElement;
		document.onmouseup = closeDragElement;
		
		document.ontouchmove = elementDrag;
		document.onmousemove = elementDrag;
	}

	function elementDrag(e) {
		e = e || window.event;
		e.preventDefault();
		// calculate the new cursor position:
		
		if ( Date.now() - millis < 50){
			return;
		}
		millis = Date.now();
		
		if(e.type == 'touchstart' || e.type == 'touchmove' || e.type == 'touchend' || e.type == 'touchcancel'){
			var touch = e.touches[0] ||e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
			pos1 =  touch.clientX;
			pos2 =  touch.clientY;
		} else if (e.type == 'mousedown' || e.type == 'mouseup' || e.type == 'mousemove' || e.type == 'mouseover'|| e.type=='mouseout' || e.type=='mouseenter' || e.type=='mouseleave') {
			pos1 =  e.clientX;
			pos2 =   e.clientY;
		}
		
		var zoom =  parseFloat((pos4-pos2)*2/elmnt.offsetHeight);
		
		if (zoom>1){zoom =1.0;}
		else if (zoom<-1){zoom=-1.0;}
		input.value = zoom*(input.max - input.min) + input.min;
		if (input.value !=  pos0){
			track0.applyConstraints({advanced: [ {zoom: input.value} ]});
		}
	}

	function closeDragElement(e) {
		log(e);
		log("closeDragElement");
		//if (e!==null){
		//	elmnt.controls=true;
		//}
		/* stop moving when mouse button is released:*/
		document.ontouchup = null;
		document.onmouseup = null;
		document.onmousemove = null;
		document.ontouchmove = null;
	}
}

function previewIframe(iframesrc){  // this is pretty important if you want to avoid camera permission popup problems.  You can also call it automatically via: <body onload=>loadIframe();"> , but don't call it before the page loads.
	
	var iframe = document.createElement("iframe");
	iframe.allow="autoplay;camera;microphone";
	iframe.allowtransparency="true";
	iframe.allowfullscreen ="true";
	iframe.style.width="100%";
	iframe.style.height="100%";
	iframe.style.border = "10px dashed rgb(64 65 62)";
	
	if (iframesrc==""){
		iframesrc="./";
	}
	
	iframe.src = iframesrc;
	getById("previewIframe").innerHTML ="";
	getById("previewIframe").style.width="640px";
	getById("previewIframe").style.height="360px";
	getById("previewIframe").style.margin="auto";
	getById("previewIframe").appendChild(iframe);
}

function loadIframe(iframesrc){  // this is pretty important if you want to avoid camera permission popup problems.  You can also call it automatically via: <body onload=>loadIframe();"> , but don't call it before the page loads.
	
	var iframe = document.createElement("iframe");
	iframe.allow="autoplay;camera;microphone";
	iframe.allowtransparency="true";
	iframe.allowfullscreen ="true";
	iframe.style.width="100%";
	iframe.style.height="100%";
	iframe.style.border = "10px dashed rgb(64 65 62)";
	
	if (iframesrc==""){
		iframesrc="./";
	}
	if (document.getElementById("mainmenu")){
		var m = getById("mainmenu");
		m.remove();
	}
	iframe.src = iframesrc;
	return iframe
}

function dropDownButtonAction(ele){
	var ele = getById("dropButton");
	if (ele){
		ele.parentNode.removeChild(ele);
		getById('container-5').classList.remove('advanced');
		getById('container-8').classList.remove('advanced');
		getById('container-6').classList.remove('advanced');
		getById('container-7').classList.remove('advanced');
	}
}

function updateConstraintSliders(){
	log("updateConstraintSliders");
	if (session.roomid!==false && session.roomid!=="" && session.director!==true){
		if (session.controlRoomBitrate===true){
			listCameraSettings();
		}
	} else {
		listAudioSettings();
		listCameraSettings();
	}
	//checkIfPIP();  //  this doesn't actually work on iOS still, so whatever.
}

function checkIfPIP(){
	try{
		if (session.videoElement && ((session.videoElement.webkitSupportsPresentationMode && typeof session.videoElement.webkitSetPresentationMode === "function") || (document.pictureInPictureEnabled || !videoElement.disablePictureInPicture))) {
			// Toggle PiP when the user clicks the button.
			
			getById("pIpStartButton").addEventListener("click", function(event) {
			//	if ( (document.pictureInPictureEnabled || !videoElement.disablePictureInPicture)){
					//session.videoElement.requestPictureInPicture();
			//	} else {
					session.videoElement.webkitSetPresentationMode(session.videoElement.webkitPresentationMode === "picture-in-picture" ? "inline" : "picture-in-picture");
			//	}
			});
			getById("pIpStartButton").style.display="inline-block";
		} 
	} catch(e){
		errorlog(e);
	}
}

function listAudioSettingsPrep(){
	try {
		var track0 = session.streamSrc.getAudioTracks();
		if (track0.length){
			track0 = track0[0];
			if (track0.getCapabilities){
				session.audioConstraints = track0.getCapabilities();
			}
			log(session.audioConstraints);
		} else {
			warnlog("session.streamSrc contains no audio tracks");
			return;
		}
	} catch(e){
		warnlog(e);
		return;
	}
	try {
		if (track0.getSettings){
			session.currentAudioConstraints = track0.getSettings();
		}
	} catch(e){
		warnlog(e);
		return;
	}
	var msg = {};
	msg.trackLabel = "unknown";
	if (track0.label){
		msg.trackLabel = track0.label;
	}
	msg.currentAudioConstraints = session.currentAudioConstraints;
	msg.audioConstraints = session.audioConstraints;
	msg.equalizer = session.equalizer;
	return msg;
}
function listVideoSettingsPrep(){
	try {
		var track0 = session.streamSrc.getVideoTracks();
		if (track0.length){
			track0 = track0[0];
			if (track0.getCapabilities){
				session.cameraConstraints = track0.getCapabilities();
			}
			log(session.cameraConstraints);
		}
	} catch(e){
		warnlog(e);
		return;
	}
	
	try {
		if (track0.getSettings){
			session.currentCameraConstraints = track0.getSettings();
		}
	} catch(e){
		warnlog(e);
		return;
	}
	var msg = {};
	msg.trackLabel = "unknown";
	if (track0.label){
		msg.trackLabel = track0.label;
	}
	msg.currentCameraConstraints = session.currentCameraConstraints;
	msg.cameraConstraints = session.cameraConstraints;
	return msg;
}


function changeOrder(value, UUID){
	var msg = {};
	msg.changeOrder = value;
	msg.UUID = UUID;
	session.sendRequest(msg, msg.UUID);
}
function requestVideoHack(keyname,value, UUID){
	var msg = {};
	msg.requestVideoHack = true;
	msg.keyname = keyname;
	msg.value = value;
	msg.UUID = UUID;
	session.sendRequest(msg, msg.UUID);
}
function requestAudioHack(keyname,value, UUID){  // updateCameraConstraints
	var msg = {};
	msg.requestAudioHack = true;
	msg.keyname = keyname;
	msg.value = value;
	msg.UUID = UUID;
	session.sendRequest(msg, msg.UUID);
}
function requestChangeEQ(keyname,value, UUID){  // updateCameraConstraints
	var msg = {};
	msg.requestChangeEQ = true;
	msg.keyname = keyname;
	msg.value = value;
	msg.UUID = UUID;
	session.sendRequest(msg, msg.UUID);
}

function updateDirectorsAudio(data, UUID){
	var audioEle = document.createElement("div");
	if (data.trackLabel){
		var label = document.createElement("span");
		label.innerText = data.trackLabel;
		label.style.marginBottom = "10px";
		label.style.display = "block";
		audioEle.appendChild(label);
	}
	
	if (data.equalizer){
		var label = document.createElement("label");
		var i = "Low_EQ";
		label.id= label.id= "label_"+i;
		label.htmlFor = "constraints_"+i;
		label.innerText = "low EQ:";
		
		var input = document.createElement("input");
		input.min = -50;
		input.max = 50;
		
		input.type = "range";
		input.dataset.keyname = i;
		input.dataset.labelname = label.innerText;
		input.id = "constraints_"+i;
		input.style="display:block; width:100%;";
		input.name = "constraints_"+i;
		input.style.margin = "8px 0";
		
		input.onchange = function(e){
			getById("label_"+e.target.dataset.keyname).innerText = e.target.dataset.labelname+" "+e.target.value;
			//changeLowEQ( e.target.value);
			requestChangeEQ("low", e.target.value);
		};
		
		audioEle.appendChild(label);
		audioEle.appendChild(input);	
		
		var label = document.createElement("label");
		var i = "Mid_EQ";
		label.id= label.id= "label_"+i;
		label.htmlFor = "constraints_"+i;
		label.innerText = "mid EQ:";
		
		var input = document.createElement("input");
		input.min = -50;
		input.max = 50;
		
		input.type = "range";
		input.dataset.keyname = i;
		input.dataset.labelname = label.innerText;
		input.id = "constraints_"+i;
		input.style="display:block; width:100%;";
		input.name = "constraints_"+i;
		input.style.margin = "8px 0";
		

		input.onchange = function(e){
			getById("label_"+e.target.dataset.keyname).innerText = e.target.dataset.labelname+" "+e.target.value;
			//changeMidEQ( e.target.value);
			requestChangeEQ("mid", e.target.value);
		};
		
		audioEle.appendChild(label);
		audioEle.appendChild(input);	
		
		
		var label = document.createElement("label");
		var i = "High_EQ";
		label.id= label.id= "label_"+i;
		label.htmlFor = "constraints_"+i;
		label.innerText = "high EQ:";
		
		var input = document.createElement("input");
		input.min = -50;
		input.max = 50;
		
		input.type = "range";
		input.dataset.keyname = i;
		input.dataset.labelname = label.innerText;
		input.id = "constraints_"+i;
		input.style="display:block; width:100%;";
		input.name = "constraints_"+i;
		input.style.margin = "8px 0";

		input.onchange = function(e){
			getById("label_"+e.target.dataset.keyname).innerText = e.target.dataset.labelname+" "+e.target.value;
			requestChangeEQ("high", e.target.value);
		};
		
		audioEle.appendChild(label);
		audioEle.appendChild(input);	
	}
	for (var i in data.audioConstraints){
		try {
			log(i);
			log(data.audioConstraints[i]);
			if ((typeof data.audioConstraints[i] ==='object') && (data.audioConstraints[i] !== null) && ("max" in data.audioConstraints[i]) && ("min" in data.audioConstraints[i])){
				if (i==="aspectRatio"){continue;}
				else if (i==="width"){continue;}
				else if (i==="height"){continue;}
				else if (i==="frameRate"){continue;}
				else if (i==="latency"){continue;}
				else if (i==="sampleRate"){continue;}
				
				var label = document.createElement("label");
				label.id= "label_"+i;
				label.htmlFor = "constraints_"+i;
				label.innerText = i+":";
				
				var input = document.createElement("input");
				input.min = data.audioConstraints[i].min;
				input.max = data.audioConstraints[i].max;
				
				if (parseFloat(input.min) == parseFloat(input.max)){continue;}
				
				if (i in data.currentAudioConstraints){
					input.value = data.currentAudioConstraints[i];
					label.innerText = i+": "+data.currentAudioConstraints[i];
				} else {
					label.innerText = i;
				}
				if ("step" in data.audioConstraints[i]){
					input.step = data.audioConstraints[i].step;
				}
				input.type = "range";
				input.dataset.keyname = i;
				input.id = "constraints_"+i;
				input.style="display:block; width:100%;";
				input.name = "constraints_"+i;
				
				
				input.onchange = function(e){
					getById("label_"+e.target.dataset.keyname).innerText =e.target.dataset.keyname+": "+e.target.value;
					//updateAudioConstraints(e.target.dataset.keyname, e.target.value);
					requestAudioHack(e.target.dataset.keyname, e.target.value, UUID);
				};
				
				audioEle.appendChild(label);
				audioEle.appendChild(input);
			} else if ((typeof data.audioConstraints[i] ==='object') && (data.audioConstraints[i] !== null)){
				if (i == "resizeMode"){continue;}
				
				var div = document.createElement("div");
				var label = document.createElement("label");
				label.id= "label_"+i;
				label.htmlFor = "constraints_"+i;
				label.innerText = i+":";
				label.style="display:inline-block; padding:0;margin: 5px 0px 9px;"; 
				label.dataset.keyname = i;
				var input = document.createElement("select");
				var c = document.createElement("option");
					
				if (data.audioConstraints[i].length>1){
					for (var opts in data.audioConstraints[i]) {
					  log(opts);
					  var opt = new Option(data.audioConstraints[i][opts], data.audioConstraints[i][opts]);
					  input.options.add(opt);
					  if (i in data.currentAudioConstraints){
						if (data.audioConstraints[i][opts] == data.currentAudioConstraints[i]){
							opt.selected=true;
						}
					  }
					}
				} else if (i.toLowerCase == "torch"){
					var opt = new Option("Off", false);
					input.options.add(opt);
					opt = new Option("On", true);
					input.options.add(opt);
				} else {
					continue;
				}
				
				input.id = "constraints_"+i;
				input.className="constraintCameraInput";
				input.name = "constraints_"+i;
				input.style = "display:inline; padding:2px; margin:0 10px;";
				input.dataset.keyname = i;
				input.onchange = function(e){
					//getById("label_"+e.target.dataset.keyname).innerText =e.target.dataset.keyname+": "+e.target.value;
					//updateAudioConstraints(e.target.dataset.keyname, e.target.value);
					requestAudioHack(e.target.dataset.keyname, e.target.value, UUID);
					log(e.target.dataset.keyname, e.target.value);
				};
				audioEle.appendChild(div);
				div.appendChild(label);
				div.appendChild(input);
			} else if (typeof data.audioConstraints[i] === 'boolean'){
				
				var div = document.createElement("div");
				var label = document.createElement("label");
				label.id= "label_"+i;
				label.htmlFor = "constraints_"+i;
				label.innerText = i+":";
				label.style="display:inline-block; padding:0;margin: 5px 0px 9px;"; 
				label.dataset.keyname = i;
				var input = document.createElement("select");
				var c = document.createElement("option");
				
				var opt = new Option("Off", false);
				input.options.add(opt);
				opt = new Option("On", true);
				input.options.add(opt);
				
				input.id = "constraints_"+i;
				input.className="constraintCameraInput";
				input.name = "constraints_"+i;
				input.style = "display:inline; padding:2px; margin:0 10px;";
				input.dataset.keyname = i;
				input.onchange = function(e){
					//getById("label_"+e.target.dataset.keyname).innerText =e.target.dataset.keyname+": "+e.target.value;
					//updateAudioConstraints(e.target.dataset.keyname, e.target.value);
					requestAudioHack(e.target.dataset.keyname, e.target.value, UUID);
					log(e.target.dataset.keyname, e.target.value);
				};
				audioEle.appendChild(div);
				div.appendChild(label);
				div.appendChild(input);
			}
		} catch(e){errorlog(e);}
	}
	
	getById("advanced_audio_director_"+UUID).innerHTML = "";
	getById("advanced_audio_director_"+UUID).appendChild(audioEle);
	getById("advanced_audio_director_"+UUID).className = "";
}

function updateDirectorsVideo(data, UUID){
	var videoEle = document.createElement("div");
	if (data.trackLabel){
		var label = document.createElement("span");
		label.innerText = data.trackLabel;
		label.style.marginBottom = "10px";
		label.style.display = "block";
		videoEle.appendChild(label);
	}
	for (var i in data.cameraConstraints){
		try {
			log(i);
			log(data.cameraConstraints[i]);
			if ((typeof data.cameraConstraints[i] ==='object') && (data.cameraConstraints[i] !== null) && ("max" in data.cameraConstraints[i]) && ("min" in data.cameraConstraints[i])){
				if (i==="aspectRatio"){continue;}
				else if (i==="width"){continue;}
				else if (i==="height"){continue;}
				else if (i==="frameRate"){continue;}
				else if (i==="latency"){continue;}
				else if (i==="sampleRate"){continue;}
				
				var label = document.createElement("label");
				label.id= "label_"+i;
				label.htmlFor = "constraints_"+i;
				label.innerText = i+":";
				
				var input = document.createElement("input");
				input.min = data.cameraConstraints[i].min;
				input.max = data.cameraConstraints[i].max;
				
				if (parseFloat(input.min) == parseFloat(input.max)){continue;}
				
				
				
				if (i in data.currentCameraConstraints){
					input.value = data.currentCameraConstraints[i];
					label.innerText = i+": "+data.currentCameraConstraints[i];
				} else {
					label.innerText = i;
				}
				if ("step" in data.cameraConstraints[i]){
					input.step = data.cameraConstraints[i].step;
				}
				input.type = "range";
				input.dataset.keyname = i;
				input.id = "constraints_"+i;
				input.style="display:block; width:100%;margin: 8px 0;";
				input.name = "constraints_"+i;
				
				
				input.onchange = function(e){
					getById("label_"+e.target.dataset.keyname).innerText =e.target.dataset.keyname+": "+e.target.value;
					//updateVideoConstraints(e.target.dataset.keyname, e.target.value);
					requestVideoHack(e.target.dataset.keyname, e.target.value, UUID);
				};
				
				
				videoEle.appendChild(label);
				videoEle.appendChild(input);
			} else if ((typeof data.cameraConstraints[i] ==='object') && (data.cameraConstraints[i] !== null)){
				if (i == "resizeMode"){continue;}
				
				var div = document.createElement("div");
				var label = document.createElement("label");
				label.id= "label_"+i;
				label.htmlFor = "constraints_"+i;
				label.innerText = i+":";
				label.style="display:inline-block; padding:0;margin: 5px 0px 9px;"; 
				label.dataset.keyname = i;
				var input = document.createElement("select");
				var c = document.createElement("option");
					
				if (data.cameraConstraints[i].length>1){
					for (var opts in data.cameraConstraints[i]) {
					  log(opts);
					  var opt = new Option(data.cameraConstraints[i][opts], data.cameraConstraints[i][opts]);
					  input.options.add(opt);
					  if (i in data.currentCameraConstraints){
						if (data.cameraConstraints[i][opts] == data.currentCameraConstraints[i]){
							opt.selected=true;
						}
					  }
					}
				} else if (i.toLowerCase == "torch"){
					var opt = new Option("Off", false);
					input.options.add(opt);
					opt = new Option("On", true);
					input.options.add(opt);
				} else {
					continue;
				}
				
				input.id = "constraints_"+i;
				input.className="constraintCameraInput";
				input.name = "constraints_"+i;
				input.style = "display:inline; padding:2px; margin:0 10px;";
				input.dataset.keyname = i;
				input.onchange = function(e){
					//getById("label_"+e.target.dataset.keyname).innerText =e.target.dataset.keyname+": "+e.target.value;
					//updateVideoConstraints(e.target.dataset.keyname, e.target.value);
					requestVideoHack(e.target.dataset.keyname, e.target.value, UUID);
					log(e.target.dataset.keyname, e.target.value);
				};
				videoEle.appendChild(div);
				div.appendChild(label);
				div.appendChild(input);
			} else if (typeof data.cameraConstraints[i] === 'boolean'){
				
				var div = document.createElement("div");
				var label = document.createElement("label");
				label.id= "label_"+i;
				label.htmlFor = "constraints_"+i;
				label.innerText = i+":";
				label.style="display:inline-block; padding:0;margin: 5px 0px 9px;"; 
				label.dataset.keyname = i;
				var input = document.createElement("select");
				var c = document.createElement("option");
				
				var opt = new Option("Off", false);
				input.options.add(opt);
				opt = new Option("On", true);
				input.options.add(opt);
				
				input.id = "constraints_"+i;
				input.className="constraintCameraInput";
				input.name = "constraints_"+i;
				input.style = "display:inline; padding:2px; margin:0 10px;";
				input.dataset.keyname = i;
				input.onchange = function(e){
					//getById("label_"+e.target.dataset.keyname).innerText =e.target.dataset.keyname+": "+e.target.value;
					//updateVideoConstraints(e.target.dataset.keyname, e.target.value);
					requestVideoHack(e.target.dataset.keyname, e.target.value, UUID);
					log(e.target.dataset.keyname, e.target.value);
				};
				videoEle.appendChild(div);
				div.appendChild(label);
				div.appendChild(input);
			}
		} catch(e){errorlog(e);}
	}
	
	getById("advanced_video_director_"+UUID).innerHTML = "";
	getById("advanced_video_director_"+UUID).appendChild(videoEle);
	getById("advanced_video_director_"+UUID).className = "";
}

///////

function listAudioSettings(){
	getById("popupSelector_constraints_audio").innerHTML = "";
	try {
		var track0 = session.streamSrc.getAudioTracks();
		if (track0.length){
			track0 = track0[0];
			if (track0.getCapabilities){
				session.audioConstraints = track0.getCapabilities();
			}
			log(session.audioConstraints);
		} else {
			warnlog("session.streamSrc contains no audio tracks");
			return;
		}
	} catch(e){
		warnlog("session.streamSrc contains no audio tracks");
		errorlog(e);
		return;
	}
	try {
		
		if (track0.getSettings){
			session.currentAudioConstraints = track0.getSettings();
		}
	} catch(e){
		errorlog(e);
	}
	//////
	if (session.equalizer){
		if (getById("popupSelector_constraints_audio").style.display == "none"){
			getById("advancedOptionsAudio").style.display="inline-block";
		}
		
		var label = document.createElement("label");
		var i = "Low_EQ";
		label.id= label.id= "label_"+i;
		label.htmlFor = "constraints_"+i;
		label.innerHTML = "Low EQ:";
		
		var input = document.createElement("input");
		input.min = -50;
		input.max = 50;
		
		input.type = "range";
		input.dataset.keyname = i;
		input.dataset.labelname = label.innerHTML;
		input.id = "constraints_"+i;
		input.style="display:block; width:100%;";
		input.name = "constraints_"+i;
		
		for (var webAudio in session.webAudios){
			if  (session.webAudios[webAudio].lowEQ.gain){
				input.value = session.webAudios[webAudio].lowEQ.gain.value;
				label.innerHTML +=" "+session.webAudios[webAudio].lowEQ.gain.value;
			}
		}

		input.onchange = function(e){
			getById("label_"+e.target.dataset.keyname).innerHTML = e.target.dataset.labelname+" "+e.target.value;
			changeLowEQ( e.target.value);
		};
		
		getById("popupSelector_constraints_audio").appendChild(label);
		getById("popupSelector_constraints_audio").appendChild(input);	
		//
		if (getById("popupSelector_constraints_audio").style.display == "none"){
			getById("advancedOptionsAudio").style.display="inline-block";
		}
		
		var label = document.createElement("label");
		var i = "Mid_EQ";
		label.id= label.id= "label_"+i;
		label.htmlFor = "constraints_"+i;
		label.innerHTML = "Mid EQ:";
		
		var input = document.createElement("input");
		input.min = -50;
		input.max = 50;
		
		input.type = "range";
		input.dataset.keyname = i;
		input.dataset.labelname = label.innerHTML;
		input.id = "constraints_"+i;
		input.style="display:block; width:100%;";
		input.name = "constraints_"+i;
		
		
		for (var webAudio in session.webAudios){
			if  (session.webAudios[webAudio].midEQ.gain){
				input.value = session.webAudios[webAudio].midEQ.gain.value;
				label.innerHTML +=" "+session.webAudios[webAudio].midEQ.gain.value;
			}
		}

		
		
		input.onchange = function(e){
			getById("label_"+e.target.dataset.keyname).innerHTML = e.target.dataset.labelname+" "+e.target.value;
			changeMidEQ( e.target.value);
		};
		
		getById("popupSelector_constraints_audio").appendChild(label);
		getById("popupSelector_constraints_audio").appendChild(input);	
		//
		if (getById("popupSelector_constraints_audio").style.display == "none"){
			getById("advancedOptionsAudio").style.display="inline-block";
		}
		
		var label = document.createElement("label");
		var i = "High_EQ";
		label.id= label.id= "label_"+i;
		label.htmlFor = "constraints_"+i;
		label.innerHTML = "High EQ:";
		
		var input = document.createElement("input");
		input.min = -50;
		input.max = 50;
		
		
		input.type = "range";
		input.dataset.keyname = i;
		input.dataset.labelname = label.innerHTML;
		input.id = "constraints_"+i;
		input.style="display:block; width:100%;";
		input.name = "constraints_"+i;
		
		for (var webAudio in session.webAudios){
			if (session.webAudios[webAudio].highEQ.gain){
				input.value = session.webAudios[webAudio].highEQ.gain.value;
				label.innerHTML +=" "+session.webAudios[webAudio].highEQ.gain.value;
			}
		}

		
		
		input.onchange = function(e){
			getById("label_"+e.target.dataset.keyname).innerHTML = e.target.dataset.labelname+" "+e.target.value;
			changeHighEQ( e.target.value);
		};
		
		getById("popupSelector_constraints_audio").appendChild(label);
		getById("popupSelector_constraints_audio").appendChild(input);	
	}
	////////
	for (var i in session.audioConstraints){
		try {
			log(i);
			log(session.audioConstraints[i]);
			if ((typeof session.audioConstraints[i] ==='object') && (session.audioConstraints[i] !== null) && ("max" in session.audioConstraints[i]) && ("min" in session.audioConstraints[i])){
				if (i==="aspectRatio"){continue;}
				else if (i==="width"){continue;}
				else if (i==="height"){continue;}
				else if (i==="frameRate"){continue;}
				else if (i==="latency"){continue;}
				else if (i==="sampleRate"){continue;}
				
				var label = document.createElement("label");
				label.id= "label_"+i;
				label.htmlFor = "constraints_"+i;
				label.innerHTML = i+":";
				
				var input = document.createElement("input");
				input.min = session.audioConstraints[i].min;
				input.max = session.audioConstraints[i].max;
				
				if (parseFloat(input.min) == parseFloat(input.max)){continue;}
				
				if (getById("popupSelector_constraints_audio").style.display == "none"){
					getById("advancedOptionsAudio").style.display="inline-block";
				}
				
				
				if (i in session.currentAudioConstraints){
					input.value = session.currentAudioConstraints[i];
					label.innerHTML = i+": "+session.currentAudioConstraints[i];
				} else {
					label.innerHTML = i;
				}
				if ("step" in session.audioConstraints[i]){
					input.step = session.audioConstraints[i].step;
				}
				input.type = "range";
				input.dataset.keyname = i;
				input.id = "constraints_"+i;
				input.style="display:block; width:100%;";
				input.name = "constraints_"+i;
				
				
				input.onchange = function(e){
					getById("label_"+e.target.dataset.keyname).innerHTML =e.target.dataset.keyname+": "+e.target.value;
					//updateAudioConstraints(e.target.dataset.keyname, e.target.value);
					applyAudioHack(track0,e.target.dataset.keyname, e.target.value);
				};
				
				
				getById("popupSelector_constraints_audio").appendChild(label);
				getById("popupSelector_constraints_audio").appendChild(input);
			} else if ((typeof session.audioConstraints[i] ==='object') && (session.audioConstraints[i] !== null)){
				if (i == "resizeMode"){continue;}
				
				var div = document.createElement("div");
				var label = document.createElement("label");
				label.id= "label_"+i;
				label.htmlFor = "constraints_"+i;
				label.innerHTML = i+":";
				label.style="display:inline-block; padding:0;margin: 15px 0px 29px;"; 
				label.dataset.keyname = i;
				var input = document.createElement("select");
				var c = document.createElement("option");
				
				if (session.audioConstraints[i].length>1){
					for (var opts in session.audioConstraints[i]) {
					  log(opts);
					  var opt = new Option(session.audioConstraints[i][opts], session.audioConstraints[i][opts]);
					  input.options.add(opt);
					  
					  if (i in session.currentAudioConstraints){
						if (session.audioConstraints[i][opts] == session.currentAudioConstraints[i]){
							opt.selected=true;
						}
					  }
					  
					}
				} else if (i.toLowerCase == "torch"){
					var opt = new Option("Off", false);
					input.options.add(opt);
					opt = new Option("On", true);
					input.options.add(opt);
				} else {
					continue;
				}
				
				if (getById("popupSelector_constraints_audio").style.display == "none"){
					getById("advancedOptionsAudio").style.display="inline-block";
				}
				
				input.id = "constraints_"+i;
				input.className="constraintCameraInput";
				input.name = "constraints_"+i;
				input.style = "display:inline; padding:2px; margin:0 10px;";
				input.dataset.keyname = i;
				input.onchange = function(e){
					//getById("label_"+e.target.dataset.keyname).innerHTML =e.target.dataset.keyname+": "+e.target.value;
					//updateAudioConstraints(e.target.dataset.keyname, e.target.value);
					applyAudioHack(track0,e.target.dataset.keyname, e.target.value);
					log(e.target.dataset.keyname, e.target.value);
				};
				getById("popupSelector_constraints_audio").appendChild(div);
				div.appendChild(label);
				div.appendChild(input);
			} else if (typeof session.audioConstraints[i] === 'boolean'){
				
				var div = document.createElement("div");
				var label = document.createElement("label");
				label.id= "label_"+i;
				label.htmlFor = "constraints_"+i;
				label.innerHTML = i+":";
				label.style="display:inline-block; padding:0;margin: 15px 0px 29px;"; 
				label.dataset.keyname = i;
				var input = document.createElement("select");
				var c = document.createElement("option");
				
				var opt = new Option("Off", false);
				input.options.add(opt);
				opt = new Option("On", true);
				input.options.add(opt);
				
				if (getById("popupSelector_constraints_audio").style.display == "none"){
					getById("advancedOptionsAudio").style.display="inline-block";
				}
				
				input.id = "constraints_"+i;
				input.className="constraintCameraInput";
				input.name = "constraints_"+i;
				input.style = "display:inline; padding:2px; margin:0 10px;";
				input.dataset.keyname = i;
				input.onchange = function(e){
					//getById("label_"+e.target.dataset.keyname).innerHTML =e.target.dataset.keyname+": "+e.target.value;
					//updateAudioConstraints(e.target.dataset.keyname, e.target.value);
					applyAudioHack(track0,e.target.dataset.keyname, e.target.value);
					log(e.target.dataset.keyname, e.target.value);
				};
				getById("popupSelector_constraints_audio").appendChild(div);
				div.appendChild(label);
				div.appendChild(input);
			}
		} catch(e){errorlog(e);}
			
	}
}


function applyAudioHack(track, constraint, value=null){
	if (value == parseFloat(value)){
		value = parseFloat(value);
		value = {exact: value};
	} else if (value == "true"){
		value = true;
	} else if (value == "false"){
		value = false;
	}
	log(constraint);
	var  new_constraints = Object.assign(track.getSettings(), {[constraint]:value}, );
	new_constraints = {audio: new_constraints, video:false};
	log(new_constraints);
	activatedPreview=false;
	enumerateDevices().then(gotDevices2).then(function(){grabAudio("videosource","#audioSource3", null, new_constraints);});
	
}

function updateAudioConstraints(constraint, value=null){  // this is what it SHOULD be, but this doesn't work yet.
	var track0 = session.streamSrc.getAudioTracks();
	track0 = track0[0];
	if (value == parseFloat(value)){
		value = parseFloat(value);
	} else if (value == "true"){
		value = true;
	} else if (value == "false"){
		value = false;
	}
	log({advanced: [ {[constraint]: value} ]});
	track0.applyConstraints({advanced: [ {[constraint]: value} ]});
	return;
	
}

var originalBitrate = session.totalRoomBitrate;

function listCameraSettings(){
	getById("popupSelector_constraints_video").innerHTML = "";
	
	if ((originalBitrate) && (session.roomid) && (session.view!=="") && (session.controlRoomBitrate)){
		log("LISTING OPTION FOR BITRATE CONTROL");
		var i = "room video bitrate (kbps)";
		var label = document.createElement("label");
		label.id= "label_"+i;
		label.htmlFor = "constraints_"+i;
		label.innerHTML = i+":";
		label.title = "If you're on a slow network, you can improve frame rate and audio quality by reducing the amount of video data that others send you";
		
		var input = document.createElement("input");
		input.min = 0;
		input.max = parseInt(originalBitrate);
		
		if (getById("popupSelector_constraints_video").style.display == "none"){
			getById("advancedOptionsCamera").style.display="inline-block";
		}
		
		input.value = session.totalRoomBitrate;
		label.innerHTML = i+": "+session.totalRoomBitrate;
		
		input.type = "range";
		input.dataset.keyname = i;
		input.id = "constraints_"+i;
		input.style="display:block; width:100%;";
		input.name = "constraints_"+i;
		input.title = "If you're on a slow network, you can improve frame rate and audio quality by reducing the amount of video data that others send you";
		
		
		input.onchange = function(e){
			getById("label_"+e.target.dataset.keyname).innerHTML =e.target.dataset.keyname+": "+e.target.value;
			
			if (e.target.value>originalBitrate){return;}
			else {session.totalRoomBitrate = parseInt(e.target.value);}
			updateMixer();
		};
		
		
		getById("popupSelector_constraints_video").appendChild(label);
		getById("popupSelector_constraints_video").appendChild(input);
	
	}
	try {
		var track0 = session.streamSrc.getVideoTracks();
		if (track0.length){
			track0 = track0[0];
			if (track0.getCapabilities){
				session.cameraConstraints = track0.getCapabilities();
			}
			log(session.cameraConstraints);
		}
	} catch(e){
		errorlog(e);
		return;
	}
	
	try {
		
		if (track0.getSettings){
			session.currentCameraConstraints = track0.getSettings();
		}
	} catch(e){
		errorlog(e);
	}
	
	for (var i in session.cameraConstraints){
		try {
			log(i);
			log(session.cameraConstraints[i]);
			if ((typeof session.cameraConstraints[i] ==='object') && (session.cameraConstraints[i] !== null) && ("max" in session.cameraConstraints[i]) && ("min" in session.cameraConstraints[i])){
				if (i==="aspectRatio"){continue;}
				else if (i==="width"){continue;}
				else if (i==="height"){continue;}
				else if (i==="frameRate"){continue;}
				
				
				
				var label = document.createElement("label");
				label.id= "label_"+i;
				label.htmlFor = "constraints_"+i;
				label.innerHTML = i+":";
				
				var input = document.createElement("input");
				input.min = session.cameraConstraints[i].min;
				input.max = session.cameraConstraints[i].max;
				
				if (parseFloat(input.min) == parseFloat(input.max)){continue;}
				
				if (getById("popupSelector_constraints_video").style.display == "none"){
					getById("advancedOptionsCamera").style.display="inline-block";
				}
				
				if (i in session.currentCameraConstraints){
					input.value = session.currentCameraConstraints[i];
					label.innerHTML = i+": "+session.currentCameraConstraints[i];
				} else {
					label.innerHTML = i;
				}
				if ("step" in session.cameraConstraints[i]){
					input.step = session.cameraConstraints[i].step;
				}
				input.type = "range";
				input.dataset.keyname = i;
				input.id = "constraints_"+i;
				input.style="display:block; width:100%;";
				input.name = "constraints_"+i;
				
				
				input.onchange = function(e){
					getById("label_"+e.target.dataset.keyname).innerHTML =e.target.dataset.keyname+": "+e.target.value;
					updateCameraConstraints(e.target.dataset.keyname, e.target.value);
				};
				
				
				getById("popupSelector_constraints_video").appendChild(label);
				getById("popupSelector_constraints_video").appendChild(input);
			} else if ((typeof session.cameraConstraints[i] ==='object') && (session.cameraConstraints[i] !== null)){
				if (i == "resizeMode"){continue;}
				
				var div = document.createElement("div");
				var label = document.createElement("label");
				label.id= "label_"+i;
				label.htmlFor = "constraints_"+i;
				label.innerHTML = i+":";
				label.style="display:inline-block; padding:0;margin: 15px 0px 29px;"; 
				label.dataset.keyname = i;
				var input = document.createElement("select");
				var c = document.createElement("option");
					
				if (session.cameraConstraints[i].length>1){
					for (var opts in session.cameraConstraints[i]) {
					  log(opts);
					  var opt = new Option(session.cameraConstraints[i][opts], session.cameraConstraints[i][opts]);
					  input.options.add(opt);
					  if (i in session.currentCameraConstraints){
						if (session.cameraConstraints[i][opts] == session.currentCameraConstraints[i]){
							opt.selected=true;
						}
					  }
					}
				} else if (i.toLowerCase == "torch"){
					var opt = new Option("Off", false);
					input.options.add(opt);
					opt = new Option("On", true);
					input.options.add(opt);
				} else {
					continue;
				}
				
				if (getById("popupSelector_constraints_video").style.display == "none"){
					getById("advancedOptionsCamera").style.display="inline-block";
				}
				
				input.id = "constraints_"+i;
				input.className="constraintCameraInput";
				input.name = "constraints_"+i;
				input.style = "display:inline; padding:2px; margin:0 10px;";
				input.dataset.keyname = i;
				input.onchange = function(e){
					//getById("label_"+e.target.dataset.keyname).innerHTML =e.target.dataset.keyname+": "+e.target.value;
					updateCameraConstraints(e.target.dataset.keyname, e.target.value);
					log(e.target.dataset.keyname, e.target.value);
				};
				getById("popupSelector_constraints_video").appendChild(div);
				div.appendChild(label);
				div.appendChild(input);
			} else if (typeof session.cameraConstraints[i] === 'boolean'){
				
				var div = document.createElement("div");
				var label = document.createElement("label");
				label.id= "label_"+i;
				label.htmlFor = "constraints_"+i;
				label.innerHTML = i+":";
				label.style="display:inline-block; padding:0;margin: 15px 0px 29px;"; 
				label.dataset.keyname = i;
				var input = document.createElement("select");
				var c = document.createElement("option");
				
				var opt = new Option("Off", false);
				input.options.add(opt);
				opt = new Option("On", true);
				input.options.add(opt);
				
				if (getById("popupSelector_constraints_video").style.display == "none"){
					getById("advancedOptionsCamera").style.display="inline-block";
				}
				
				input.id = "constraints_"+i;
				input.className="constraintCameraInput";
				input.name = "constraints_"+i;
				input.style = "display:inline; padding:2px; margin:0 10px;";
				input.dataset.keyname = i;
				input.onchange = function(e){
					//getById("label_"+e.target.dataset.keyname).innerHTML =e.target.dataset.keyname+": "+e.target.value;
					updateCameraConstraints(e.target.dataset.keyname, e.target.value);
					log(e.target.dataset.keyname, e.target.value);
				};
				getById("popupSelector_constraints_video").appendChild(div);
				div.appendChild(label);
				div.appendChild(input);
			}
		} catch(e){errorlog(e);}
			
	}
}
 
function updateCameraConstraints(constraint, value=null){
	var track0 = session.streamSrc.getVideoTracks();
	track0 = track0[0];
	if (value == parseFloat(value)){
		value = parseFloat(value);
	} else if (value == "true"){
		value = true;
	} else if (value == "false"){
		value = false;
	}
	log({advanced: [ {[constraint]: value} ]});
	track0.applyConstraints({advanced: [ {[constraint]: value} ]});
	return;
	
}
  
function setupWebcamSelection(stream=null){
	log("setup webcam");
	
	if (stream){
		log(getById("previewWebcam"));
		session.streamSrc = stream;
		getById("previewWebcam").srcObject = outboundAudioPipeline(session.streamSrc);
		//session.videoElement = getById("previewWebcam");
	} else {
		log("THIS IS NO STREAM??");
	}
	
	if (!session.videoElement){
		session.videoElement = getById("previewWebcam");
	}
	
	try {
		return enumerateDevices().then(gotDevices).then(function(){
			
			
			if (parseInt(getById("webcamquality").elements.namedItem("resolution").value)==3){
				session.maxframerate  = 30;
			} else {
				session.maxframerate = false;
			}
			
			//if ((iOS) || (iPad)){
				//getById("multiselect1").parentNode.style.visibility="hidden";
				//getById("multiselect1").parentNode.style.height="0px";
				//getById("multiselecta1").parentNode.style.height="0px";
				//getById("multiselecta1").parentNode.style.visibility="hidden";
			//}
			
			var audioSelect = document.querySelector('#audioSource');
			var videoSelect = document.querySelector('select#videoSourceSelect');
			var outputSelect = document.querySelector('select#outputSource');
			
			audioSelect.onchange = function(){
				
				var gowebcam = getById("gowebcam");
				if (gowebcam){
					gowebcam.disabled = true;
					gowebcam.dataset.ready = "true";
					gowebcam.style.backgroundColor = "#DDDDDD";
					gowebcam.style.fontWeight="normal";
					gowebcam.innerHTML = "Waiting for Camera to load";
					miniTranslate(gowebcam,"waiting-for-camera-to-load");
				}
				activatedPreview=false;
				grabAudio();
			};
			videoSelect.onchange = function(){
				
				var gowebcam = getById("gowebcam");
				if(gowebcam){
					gowebcam.disabled = true;
					gowebcam.dataset.ready = "true";
					gowebcam.style.backgroundColor = "#DDDDDD";
					gowebcam.style.fontWeight="normal";
					gowebcam.innerHTML = "Waiting for Camera to load";
					miniTranslate(gowebcam,"waiting-for-camera-to-load");
				}
				warnlog("video source changed");
				
				activatedPreview=false;
				if (session.quality!==false){
					grabVideo(session.quality);
				} else {
					session.quality_wb = parseInt(getById("webcamquality").elements.namedItem("resolution").value);
					grabVideo(session.quality_wb);
				}
			};
			
			outputSelect.onchange = function(){
				
				if ((iOS) || (iPad)){
					return;
				}
				
				session.sink = outputSelect.options[outputSelect.selectedIndex].value;
				//if (session.sink=="default"){session.sink=false;} else {
					getById("previewWebcam").setSinkId(session.sink).then(() => {
						log("New Output Device:"+session.sink);
					}).catch(error => {
						errorlog("6597");
						errorlog(error);
						//setTimeout(function(){alert("Failed to change audio output destination.");},1);
					});
				//}
			}
			
			getById("webcamquality").onchange = function(){
				var gowebcam = getById("gowebcam");
				if (gowebcam){
					gowebcam.disabled = true;
					gowebcam.dataset.ready = "true";
					gowebcam.style.backgroundColor = "#DDDDDD";
					gowebcam.style.fontWeight="normal";
					gowebcam.innerHTML = "Waiting for Camera to load";
					miniTranslate(gowebcam,"waiting-for-camera-to-load");
				}
				
				if (parseInt(getById("webcamquality").elements.namedItem("resolution").value)==3){
					session.maxframerate  = 30;
				} else {
					session.maxframerate = false;
				}
				activatedPreview=false;
				session.quality_wb = parseInt(getById("webcamquality").elements.namedItem("resolution").value);
				grabVideo(session.quality_wb);
			};

			if ((session.audioDevice) && (session.audioDevice!==1)){ // change from Auto to Selected Audio Device
				log("SETTING AUDIO DEVICE!!");
				activatedPreview=false;
				grabAudio();
			}

			if (session.videoDevice===0){
				if (session.autostart){
					publishWebcam();  // no need to mirror as there is no video...
					return;
				} else {
					var gowebcam = getById("gowebcam");
					if (gowebcam){
						gowebcam.disabled =false;
						gowebcam.dataset.ready = "true";
						gowebcam.style.backgroundColor = "#3C3";
						gowebcam.style.color = "black";
						gowebcam.style.fontWeight="bold";
						gowebcam.innerHTML = "START";
						miniTranslate(gowebcam,"start");
					}
					return;
				}
			} else {
				log("GRabbing video: "+session.quality);
				activatedPreview = false;
				if (session.quality!==false){
					grabVideo(session.quality);
				} else {
					session.quality_wb = parseInt(getById("webcamquality").elements.namedItem("resolution").value);
					grabVideo(session.quality_wb);
				}
			}
			
			if ((iOS) || (iPad)){
				
				return;
			}
			if (outputSelect.selectedIndex>=0){
				session.sink = outputSelect.options[outputSelect.selectedIndex].value;
			}
			if (document.getElementById("previewWebcam") && document.getElementById("previewWebcam").setSinkId){
				if (session.sink){
					getById("previewWebcam").setSinkId(session.sink).then(() => {
					}).catch(error => {
						errorlog("6665");
						errorlog(error);
					});
				}
			}
			
			
			
			
		}).catch(e => {errorlog(e);})
	} catch (e){errorlog(e);}
}

Promise.wait = function (ms) {
    return new Promise(function (resolve) {
        setTimeout(resolve, ms);
    });
};

Promise.prototype.timeout = function(ms) {
    return Promise.race([
        this, 
        Promise.wait(ms).then(function () {
			var errormsg = new Error("Time Out\nDid you accept camera permissions in time? Please do so first.\n\nOtherwise, do you have NDI Tools installed? Maybe try uninstalling it.\n\nPlease also ensure your camera and audio device are correctly connected and not already in use. You may also need to refresh the page.");
			errormsg.name = "timedOut";
			errormsg.message = "Time Out\nDid you accept camera permissions in time? Please do so first.\n\nOtherwise, do you have NDI Tools installed? Maybe try uninstalling it.\n\nPlease also ensure your camera and audio device are correctly connected and not already in use. You may also need to refresh the page."
			throw errormsg;
            
        })
    ])
};

function previewWebcam(){
	
	if (session.taintedSession===null){
		log("STILL WAITING ON HASH TO VALIDATE")
		setTimeout(function(){previewWebcam();},1000);
		return;
	} else if (session.taintedSession===true){
		warnlog("HASH FAILED; PASSWORD NOT VALID");
		return;
	} else {
		log("NOT TAINTED");
	}
	
	if( activatedPreview == true){
		log("activeated preview return 1");
		return;
	}
	activatedPreview = true;
	
	if (session.audioDevice===0){ // OFF
		var constraint = {audio: false};
	} else if ((session.echoCancellation !== false) && (session.autoGainControl !== false) && (session.noiseSuppression !== false)){ // AUTO
		var constraint = {audio: true};
	} else {                                     // Disable Echo Cancellation and stuff for the PREVIEW (DEFAULT CAM/MIC)
		var constraint = {audio: {}};
		if (session.echoCancellation !== false){ // if not disabled, we assume it's on
			constraint.audio.echoCancellation = true;
		} else {
			constraint.audio.echoCancellation = false;
		}
		if (session.autoGainControl !== false){
			constraint.audio.autoGainControl = true;
		} else {
			constraint.audio.autoGainControl = false;
		}
		if (session.noiseSuppression !== false){
			constraint.audio.noiseSuppression = true;
		} else {
			constraint.audio.noiseSuppression = false;
		}
	}
	
	if (session.videoDevice===0){
		constraint.video = false;
	} else {
		constraint.video = true;
	}
	
//	try {
//		var autoPlayAllowed = false;
//		log("trying to play video");
//		
//		var vid = document.createElement('video');
//		vid.src = ""; // we need this.play();
//		playPromise = vid.play();
//		// In browsers that don’t yet support this functionality,
//		// playPromise won’t be defined.
//		if (playPromise !== undefined) {
//			getById("getPermissions").style.display="";
//			getById("gowebcam").style.display="none";
//			//activatedPreview=false;
//			log("checking promise");
//			log(playPromise);
//			playPromise.catch(function(error) {
//				if (error.name !== 'NotAllowedError') {
//					autoPlayAllowed=true;
//					log("PROMISE GOOD");
//				}
//			}).finally(function() {
//				log("FINALLY ");
//				delete vid;
//				if (autoPlayAllowed) { /////// GOOD //////
//						log("ALLOWED TO PLAY");
//						getById("gowebcam").style.display="";
//						getById("getPermissions").style.display="none";
						enumerateDevices().then(function(devices){
							log("enumeratated");
							log(devices);
							var vtrue = false;
							var atrue = false;
							devices.forEach(function(device) {
								if (device.kind === 'audioinput'){
									atrue=true;
								} else if (device.kind === 'videoinput'){
									vtrue = true;
								}
							});
							if (atrue===false){
								constraint.audio = false;
							} 
							if (vtrue===false){
								constraint.video = false;
							}
							setTimeout(function(constraint){requestBasicPermissions(constraint);},0,constraint);
						}).catch((error)=>{
							log("enumeratated failed. Seeking permissions.");
							setTimeout(function(constraint){requestBasicPermissions(constraint);},0,constraint);
						});
//						return;
//					
//				} else {
//					// BUTTON.
//					log("NOT ALLOWED TO CONTINUE -");
//				}
//			});
//		} else {
//			delete vid;
//			enumerateDevices().then(function(devices){
//				log("enumeratated");
//				log(devices);
//				var vtrue = false;
//				var atrue = false;
//				devices.forEach(function(device) {
//					if (device.kind === 'audioinput'){
//						atrue=true;
//					} else if (device.kind === 'videoinput'){
//						vtrue = true;
//					}
//				});
//				if (atrue===false){
//					constraint.audio = false;
//				} 
//				if (vtrue===false){
//					constraint.video = false;
//				}
//				setTimeout(function(constraint){requestBasicPermissions(constraint);},0,constraint);
//			}).catch((error)=>{
//				log("enumeratated failed. Seeking permissions.");
//				setTimeout(function(constraint){requestBasicPermissions(constraint);},0,constraint);
//			});
//		}
//		
//	} catch(e){
//		setTimeout(function(constraint){requestBasicPermissions(constraint);},0,constraint);
//		errorlog(e);
//	}
}

function requestBasicPermissions(constraint={video:true,audio:true}){
	if (session.taintedSession===null){
		log("STILL WAITING ON HASH TO VALIDATE")
		setTimeout(function(constraint){requestBasicPermissions(constraint);},1000,constraint);
		return;
	} else if (session.taintedSession===true){
		warnlog("HASH FAILED; PASSWORD NOT VALID");
		return;
	} else {
		log("NOT TAINTED 1");
	}
	setTimeout(function(){
	getById("getPermissions").style.display="none";
	getById("gowebcam").style.display="";
	},0);
	log("REQUESTING BASIC PERMISSIONS");
	
	try {
	  var timerBasicCheck=null;
	  if (!(session.cleanOutput)){
		log("Setting Timer for getUserMedia");
		timerBasicCheck = setTimeout(function(){
			if (!(session.cleanOutput)){
				alert("Camera Access Request Timed Out\nDid you accept camera permissions? Please do so first.\n\nOtherwise, do you have NDI Tools installed? Maybe try uninstalling NDI tools.\n\nPlease also ensure that your camera and audio devices are correctly connected and not already in use. You may also need to refresh the page.");
			}},10000);
	  }
	  log(constraint);
	  navigator.mediaDevices.getUserMedia(constraint).then(function(stream){ // Apple needs thi to happen before I can access EnumerateDevices. 
	  log("got first stream");
	    clearTimeout(timerBasicCheck);
		
		setupWebcamSelection(stream);
	  }).catch(function(err){
		    clearTimeout(timerBasicCheck);
			warnlog("some error with GetUSERMEDIA");
			errorlog(err); /* handle the error */
			if (err.name == "NotFoundError" || err.name == "DevicesNotFoundError") {
				//required track is missing 
			} else if (err.name == "NotReadableError" || err.name == "TrackStartError") {
				//webcam or mic are already in use 
			} else if (err.name == "OverconstrainedError" || err.name == "ConstraintNotSatisfiedError") {
				//constraints can not be satisfied by avb. devices 
			} else if (err.name == "NotAllowedError" || err.name == "PermissionDeniedError") {
				//permission denied in browser 
				if (!(session.cleanOutput)){
					setTimeout(function(){alert("Permissions denied. Please ensure you have allowed the mic/camera permissions.");},1);
				}
				return;
			} else if (err.name == "TypeError" || err.name == "TypeError") {
				//empty constraints object 
			}  else {
				//permission denied in browser 
				if (!(session.cleanOutput)){
					setTimeout(function(){alert(err);},1);
				}
			}
		  errorlog("trying to list webcam again");
		  setupWebcamSelection();
	  });
	} catch (e){
		errorlog(e);
		if (!(session.cleanOutput)){
			if (window.isSecureContext) {
				alert("An error has occured when trying to access the webcam or microphone. The reason is not known.");
			} else if ((iOS) || (iPad)){
				alert("iOS version 13.4 and up is generally recommended; older than iOS 11 is not supported.");
			} else {
				alert("Error acessing camera or microphone.\n\nThe website may be loaded in an insecure context.\n\nPlease see: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia");
			}
		}
	}
}


function copyFunction(copyText) {

	try {
		copyText.select();
		copyText.setSelectionRange(0, 99999);
		document.execCommand("copy");
	} catch(e) {
		var dummy = document.createElement('input');
		document.body.appendChild(dummy);
		dummy.value = copyText;
		dummy.select();
		document.execCommand('copy');
		document.body.removeChild(dummy);
		return false;
	}
}

function generateQRPage(){
	var pass = sanitizePassword(getById("invite_password").value);
	if (pass.length){
		return session.generateHash(pass+session.salt,4).then(function(hash){
			generateQRPageCallback(hash);
		});
	} else {
		generateQRPageCallback("");
	}
}

function updateLink(arg, input){
	log(input.dataset.param);
	if (input.checked){
		
		getById("director_block_"+arg).dataset.raw += input.dataset.param;
		
		var string = getById("director_block_"+arg).dataset.raw;
		
		if (getById("obfuscate_director_"+arg).checked){
			string = obfuscateURL(string);
		}
		
		
		getById("director_block_"+arg).href = string;
		getById("director_block_"+arg).innerText = string;
	} else {
		var string = getById("director_block_"+arg).dataset.raw+"&";
		string = string.replace(input.dataset.param+"&", "&");
		string = string.substring(0, string.length - 1);
		getById("director_block_"+arg).dataset.raw = string;
		
		if (getById("obfuscate_director_"+arg).checked){
			string = obfuscateURL(string);
		}
		
		getById("director_block_"+arg).href = string;
		getById("director_block_"+arg).innerText = string;
	}
}

function resetGen(){
		getById("gencontent").style.display="block";
		getById("gencontent2").style.display="none";
		getById("gencontent2").className=""; //container-inner
		getById("gencontent").className="container-inner"; //
		getById("gencontent2").innerHTML ="";
		getById("videoname4").focus();
}

function generateQRPageCallback(hash){
	try{
		var title = getById("videoname4").value;
		if (title.length){
			title = title.replace(/[\W]+/g,"_").replace(/_+/g, '_'); // but not what others might get.
			title = "&label="+title;
		}
		var sid = session.generateStreamID(); 
		
		var viewstr = "";
		var sendstr = "";
		
		if (getById("invite_bitrate").checked){
			viewstr+="&bitrate=20000";
		}
		if (getById("invite_vp9").checked){
			viewstr+="&codec=vp9";
		}
		if (getById("invite_stereo").checked){
			viewstr+="&stereo";
			sendstr+="&stereo";
		}
		if (getById("invite_automic").checked){
			sendstr+="&audiodevice=1";
		}
		if (getById("invite_hidescreen").checked){
			sendstr+="&webcam";
		}
		
		if (getById("invite_remotecontrol").checked){  //
			var remote_gen_id = session.generateStreamID();
			sendstr+="&remote="+remote_gen_id; // security
			viewstr+="&remote="+remote_gen_id;
		}
		
		if (getById("invite_joinroom").value.trim().length){
			sendstr+="&room="+getById("invite_joinroom").value.trim();
			viewstr+="&scene&room="+getById("invite_joinroom").value.trim();
		}
		
		if (getById("invite_password").value.trim().length){
			sendstr+="&hash="+hash;
			viewstr+="&password="+getById("invite_password").value.trim();
		}
		
		
		if (getById("invite_group_chat_type").value){ //  0 is default
			if (getById("invite_group_chat_type").value==1){ // no video
				sendstr+="&novideo";
			} else if (getById("invite_group_chat_type").value==2){  // no view or audio
				sendstr+="&view";
			}
		}
		
		if (getById("invite_quality").value){
			if (getById("invite_quality").value==0){
				sendstr+="&quality=0";
			} else if (getById("invite_quality").value==1){
				sendstr+="&quality=1";
			} else if (getById("invite_quality").value==2){
				sendstr+="&quality=2";
			}
		}
		
		sendstr = 'https://' + location.host + location.pathname + '?push=' + sid + sendstr + title;
		
		if (getById("invite_obfuscate").checked){
			sendstr = obfuscateURL(sendstr);
		}
		
		viewstr = 'https://' + location.host+ location.pathname + '?view=' + sid + viewstr + title;
		getById("gencontent").style.display="none";
		getById("gencontent").className=""; //
		getById("gencontent2").style.display="block";
		getById("gencontent2").className="container-inner"; //
		getById("gencontent2").innerHTML = '<br /><div id="qrcode" style="background-color:white;display:inline-block;color:black;max-width:380px;padding:35px 40px 40px 40px;">\
		<h2 style="margin:0 0 8px 0;color:black"  data-translate="invite-link">Guest Invite Link:</h2>\
		<a class="task grabLinks" title="Click to copy guest invite link to clipboard" onclick="popupMessage(event);copyFunction(this)" onmousedown="copyFunction(this)"  \
		style="word-break: break-all;cursor:copy;background-color:#CFC;border: 2px solid black;width:300px;padding:8px;margin:0px;color:#000;"  href="' + sendstr + '" >'+sendstr+' <i class="las la-paperclip" style="cursor:pointer"></i></a><br /><br /></div>\
			<br /><br />and don\'t forget the<h2 style="color:black">OBS Browser Source Link:</h2><a class="task grabLinks" title="Click to copy or just Drag the link directly into OBS" data-drag="1" onmousedown="copyFunction(this)" onclick="popupMessage(event);copyFunction(this)"  style="word-break: break-all;margin:0px;cursor:grab;background-color:#FCC;width:380px;padding:10px;border:2px solid black;margin:5px;color:#000;" href="' + viewstr + '" >'+viewstr+' <i class="las la-paperclip" style="cursor:pointer"></i></a> \
			<br /><br />\
		<span data-translate="please-note-invite-ingestion-link">This invite link and OBS ingestion link are reusable. Only one person may use a specific invite at a time.</span><br /><br /><button onclick="resetGen();">Create Another Invite Link</button>';
		var qrcode = new QRCode(getById("qrcode"), {
			width : 300,
			height : 300,
			colorDark : "#000000",
			colorLight : "#FFFFFF",
			useSVG: false
		});
		qrcode.makeCode(sendstr);
		setTimeout(function(){getById("qrcode").title="";},100); // i really hate the title overlay that the qrcode function makes

	} catch(e){
		errorlog(e);
	}
}


if (session.view){
	getById("main").className = "";
	getById("credits").style.display = 'none';
	try{
		if (session.label===false){
			if (document.title==""){
				document.title = "View="+session.view.toString();
			} else {
				document.title += ", View="+session.view.toString();
			}
		}
	} catch(e){errorlog(e);};
}


if ((session.view) && (session.roomid===false)){
	getById("container-4").className = 'column columnfade';
	getById("container-3").className = 'column columnfade';
	getById("container-2").className = 'column columnfade';
	getById("container-1").className = 'column columnfade';
	//getById("header").className = 'advanced';
	getById("info").className = 'advanced';
	getById("header").className = 'advanced';
	getById("head1").className = 'advanced';
	getById("head2").className = 'advanced';
	getById("head3").className = 'advanced';

	getById("mainmenu").style.backgroundRepeat = "no-repeat";
	getById("mainmenu").style.backgroundPosition = "bottom center";
	getById("mainmenu").style.minHeight = "300px";
	getById("mainmenu").style.backgroundSize = "100px 100px";
	getById("mainmenu").innerHTML = '';
	
	setTimeout(function(){
		try{
			if ((session.view) && (!(session.cleanOutput))){
				if (document.getElementById("mainmenu")){
					getById("mainmenu").style.backgroundImage = "url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/Pgo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPgo8c3ZnIHdpZHRoPSI0MHB4IiBoZWlnaHQ9IjQwcHgiIHZpZXdCb3g9IjAgMCA0MCA0MCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4bWw6c3BhY2U9InByZXNlcnZlIiBzdHlsZT0iZmlsbC1ydWxlOmV2ZW5vZGQ7Y2xpcC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO3N0cm9rZS1taXRlcmxpbWl0OjEuNDE0MjE7IiB4PSIwcHgiIHk9IjBweCI+CiAgICA8ZGVmcz4KICAgICAgICA8c3R5bGUgdHlwZT0idGV4dC9jc3MiPjwhW0NEQVRBWwogICAgICAgICAgICBALXdlYmtpdC1rZXlmcmFtZXMgc3BpbiB7CiAgICAgICAgICAgICAgZnJvbSB7CiAgICAgICAgICAgICAgICAtd2Via2l0LXRyYW5zZm9ybTogcm90YXRlKDBkZWcpCiAgICAgICAgICAgICAgfQogICAgICAgICAgICAgIHRvIHsKICAgICAgICAgICAgICAgIC13ZWJraXQtdHJhbnNmb3JtOiByb3RhdGUoLTM1OWRlZykKICAgICAgICAgICAgICB9CiAgICAgICAgICAgIH0KICAgICAgICAgICAgQGtleWZyYW1lcyBzcGluIHsKICAgICAgICAgICAgICBmcm9tIHsKICAgICAgICAgICAgICAgIHRyYW5zZm9ybTogcm90YXRlKDBkZWcpCiAgICAgICAgICAgICAgfQogICAgICAgICAgICAgIHRvIHsKICAgICAgICAgICAgICAgIHRyYW5zZm9ybTogcm90YXRlKC0zNTlkZWcpCiAgICAgICAgICAgICAgfQogICAgICAgICAgICB9CiAgICAgICAgICAgIHN2ZyB7CiAgICAgICAgICAgICAgICAtd2Via2l0LXRyYW5zZm9ybS1vcmlnaW46IDUwJSA1MCU7CiAgICAgICAgICAgICAgICAtd2Via2l0LWFuaW1hdGlvbjogc3BpbiAxLjVzIGxpbmVhciBpbmZpbml0ZTsKICAgICAgICAgICAgICAgIC13ZWJraXQtYmFja2ZhY2UtdmlzaWJpbGl0eTogaGlkZGVuOwogICAgICAgICAgICAgICAgYW5pbWF0aW9uOiBzcGluIDEuNXMgbGluZWFyIGluZmluaXRlOwogICAgICAgICAgICB9CiAgICAgICAgXV0+PC9zdHlsZT4KICAgIDwvZGVmcz4KICAgIDxnIGlkPSJvdXRlciI+CiAgICAgICAgPGc+CiAgICAgICAgICAgIDxwYXRoIGQ9Ik0yMCwwQzIyLjIwNTgsMCAyMy45OTM5LDEuNzg4MTMgMjMuOTkzOSwzLjk5MzlDMjMuOTkzOSw2LjE5OTY4IDIyLjIwNTgsNy45ODc4MSAyMCw3Ljk4NzgxQzE3Ljc5NDIsNy45ODc4MSAxNi4wMDYxLDYuMTk5NjggMTYuMDA2MSwzLjk5MzlDMTYuMDA2MSwxLjc4ODEzIDE3Ljc5NDIsMCAyMCwwWiIgc3R5bGU9ImZpbGw6YmxhY2s7Ii8+CiAgICAgICAgPC9nPgogICAgICAgIDxnPgogICAgICAgICAgICA8cGF0aCBkPSJNNS44NTc4Niw1Ljg1Nzg2QzcuNDE3NTgsNC4yOTgxNSA5Ljk0NjM4LDQuMjk4MTUgMTEuNTA2MSw1Ljg1Nzg2QzEzLjA2NTgsNy40MTc1OCAxMy4wNjU4LDkuOTQ2MzggMTEuNTA2MSwxMS41MDYxQzkuOTQ2MzgsMTMuMDY1OCA3LjQxNzU4LDEzLjA2NTggNS44NTc4NiwxMS41MDYxQzQuMjk4MTUsOS45NDYzOCA0LjI5ODE1LDcuNDE3NTggNS44NTc4Niw1Ljg1Nzg2WiIgc3R5bGU9ImZpbGw6cmdiKDIxMCwyMTAsMjEwKTsiLz4KICAgICAgICA8L2c+CiAgICAgICAgPGc+CiAgICAgICAgICAgIDxwYXRoIGQ9Ik0yMCwzMi4wMTIyQzIyLjIwNTgsMzIuMDEyMiAyMy45OTM5LDMzLjgwMDMgMjMuOTkzOSwzNi4wMDYxQzIzLjk5MzksMzguMjExOSAyMi4yMDU4LDQwIDIwLDQwQzE3Ljc5NDIsNDAgMTYuMDA2MSwzOC4yMTE5IDE2LjAwNjEsMzYuMDA2MUMxNi4wMDYxLDMzLjgwMDMgMTcuNzk0MiwzMi4wMTIyIDIwLDMyLjAxMjJaIiBzdHlsZT0iZmlsbDpyZ2IoMTMwLDEzMCwxMzApOyIvPgogICAgICAgIDwvZz4KICAgICAgICA8Zz4KICAgICAgICAgICAgPHBhdGggZD0iTTI4LjQ5MzksMjguNDkzOUMzMC4wNTM2LDI2LjkzNDIgMzIuNTgyNCwyNi45MzQyIDM0LjE0MjEsMjguNDkzOUMzNS43MDE5LDMwLjA1MzYgMzUuNzAxOSwzMi41ODI0IDM0LjE0MjEsMzQuMTQyMUMzMi41ODI0LDM1LjcwMTkgMzAuMDUzNiwzNS43MDE5IDI4LjQ5MzksMzQuMTQyMUMyNi45MzQyLDMyLjU4MjQgMjYuOTM0MiwzMC4wNTM2IDI4LjQ5MzksMjguNDkzOVoiIHN0eWxlPSJmaWxsOnJnYigxMDEsMTAxLDEwMSk7Ii8+CiAgICAgICAgPC9nPgogICAgICAgIDxnPgogICAgICAgICAgICA8cGF0aCBkPSJNMy45OTM5LDE2LjAwNjFDNi4xOTk2OCwxNi4wMDYxIDcuOTg3ODEsMTcuNzk0MiA3Ljk4NzgxLDIwQzcuOTg3ODEsMjIuMjA1OCA2LjE5OTY4LDIzLjk5MzkgMy45OTM5LDIzLjk5MzlDMS43ODgxMywyMy45OTM5IDAsMjIuMjA1OCAwLDIwQzAsMTcuNzk0MiAxLjc4ODEzLDE2LjAwNjEgMy45OTM5LDE2LjAwNjFaIiBzdHlsZT0iZmlsbDpyZ2IoMTg3LDE4NywxODcpOyIvPgogICAgICAgIDwvZz4KICAgICAgICA8Zz4KICAgICAgICAgICAgPHBhdGggZD0iTTUuODU3ODYsMjguNDkzOUM3LjQxNzU4LDI2LjkzNDIgOS45NDYzOCwyNi45MzQyIDExLjUwNjEsMjguNDkzOUMxMy4wNjU4LDMwLjA1MzYgMTMuMDY1OCwzMi41ODI0IDExLjUwNjEsMzQuMTQyMUM5Ljk0NjM4LDM1LjcwMTkgNy40MTc1OCwzNS43MDE5IDUuODU3ODYsMzQuMTQyMUM0LjI5ODE1LDMyLjU4MjQgNC4yOTgxNSwzMC4wNTM2IDUuODU3ODYsMjguNDkzOVoiIHN0eWxlPSJmaWxsOnJnYigxNjQsMTY0LDE2NCk7Ii8+CiAgICAgICAgPC9nPgogICAgICAgIDxnPgogICAgICAgICAgICA8cGF0aCBkPSJNMzYuMDA2MSwxNi4wMDYxQzM4LjIxMTksMTYuMDA2MSA0MCwxNy43OTQyIDQwLDIwQzQwLDIyLjIwNTggMzguMjExOSwyMy45OTM5IDM2LjAwNjEsMjMuOTkzOUMzMy44MDAzLDIzLjk5MzkgMzIuMDEyMiwyMi4yMDU4IDMyLjAxMjIsMjBDMzIuMDEyMiwxNy43OTQyIDMzLjgwMDMsMTYuMDA2MSAzNi4wMDYxLDE2LjAwNjFaIiBzdHlsZT0iZmlsbDpyZ2IoNzQsNzQsNzQpOyIvPgogICAgICAgIDwvZz4KICAgICAgICA8Zz4KICAgICAgICAgICAgPHBhdGggZD0iTTI4LjQ5MzksNS44NTc4NkMzMC4wNTM2LDQuMjk4MTUgMzIuNTgyNCw0LjI5ODE1IDM0LjE0MjEsNS44NTc4NkMzNS43MDE5LDcuNDE3NTggMzUuNzAxOSw5Ljk0NjM4IDM0LjE0MjEsMTEuNTA2MUMzMi41ODI0LDEzLjA2NTggMzAuMDUzNiwxMy4wNjU4IDI4LjQ5MzksMTEuNTA2MUMyNi45MzQyLDkuOTQ2MzggMjYuOTM0Miw3LjQxNzU4IDI4LjQ5MzksNS44NTc4NloiIHN0eWxlPSJmaWxsOnJnYig1MCw1MCw1MCk7Ii8+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4K')";
					getById("mainmenu").innerHTML = '<font style="color:#666"><h1 data-translate="attempting-to-load">Attempting to load video stream.</h1></font>';
					getById("mainmenu").innerHTML += '<font style="color:#EEE" data-translate="stream-not-available-yet">The stream is not available yet or an error occured.</font><br/><button onclick="location.reload();" data-translate="try-manually">Retry Manually</button><br/>';
					
				}}
		} catch(e){
			errorlog("Error handling QR Code failure");
		}
	},15000);

	log("auto playing");

	if (navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1){ 
		if (!(session.cleanOutput)){
			alert("Safari requires us to ask for an audio permission to use peer-to-peer technology. You will need to accept it in a moment if asked to view this live video");
		}
		navigator.mediaDevices.getUserMedia({audio: true}).then(function(){
			play();
		}).catch(function(){
			play();
		});
	} else {
		play();
		//getById("mainmenu").style.display="none";
	}
} else if (session.roomid){
	try{
		if (session.label===false){
			if (document.title==""){
				document.title = "Room="+session.roomid.toString();
			} else {
				document.title += ", Room="+session.roomid.toString();
			}
		}
	} catch(e){errorlog(e);};
	
}



var vis = (function(){
	var stateKey, eventKey, keys = {
		hidden: "visibilitychange",
		webkitHidden: "webkitvisibilitychange",
		mozHidden: "mozvisibilitychange",
		msHidden: "msvisibilitychange"
	};
	for (stateKey in keys) {
		if (stateKey in document) {
			eventKey = keys[stateKey];
			break;
		}
	}
	return function(c) {
		if (c) {
			document.addEventListener(eventKey, c);
			//document.addEventListener("blur", c);
			//document.addEventListener("focus", c);
		}
		return !document[stateKey];
	};
})();

(function rightclickmenuthing() {  // right click menu
  
  "use strict";

  function clickInsideElement( e, className ) {
    var el = e.srcElement || e.target;
    
    if ( el.classList.contains(className) ) {
      return el;
    } else {
      while ( el = el.parentNode ) {
        if ( el.classList && el.classList.contains(className) ) {
          return el;
        }
      }
    }

    return false;
  }

  /**
   * Get's exact position of event.
   * 
   * @param {Object} e The event passed in
   * @return {Object} Returns the x and y position
   */
  function getPosition(event2) {
    var posx = 0;
    var posy = 0;

    if (!event2) var event = window.event;
    
    if (event2.pageX || event2.pageY) {
      posx = event2.pageX;
      posy = event2.pageY;
    } else if (event2.clientX || event2.clientY) {
      posx = event2.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
      posy = event2.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }

    return {
      x: posx,
      y: posy
    };
  }

  var contextMenuClassName = "context-menu";
  var contextMenuItemClassName = "context-menu__item";
  var contextMenuLinkClassName = "context-menu__link";
  var contextMenuActive = "context-menu--active";

  var taskItemClassName = "task";
  var taskItemInContext;

  var clickCoords;
  var clickCoordsX;
  var clickCoordsY;

  var menu = document.querySelector("#context-menu");
  var menuItems = menu.querySelectorAll(".context-menu__item");
  var menuState = 0;
  var menuWidth;
  var menuHeight;
  var menuPosition;
  var menuPositionX;
  var menuPositionY;

  var windowWidth;
  var windowHeight;

  /**
   * Initialise our application's code.
   */
  function init() {
    contextListener();
    clickListener();
    keyupListener();
    resizeListener();
  }

  /**
   * Listens for contextmenu events.
   */
  function contextListener() {
    document.addEventListener( "contextmenu", function(e) {
      taskItemInContext = clickInsideElement( e, taskItemClassName );

      if ( taskItemInContext ) {
        e.preventDefault();
        toggleMenuOn();
        positionMenu(e);
      } else {
        taskItemInContext = null;
        toggleMenuOff();
      }
    });
  }

  /**
   * Listens for click events.
   */
  function clickListener() {
    document.addEventListener( "click", function(e) {
      var clickeElIsLink = clickInsideElement( e, contextMenuLinkClassName );

      if ( clickeElIsLink ) {
        e.preventDefault();
        menuItemListener( clickeElIsLink );
      } else {
        var button = e.which || e.button;
        if ( button === 1 ) {
          toggleMenuOff();
        }
      }
    });
  }

  /**
   * Listens for keyup events.
   */
  function keyupListener() {
    window.onkeyup = function(e) {
      if ( e.keyCode === 27 ) {
        toggleMenuOff();
      }
    };
  }

  /**
   * Window resize event listener
   */
  function resizeListener() {
    window.onresize = function(e) {
      toggleMenuOff();
    };
  }

  /**
   * Turns the custom context menu on.
   */
  function toggleMenuOn() {
    if ( menuState !== 1 ) {
      menuState = 1;
      menu.classList.add( contextMenuActive );
    }
  }

  /**
   * Turns the custom context menu off.
   */
  function toggleMenuOff() {
    if ( menuState !== 0 ) {
      menuState = 0;
      menu.classList.remove( contextMenuActive );
    }
  }

  /**
   * Positions the menu properly.
   * 
   * @param {Object} e The event
   */
  function positionMenu(e) {
    clickCoords = getPosition(e);
    clickCoordsX = clickCoords.x;
    clickCoordsY = clickCoords.y;

    menuWidth = menu.offsetWidth + 4;
    menuHeight = menu.offsetHeight + 4;

    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;

    if ( (windowWidth - clickCoordsX) < menuWidth ) {
      menu.style.left = windowWidth - menuWidth + "px";
    } else {
      menu.style.left = clickCoordsX + "px";
    }

    if ( (windowHeight - clickCoordsY) < menuHeight ) {
      menu.style.top = windowHeight - menuHeight + "px";
    } else {
      menu.style.top = clickCoordsY + "px";
    }
  }

  /**
   * Dummy action function that logs an action when a menu item link is clicked
   * 
   * @param {HTMLElement} link The link that was clicked
   */
  function menuItemListener(  link ) {
	if (link.getAttribute("data-action")=="Open"){
		window.open(taskItemInContext.value);
	} else {
		// nothing needed
	}
    log( "Task ID - " + taskItemInContext + ", Task action - " + link.getAttribute("data-action"));
    toggleMenuOff();
  }

  /**
   * Run the app.
   */
  init();

})();

document.addEventListener("dragstart", event => {
	var url = event.target.href || event.target.value;
	if (!url || !url.startsWith('https://')) return;
	if (event.target.dataset.drag!="1"){
		return;
	}
	//event.target.ondragend = function(){event.target.blur();}
	
	var streamId = url.split('view=');
	var label = url.split('label=');

	if (session.label!==false){
		url += '&layer-name='+session.label;
	} else {
		url += '&layer-name=OBS.Ninja';
	}
	if (streamId.length>1) url += ': ' + streamId[1].split('&')[0];
	if (label.length>1) url += ' - ' + decodeURI(label[1].split('&')[0]);
	
	try{
		if (document.getElementById("videosource")){
			var video = getById('videosource');
			if (typeof(video.videoWidth) == "undefined"){
				url += '&layer-width=1920'; // this isn't always 100% correct, as the resolution can fluxuate, but it is probably good enough
				url += '&layer-height=1080';
			} else if ((parseInt(video.videoWidth)<360) || (video.videoHeight<640)){
				url += '&layer-width=1920'; // this isn't always 100% correct, as the resolution can fluxuate, but it is probably good enough
				url += '&layer-height=1080';
			} else {
				url += '&layer-width=' + video.videoWidth; // this isn't always 100% correct, as the resolution can fluxuate, but it is probably good enough
				url += '&layer-height=' + video.videoHeight;
			}
		} else {
			url += '&layer-width=1920'; // this isn't always 100% correct, as the resolution can fluxuate, but it is probably good enough
			url += '&layer-height=1080';
		}
	} catch(error){
		url += '&layer-width=1920'; // this isn't always 100% correct, as the resolution can fluxuate, but it is probably good enough
		url += '&layer-height=1080';
	}
	
	event.dataTransfer.setDragImage(document.querySelector('#dragImage'), 24, 24);
	event.dataTransfer.setData("text/uri-list", encodeURI(url));
	//event.dataTransfer.setData("url", encodeURI(url));
	
	//warnlog(event);
	
});
function popupMessage(e, message="Copied to Clipboard"){  // right click menu
  
    var posx = 0;
    var posy = 0;

    if (!e) var e = window.event;
    
    if (e.pageX || e.pageY) {
		posx = e.pageX;
		posy = e.pageY;
    } else if (e.clientX || e.clientY) {
		posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
		posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }

	posx += 10;


	var menu = document.querySelector("#messagePopup");
	menu.innerHTML = "<center>"+message+"</center>";
	var menuState = 0;
	var menuWidth;
	var menuHeight;
	var menuPosition;
	var menuPositionX;
	var menuPositionY;

	var windowWidth;
	var windowHeight;

    if ( menuState !== 1 ) {
		menuState = 1;
		menu.classList.add( "context-menu--active" );
	}

    menuWidth = menu.offsetWidth + 4;
    menuHeight = menu.offsetHeight + 4;

    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;

    if ( (windowWidth - posx) < menuWidth ) {
		menu.style.left = windowWidth - menuWidth + "px";
    } else {
		menu.style.left = posx + "px";
    }

    if ( (windowHeight - posy) < menuHeight ) {
		menu.style.top = windowHeight - menuHeight + "px";
    } else {
		menu.style.top = posy + "px";
    }
	
	function toggleMenuOff() {
		if ( menuState !== 0 ) {
		  menuState = 0;
		  menu.classList.remove( "context-menu--active" );
		}
	}
	setTimeout(function(){toggleMenuOff();},1000);
	event.preventDefault();
}

function timeSince(date) {

  var seconds = Math.floor((new Date() - date) / 1000);

  var interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + " years";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + " months";
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + " days";
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + " hours";
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + " minutes";
  }
  return "Seconds ago";
}
var chatUpdateTimeout = null;
var messageList = []

function sendChatMessage(chatMsg = false){ // filtered + visual
	var data = {};
	if (chatMsg===false){
		var msg = document.getElementById('chatInput').value;
	} else {
		var msg = chatMsg;
	}
	if (msg==""){return;}
	sendChat(msg); // send message to peers
	data.time = Date.now();
	data.msg = sanitize(msg); // this is what the other person should see
	data.label = false;
	data.type = "sent";
	document.getElementById('chatInput').value = "";
	messageList.push(data);
	messageList = messageList.slice(-100);
	if (session.broadcastChannel!==false){
		log(session.broadcastChannel);
		session.broadcastChannel.postMessage(data);
	}
	updateMessages();
}

function toggleQualityDirector(bitrate, UUID, ele = null){  // ele is specific to the button in the director's room
	var eles = ele.parentNode.childNodes;
	for (i in eles){
		eles[i].className="";
	}
	ele.className="pressed";
	session.requestRateLimit(bitrate, UUID);
}

function createPopoutChat(){
	var randid = session.generateStreamID(8);
	log(randid);
	window.open('./popout?id='+randid,'popup','width=600,height=480,toolbar=no,menubar=no,resizable=yes');
	session.broadcastChannel = new BroadcastChannel(randid);
	session.broadcastChannel.onmessage = function (e) {
		if ("loaded" in e.data){
			session.broadcastChannel.postMessage({messageList:messageList});
		} else if ("msg" in e.data){
			sendChatMessage(e.data.msg);
		}
	}
	return false;
}

function getChatMessage(msg, label=false, director=false, overlay=false){
	msg = sanitize(msg); // keep it clean.
	if (msg==""){return;}
	data = {};
	data.time = Date.now();
	data.msg = msg;
	if (label){
		data.label = label.replace(/[\W]+/g,"_").replace(/_+/g, ' ');
		if (director){
			data.label  =  "<b><i>" + data.label +":</i></b> ";
		} else {
			data.label  =  "<b>" + data.label +":</b> ";
		}
	} else if (director){
		data.label  =  "<b><i>Director:</i></b> ";
	} else {
		data.label = "";
	}
	data.type = "recv";
	messageList.push(data);
	messageList = messageList.slice(-100);
	updateMessages();
	
	if (overlay){
		var textOverlay = getById("overlayMsgs");
		if (textOverlay){
			var spanOverlay = document.createElement("span");
			spanOverlay.innerHTML = "<b><i>Director:</i></b> "+msg+"<br />";
			textOverlay.appendChild(spanOverlay);
			textOverlay.style.display="block";
			var showtime = msg.length*200+3000;
			if (showtime>8000){showtime=8000;}
			setTimeout(function(ele){ele.parentNode.removeChild(ele);},showtime,spanOverlay);
		}
	}
	
	if (session.chat==false){
		getById("chattoggle").className="las la-comments my-float toggleSize puslate";
		getById("chatbutton").className="float";
		
		if (getById("chatNotification").value){
			getById("chatNotification").value = getById("chatNotification").value+1;
		} else {
			getById("chatNotification").value = 1;
		}
		getById("chatNotification").classList.add("notification");
		
		//if (getById("chatNotification").value>99){
		//	getById("chatNotification").innerHTML = "!";
		//} else {
		//	getById("chatNotification").innerHTML = getById("chatNotification").value;
		//}
	}
	
	if (parent){
		parent.postMessage({"gotChat": data }, "*");
	}
	if (session.broadcastChannel!==false){
		session.broadcastChannel.postMessage(data); /* send */
	}
	
}

function updateMessages(){
	document.getElementById("chatBody").innerHTML = "";
	for (i in messageList){
		
		var time = timeSince(messageList[i].time);
		var msg = document.createElement("div");
		////// KEEP THIS IN /////////
		console.log(messageList[i].msg); // Display Recieved messages for View-Only clients.
		/////////////////////////////
		if (messageList[i].type == "sent"){
			msg.innerHTML = messageList[i].msg + " <i><small> <small>- "+time+"</small></small></i>";
			msg.classList.add("outMessage");
		} else if (messageList[i].type == "recv"){
			var label = "";
			if (messageList[i].label){
				label = messageList[i].label;
			} 
			msg.innerHTML = label+messageList[i].msg + " <i><small> <small>- "+time+"</small></small></i>";
			msg.classList.add("inMessage");
		} else if (messageList[i].type == "alert"){
			msg.innerHTML = messageList[i].msg + " <i><small> <small>- "+time+"</small></small></i>";
			msg.classList.add("inMessage");
		} else {
			msg.innerHTML = messageList[i].msg + " <i><small> <small>- "+time+"</small></small></i>";
			msg.classList.add("inMessage");
		}
		
		document.getElementById("chatBody").appendChild(msg);
	}
	if (chatUpdateTimeout){
		clearInterval(chatUpdateTimeout);
	}
	document.getElementById("chatBody").scrollTop = document.getElementById("chatBody").scrollHeight;
	chatUpdateTimeout = setTimeout(function(){updateMessages()},60000);
}

function sanitize(string) {
	var temp = document.createElement('div');
	temp.textContent = string;
	return temp.innerHTML;
}

function EnterButtonChat(event){
	 // Number 13 is the "Enter" key on the keyboard
	var key = event.which || event.keyCode;
	if (key  === 13) {
		// Cancel the default action, if needed
		event.preventDefault();
		// Trigger the button element with a click
		sendChatMessage();
	}
}

function showCustomizer(arg,ele){
	//getById("directorLinksButton").innerHTML='<i class="las la-caret-right"></i><span data-translate="hide-the-links"> LINKS (GUEST INVITES & SCENES)</span>'
	getById("showCustomizerButton1").style.backgroundColor="";
	getById("showCustomizerButton2").style.backgroundColor="";
	getById("showCustomizerButton3").style.backgroundColor="";
	getById("showCustomizerButton4").style.backgroundColor="";
	getById("showCustomizerButton1").style.boxShadow="";
	getById("showCustomizerButton2").style.boxShadow="";
	getById("showCustomizerButton3").style.boxShadow="";
	getById("showCustomizerButton4").style.boxShadow="";
	if (getById("customizeLinks"+arg).style.display!="none"){
		getById("customizeLinks").style.display="none";
		getById("customizeLinks"+arg).style.display="none";
	} else {
		//directorLinks").style.display="none";
		getById("showCustomizerButton"+arg).style.backgroundColor="#1e0000";
		getById("showCustomizerButton"+arg).style.boxShadow="inset 0px 0px 1px #b90000";
		getById("customizeLinks1").style.display="none";
		getById("customizeLinks2").style.display="none";
		getById("customizeLinks3").style.display="none";
		getById("customizeLinks4").style.display="none";
		getById("customizeLinks").style.display="block";
		getById("customizeLinks"+arg).style.display="block";
	}
}


var defaultRecordingBitrate = false;
function recordVideo(target, event, videoKbps = false, interval=30){  // event.currentTarget,this.parentNode.parentNode.dataset.UUID

	var UUID = target.dataset.UUID;
	var video = session.rpcs[UUID].videoElement;
	
	if (event === null){
		if (defaultRecordingBitrate===null){
			target.style.backgroundColor = null;
			target.innerHTML = '<i class="las la-circle"></i><span data-translate="record"> Record</span>';
			return;
		}
	} else if ((event.ctrlKey) || (event.metaKey)){
		target.innerHTML = '<i class="las la-check"></i> <span data-translate="record"> ARMED</span>';
		target.style.backgroundColor = "#BF3F3F";
		Callbacks.push([recordVideo, target, null, false]);
		log("Record Video queued");
		defaultRecordingBitrate=false;
		return;
	} else {
		defaultRecordingBitrate=false;
	}
	
	log("Record Video Clicked");
	if ("recording" in video){
			log("ALREADY RECORDING!");
			target.style.backgroundColor = null;
			target.innerHTML = '<i class="las la-circle"></i><span data-translate="record"> Record</span>';
			video.recorder.stop();
			session.requestRateLimit(35,UUID); // 100kbps
			delete(video.recorder);
			delete(video.recording);
			return;
		
	} else {
		target.style.backgroundColor = "#FCC";
		target.innerHTML = "<i style='font-size:110%;' class='las la-file-download'></i> <span data-translate='Download'>Download</span>";
		video.recording = true;
	}
	
	video.recorder = {};
	
	if (videoKbps==false){
		if (defaultRecordingBitrate==false){
			videoKbps = 4000; // 4mbps recording bitrate
			videoKbps = prompt("Press OK to start recording. Press again to stop and download.\n\nWarning: Keep this browser tab active to continue recording.\n\nYou can change the default video bitrate if desired below (kbps)",videoKbps);
			if (videoKbps===null){
				target.style.backgroundColor = null;
				target.innerHTML = '<i class="las la-circle"></i><span data-translate="record"> Record</span>';
				delete(video.recorder);
				delete(video.recording);
				defaultRecordingBitrate=null;
				return;
			}
			videoKbps = parseInt(videoKbps);
			defaultRecordingBitrate = videoKbps;
		} else {
			videoKbps = defaultRecordingBitrate;
		}
	} 
	
	if (videoKbps<35){  // this just makes sure you can't set 0 on the record bitrate.
		videoKbps=35;
	}
	
	session.requestRateLimit(parseInt(videoKbps*0.8), UUID); // 3200kbps transfer bitrate. Less than the recording bitrate, to avoid waste.
	
	var filename = Date.now().toString();
	var recordedBlobs = [];
	

	var cancell = false;
    if (typeof video.srcObject === "undefined" || !video.srcObject) {return;}
	
	video.recorder.stop = function (){
        video.recorder.mediaRecorder.stop();
		cancell = true;
        log('Recorded Blobs: ', recordedBlobs);
		download();
    };
	
	let options = { 
		mimeType: "video/webm",
		videoBitsPerSecond: parseInt(videoKbps*1024) // 2.5Mbps
	};
	video.recorder.mediaRecorder = new MediaRecorder(video.srcObject, options); 
	
	function download() {
		
        const blob = new Blob(recordedBlobs, { type: "video/webm" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename+".webm";
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);
    }
	
	function handleDataAvailable(event) {
        if (event.data && event.data.size > 0) {
            recordedBlobs.push(event.data);
        }
    }
    
	video.recorder.mediaRecorder.ondataavailable = handleDataAvailable;
	
	video.recorder.mediaRecorder.onerror = function(event) {
		errorlog(event);
		video.recorder.stop();
		session.requestRateLimit(35,UUID);
		if (!(session.cleanOutput)){
			setTimeout(function(){alert("an error occured with the media recorder; stopping recording");},1);
		}
	};
	 
	video.srcObject.ended  = function(event) {
		video.recorder.stop();
		session.requestRateLimit(35,UUID);
		if (!(session.cleanOutput)){
			setTimeout(function(){alert("stream ended! stopping recording");},1);
		}
	};
	  
	video.recorder.mediaRecorder.start(100); // 100ms chunks

	return;
}
