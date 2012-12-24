////////////
// CONFIG //
////////////
Parse.View = Parse.View.extend({ // change standart behavior of View.remove() to make it detach events
	remove: function() {
		this.$el.empty().detach();
		return this;
	}
});
Parse.initialize("7NWULxIRFzuMWrQ6bX1O8mm357Nz7jfHEWXhPevn", "yQmxvt5eKgJfbSCePpBM040ZUMj3iNHiucWBlpas");
function dateToString(date) {
	var trimmedDate = date.getFullYear().toString();
	trimmedDate += '-';
	trimmedDate += (date.getMonth().toString().length == 1) ? '0'+date.getMonth().toString() : date.getMonth().toString();
	trimmedDate += '-';
	trimmedDate += (date.getDate().toString().length == 1) ? '0'+date.getDate().toString() : date.getDate().toString();
	trimmedDate += ' ';
	trimmedDate += date.toLocaleTimeString().substring(0,5);
	return trimmedDate
}
////////////////
// STRUCTURE  //
////////////////
var RuleObject = Parse.Object.extend('Rule',{});
var RuleCollection = Parse.Collection.extend({
 	model: RuleObject,
});
///////////
// VIEWS //  
///////////
var RuleView = Parse.View.extend({
	className: 'rule',
	tagName: 'li',
	template: Parse._.template($('#template-rule').html()),
	events: {
		'click .ratingChange' : 'ratingChange',
	},
	initialize: function() {
		this.model.on('change', this.render, this);	
		this.model.set('datetime', dateToString(this.model.createdAt));
		this.render();
	},
	render: function(rating) {
		this.$el.html(this.template(this.model.toJSON()));
	},
	ratingChange: function(e) {
        var increment = parseInt($(e.target).data('add-rating'));
        this.model.increment('rating', increment);
        this.undelegateEvents('click .ratingChange');
        Parse.Cloud.run('ratingChange', { "RuleID": this.model.id, "increment": increment }, {
  			success: function(obj) {
  				console.log(obj);
  			},
  			error: function(error) {
  				console.error(error);
  			}
		});
	}
});
var RuleCollectionView = Parse.View.extend({
    el: $('#rulesList'),
	initialize: function() {
        if(!this.collection) this.collection = new RuleCollection();
		this.collection.on('add', this.addOne, this);
		this.render();
	},
	render: function() {
        this.$el.html("");
		this.collection.forEach(this.addOne, this); 
	},
	addOne: function(ruleModel) {
		var ruleView = new RuleView({
			model: ruleModel
		});
		this.$el.prepend(ruleView.$el.fadeIn());
	}
});
var SubmitRuleView = Parse.View.extend({
	source: $('#template-submitRule').html(),
	events: {
		'click .publish' : 'submitRule'
	},
	render: function() {
        var template = Handlebars.compile(this.source);
        $('.firstLeft').html(template());
	},
	initialize: function() {
		this.render();
	},
	submitRule : function() {
		var now = new Date();
		var objectToPublish = {
			rule1: $('input#rule1').val(),
			rule2: $('input#rule2').val(),
			rule3: $('input#rule3').val(),
			author: $('input#author').val(),
			author_url: 'jlksjad.com'
		};
		Parse.Cloud.run('addRule', objectToPublish,
		{
			success: function(obj) {
				$('.submission').find('input').val(''); // Clear inputs
				console.log(obj);
			},
			error: function(error, obj) {
				console.error(JSON.parse(error.message).message);
				alert(JSON.parse(error.message).message);
			}
		});
	}
});
var NavBarView = Parse.View.extend({
	el: $('#navBar'),
	source: $('#template-navBar').html(),
	initialize: function(el) {
		this.render();
	},
	render: function() {
		var template = Handlebars.compile(this.source);
		this.$el.html(template());
	}
});

var RulesNav = Parse.View.extend({
   source: $('#template-rulesNav').html(),
   className: 'rulesNav clearfix',
   initialize: function() {
       this.render();
   },
   render: function() {
   		var template = Handlebars.compile(this.source);
		$('#rulesnav').html(template());
   }
});

// Here I compile the way the welcoming page is shown.
var LogInView = Parse.View.extend({
    template: $('#template-logInView').html(),
    initialize: function(){
        this.render();
    },
    render: function() {
        var source = Handlebars.compile(this.template);
        $('#login-modal').html(source);
    }
});

