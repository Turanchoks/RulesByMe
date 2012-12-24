var _ = require('underscore')._;
var RuleObject = Parse.Object.extend('Rule');

// THE SINGUP CODE NOT WORKING ON PARSE CLOUD
// var user = new Parse.User();
// user.set("username", uid);
// user.set("password", "12345");
// user.set("vkData", uid);
// user.signUp(null, {
// 	success: function(user) {
// 		console.log("Registred");
// 	},
// 	error: function(user, error) {
// 		console.error("Error: " + error.code + " " + error.message)
// 	}
// });

//////////////
//  HELPER  //
//////////////

function trim (str) {
	str = str.replace(/^\s+/, '');
	for (var i = str.length - 1; i >= 0; i--) {
		if (/\S/.test(str.charAt(i))) {
			str = str.substring(0, i + 1);
			break;
		}
	}
	return str;
}

//////////////
//    VK    //
//////////////

function vklogin (uid, access_token) {
	console.log("uid= "+ uid + " token = " + access_token);

}

Parse.Cloud.define("ratingChange", function(request, response) {
	if (request.params.increment != 1 && request.params.increment != -1) {
		response.success("cheat!");
		return;
	}
	var query = new Parse.Query("Rule");
	query.get(request.params.RuleID, {
		success: function(Rule) {
			/*if (request.user) {
					if((Parse._.indexOf(request.user.get("voted"), Rule.id) == -1)) {*/
						Rule.increment("rating", request.params.increment);
						Rule.save();
						response.success(Rule);
					/*	currentUser.add("voted", Rule.id);
						currentUser.save();
					}
					else {
						//Придумать интерактив на тему "пошли нахрен"
						response.success(">_<");
					}
				}
				else 
				{
					//new LogInView(); - показываем 
				}*/
		},
		error: function() {
			response.error("rule not found");
		}
	});
});

Parse.Cloud.define("addRule", function(request, response) {
	for(var key in request.params) {
		if (trim(request.params[key]).length < 3) {
			response.error("Заполните все поля!");
			return;
		};
	}
	var ruleObjectToPublish = new RuleObject({
		rule1: request.params.rule1,
		rule2: request.params.rule2,
		rule3: request.params.rule3,
		author: {
			id: request.user.id,
			url: request.user.get('url'),
			username: request.user.get('username'),
		},
		rating: 0
	});
	ruleObjectToPublish.save({
		success: function(obj) {
			response.success(obj); 
		},
		error: function(error, obj) {
			response.error(error, obj);
			// throw new Error(error);
		}
	});
});

Parse.Cloud.define('loginFB', function(request, response) {
    var newUserToRegister = new Parse.User({
    	url:		request.params.url,
    	username:	request.params.username
    });
    newUserToRegister.save({
		success: function(obj) {
			response.success(obj); 
		},
		error: function(error, obj) {
			response.error(error, obj);
			// throw new Error(error);
		}
	});
});

Parse.Cloud.define("vklogin", function(request, response) {
	Parse.Cloud.httpRequest({
			url: 'https://oauth.vk.com/access_token',
			params: {
				client_id: '3313840',
				client_secret: 'dEBkxtVuUQPAX00CYdli',
				code: request.params.code,
				redirect_uri: 'http://rulesby.me/RulesByMe/close.html'
			},
			success: function(httpResponse) {
					// console.log(httpResponse.data);
					Parse.Cloud.httpRequest({
						url: 'https://api.vk.com/method/users.get',
						params: {
							uids: httpResponse.data.user_id,
							access_token: httpResponse.data.access_token
						},
						success: function(httpResponse) {
							var uid = httpResponse.data.response[0].uid;

							var qSearchVK = new Parse.Query('User');
							qSearchVK.equalTo("vkData", uid);
							qSearchVK.find({
								success: function(User) {
									console.log(User.length);
									if(!User.length) {
										var user = {
											username: "http://vk.com/id" + uid,
											password: "test",
											vkData: uid
										}
										response.success(user);
									}
								},
								error: function() {

								}
							});
							
						},
						error: function(httpResponse) {
							console.error('Request failed with response code ' + httpResponse.status);
							response.error("Didn't get vk data");
						}
					});
			},
			error: function(httpResponse) {
				console.error('Request failed with response code ' + httpResponse.status);
				response.error("Didn't get vk token");
			}
	});
});

// Vklogin 
// 1. make from receive code access_token
// 2. pass access_token to get user_id
// 3. check if we had user with same user_id
// 4. if(3) then login else signup
