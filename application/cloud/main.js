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

Parse.Cloud.beforeSave("Rule", function(request, response) {

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

	for (var i = 1; i < 4; i++) {
		var rule =  trim(request.object.get("rule" + i));
		if (rule.length < 1) {
			response.error("Заполните, пожалуйста, правило №" + i);
			return;
		}
	};
	var author = trim(request.object.get("author"));
	if (author.length < 1) 
	{
		response.error("Заполните, пожалуйста, автора");
		return;
	};

    if (_.isUndefined(request.object.get("rating")))
    {
    	request.object.set("rating", 0);
    };

  	response.success();  
});

// Parse.Cloud.afterSave("Rule", function(request) {
//   query = new Parse.Query("Rule");
//   query.get(request.object.id, {
//     success: function(rule) {
//     	if (_.isUndefined(rule.get("rating")))
//     	{
//     		rule.set("rating", 0);
//     	};
//     },
//     error: function(error) {
//       throw "Got an error " + error.code + " : " + error.message;
//     }
//   });
// });