var AppView = Parse.View.extend({
    initialize: function() {
		this.render();
	}, 
	render: function() {
		var self = this;
        $('.rightColumn').prepend($('#template-gifLoader').html());
		this.navBar = new NavBarView();
        this.rulesNav = new RulesNav();
        this.rulesView = new RuleCollectionView();
        this.submitRule = new SubmitRuleView();
		this.LogInView = new LogInView();
	}
});
//////////////////////
// HELPER FUNCTIONS //
//////////////////////
function queryRules(condition, userId) {
	var now   = new Date(); // today
	var query = new Parse.Query(RuleObject);
	query.ascending('rating');
	switch(condition) {
		case 'month':
		    var date = new Date(now.getFullYear(), now.getMonth(), 1,0,0,0,0);
			query.greaterThanOrEqualTo('createdAt', date);     
            break;
        case 'week': 
            now.setDate(now.getDate()-now.getDay()+1);
            var date = new Date(now.getFullYear(), now.getMonth(), now.getDate(),0,0,0,0);
            query.greaterThanOrEqualTo('createdAt', date);
            break;
        case 'myRules':
            break;
        case 'userRules':
            break;
	}
	return query.collection();
}

Handlebars.registerHelper('submit_button', function() {
    if (Parse.User.current()) {
        return new Handlebars.SafeString("<a class=\"btn btn-large btn-warning publish\">ОПУБЛИКОВАТЬ</a>");	
    }
    else {
        return new Handlebars.SafeString("<a class=\"btn btn-large btn-warning modal-login\">ВОЙТИ И ОПУБЛИКОВАТЬ</a>");
    }
});

Handlebars.registerHelper('get_username', function() {
    if (Parse.User.current()) {
        return new Handlebars.SafeString(Parse.User.current().get('username'));	
    }
    else {
        return new Handlebars.SafeString("");
    }
});

Handlebars.registerHelper('navbar_login', function() {
    if (Parse.User.current()) {
        return new Handlebars.SafeString("<li><a href=\"#\" id=\"logout\">Logout</a></li>");	
    }
    else {
        return new Handlebars.SafeString("<li><a href=\"#\" id=\"modal-login\">Login</a></li>");
    }
});
////////////
// ROUTER //
////////////
var Router = Parse.Router.extend({
    routes: {
		"": "index",
		"rule/:id": "oneRule",
		"author/:id": "rulesByAuthor",
		"about": "about",
		"best/:period": "getBest",
        "myRules" : "myRules"
	},
	initialize: function() {},
	index: function() {

	},
	getBest: function(period) {
        queryRules(period).fetch({
            success: function(collection) {
                app.rulesView.collection = collection;
                app.rulesView.render();
            }
        });
	},
    myRules: function() {
        console.log(Parse.User.current());  
    },
	oneRule: function(id) {},
	about: function() {},
    logOut: function() {

    },
    rulesByAuthor: function(id) {

    }
});
//////////////
//  EVENTS  //
//////////////
function login (event) {
	$('#login-modal').modal('hide');
	switch(event.data.type) {
		case "facebook":
			console.log('Hello, FB');
			// Parse.FacebookUtils.logIn("user_likes,email", {
			//   success: function(user) {
			//     if (!user.existed()) {
			//       alert("Пользователь подписался и вошёл с помощью Facebook!");
			//     } else {
			//       alert("Пользователь вошёл с помощью Facebook!")
			//      }
			//         app.submitRule.render();
		 //    		app.navBar.render();
		 //    		app.rulesNav.render();
			//   },
			//   error: function(user, error) {
			//   	$('#login-modal').modal('hide');	
			//     alert("Пользователь отменил вход при помощи Facebook или не полностью авторизовался.");
			//   }
			// });
			break;
		case "twitter":
			
			
			break;
			// 
	}
}

function logout () {
	Parse.User.logOut();
    app.submitRule.render();
    app.navBar.render();
    app.rulesNav.render();
}

function notify() {
	alert("clicked");
}

$("body").on("click", "a#modal-login", function() {
		$('#login-modal').modal('toggle');
	});

$("body").on("click", "i.icon-facebook", {type: "facebook"}, login);
$("body").on("click", "i.icon-twitter", {type: "twitter"}, login);
$("body").on("click", "i.icon-vk", {type: "vk"}, login);
$("body").on("click", "i.icon-gplus", {type: "gplus"}, login);

$("body").on("click", "a#logout", logout);

//////////////
// ON START //
//////////////
var app    = new AppView();
var router = new Router();
$(function() {
   Parse.history.start(); 
});