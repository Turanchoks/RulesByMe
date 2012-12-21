FB.getLoginStatus(function(response) {
	if (response.status === 'connected') {
		var signedRequest = response.authResponse.signedRequest;
	}
	var guy = document.getElementById('guy');
	guy.innerHTML = signedRequest;
});