var _ = require('underscore')._;
var UserObject = Parse.Object.extend('User');
var RuleObject = Parse.Object.extend('Rule');

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

Parse.Cloud.define("regFB", function () {
    // FB.login(function(response) {
    //     if (response.authResponse) {
    //         // connected
    //     } else {
    //         // cancelled
    //     }
    // });
    FB.api('/me', function(response) {
        console.log('Добро пожаловать на тёплую сторону мыла, ' + response.name + '.');
    });
});