var _ = require('underscore')._;

Parse.Cloud.define("ratingChange", function(request, response) {
  var query = new Parse.Query("Rule");
  query.get(request.params.RuleID, {
    success: function(Rule) {
    	if (request.params.increment != 1 && request.params.increment != -1) 
    	{
    		response.success("cheat!");
    	}
    	else
    	{
	    	/*if (request.user) {
				if((Parse._.indexOf(request.user.get("voted"), Rule.id) == -1)) {*/
					Rule.increment("rating", request.params.increment);
					Rule.save();
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
			response.success();
		}
    },
    error: function() {
      response.error("rule not found");
    }
  });
});

Parse.Cloud.define("addRule", function(request, response) {
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

	for(var key in request.params)
	{
		if (trim(request.params[key]).length < 1) {
			response.error("Заполните все поля!");
			return;
		};
	}

	var RuleObject = Parse.Object.extend('Rule');

	var ruleObjectToPublish = new RuleObject({
		rule1: request.params.rule1,
		rule2: request.params.rule2,
		rule3: request.params.rule3,
		author: request.params.author,
		author_url: 'jlksjad.com',
		rating: 0
	});

	ruleObjectToPublish.save({
			success: function(obj) {
				response.success(obj); 
			},
			error: function(obj, error) {
				response.error(error);
				// throw new Error(error);
			}
		});
});