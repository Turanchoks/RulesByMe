window.fbAsyncInit = function() {
  // init the FB JS SDK
  FB.init({
    appId      : '452789981444955', // App ID from the App Dashboard
    channelUrl : 'http://rulesby.me/RulesByMe/channel.html', // Channel File for x-domain communication
    status     : true, // check the login status upon init?
    cookie     : true, // set sessions cookies to allow your server to access the session?
    xfbml      : true  // parse XFBML tags on this page?
  });

  // Here is our initialization code
  FB.getLoginStatus(function(response) {
    if (response.status === 'connected') {
      // connected
      console.log('This guy is connected');
      FBtestAPI();
    } else if (response.status === 'not_authorized') {
      // not_authorized
      console.log('Who is that guy?');
    } else {
      // not_logged_in
      console.log('This guy is doing something extraordinary!');
      FBlogin();
    }
  });

};

// Load the SDK's source Asynchronously
// Note that the debug version is being actively developed and might 
// contain some type checks that are overly strict. 
// Please report such bugs using the bugs tool.
(function(d, debug){
   var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
   if (d.getElementById(id)) {return;}
   js = d.createElement('script'); js.id = id; js.async = true;
   js.src = "//connect.facebook.net/en_US/all" + (debug ? "/debug" : "") + ".js";
   ref.parentNode.insertBefore(js, ref);
 }(document, /*debug*/ false));

function FBlogin() {
    FB.login(function(response) {
        if (response.authResponse) {
            // connected
        } else {
            // cancelled
        }
    });
}

function FBtestAPI() {
    console.log('Welcome!  Fetching your information.... ');
    FB.api('/me', function(response) {
        console.log('Good to see you, ' + response.name + '.');
    });
}