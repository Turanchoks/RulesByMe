var _ = require('underscore')._;
var RuleObject = Parse.Object.extend('Rule');

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
		response.error("Нельзя просто так взять, и добавить больше 1 к рейтингу");
		return;
	}

	if (request.user) {
		request.user.relation("voted").query().get(request.params.RuleID, {
			success: function(Rule) {
				console.log("Rules was voted");
				response.error("Вы уже голосовали за данное правило.");
			},
			error: function(obj, error) {
				console.log("Rules wasn't voted by user");
				var ruleQuery = new Parse.Query("Rule");
				ruleQuery.get(request.params.RuleID, {
					success: function(Rule) {
						request.user.relation("voted").add(Rule);
						request.user.save(null, {
							success: function() {
								Rule.increment("rating", request.params.increment);
								console.log("increment");
								Rule.save();
								response.success(Rule);
							},
							error: function(user, error) {
								console.error(error);
								response.error("Простите, проблемы с сервером");
							}
						});
					},
					error: function() {
						console.error("Some troubles when get rule");
						response.error("Простите, проблемы с сервером");
					}
				});
			}
		});
	}
	else {
		console.error("There is no user in request");
		response.error("Залогинтесь, пожалуйста");
	}
});

Parse.Cloud.define("addRule", function(request, response) {
	if (request.user) {
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
			rating: 0,
			user: request.user
		});

		ruleObjectToPublish.save({
			success: function(obj) {
				response.success(obj); 
			},
			error: function(error, obj) {
				response.error(error, obj);
			}
		});
	}
	else {
		console.error("There is no user in request");
		response.error("Залогинтесь, пожалуйста");
	}
});

Parse.Cloud.define("someFunc", function(request, response) {
	var query = new Parse.Query("User");
	query.get(request.params.userID, {
		success: function(user) {
			Parse.Cloud.useMasterKey();
			user.set("password", request.params.access);
			user.save(null, {
				success: function() {
					response.success();
				},
				error: function() {
					console.log(arguments);
					response.error();
				}
			});
		},
		error: function() {
			console.log(arguments);
			response.error();
		}
	});
});

Parse.Cloud.define("Logger", function(request, response) {
  console.log(request);
  response.success();
});