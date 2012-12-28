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

Parse.Cloud.define("ratingChange", function(request, response) {
	if (request.params.increment != 1 && request.params.increment != -1) {
		response.success("cheat!");
		return;
	}

	var query = new Parse.Query("User");
	query.get(request.params.userID, {
		success: function(User) {
			User.relation("voted").query().get(request.params.RuleID, {
				success: function(Rule) {
					console.log("Rules was voted");
				},
				error: function(obj, error) {
					console.log("Rules wasn't voted by user");
					var ruleQuery = new Parse.Query("Rule");
					ruleQuery.get(request.params.RuleID, {
						success: function(Rule) {
							Rule.increment("rating", request.params.increment);
							console.log("increment");
							Rule.save();	
							response.success(Rule);			
						},
						error: function() {

						}
					});
				}
			});
		},
		error: function() {
			response.error("user not found");
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

	console.log(request);

	var ruleObjectToPublish = new RuleObject({
		rule1: request.params.rule1,
		rule2: request.params.rule2,
		rule3: request.params.rule3,
		author_name: request.params.author,
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

Parse.Cloud.define("Logger", function(request, response) {
  console.log(request);
  response.success();
});