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
        $('.firstLeft').html(template({user: "123"}));
	},
	initialize: function() {
		this.render();
	},
	// Can't undestand, why it's here.
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
        return new Handlebars.SafeString(Parse.User.current().get('author_name'));	
    }
    else {
        return "";
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
function loginWith(provider, user)
{
	console.log(user);
	var query = new Parse.Query('User');
	query.equalTo(provider + "_id", user[provider + "_id"]);
	query.find({
		success: function(Users) {
			console.log(Users);
			if (!Users.length) {
				var newUser = new Parse.User(user);
				console.log(newUser);
				newUser.signUp(null,
				{
					success: function(user) {
						re_render();
					},
					error: function(user, error) {
						console.log('Днище ' + error.message);
					}
				})
			}
			else {
				Parse.User._saveCurrentUser(Users[0]);
				re_render();
			}
		},
		error: function(Users, errror) {
			alert("Error: " + error.code + " " + error.message);
		}
	})
}

function linkWith(provider, id) {
	if (Parse.User.current()) {
		Parse.User.current.set(provider + "_id", id);
	}
	else {
		alert("please login first");
	}
}

function login (event) {
	$('#login-modal').modal('hide');
	switch(event.data.type) {
		case "facebook":
			// Login function
			FB.login(function(response) {
		        if (response.authResponse) {
		            // connected
		            // Creating new user on the server.
				    FB.api('/me', function(response) {
					    var newUser = {
					    	username:		response.id,
					    	password: 	'12345',
					    	facebook_id: 	response.id,
					    	author_name:	response.name,
					    	// userpic: 		response.picture,
					    	// email:  	'gaga@gaga.com',
					    };
					    loginWith("facebook", newUser);
				    });
		        }
		        else {
		            // cancelled
		        }
		    });
		    // Checking function.
			// FB.getLoginStatus(function(response) {
			// 	if (response.status === 'connected') {
			// 		// connected
			// 		FB.logout(function(response) {
			// 			console.log('Пользователь вышел как с сайта, так и с Facebook.')
			// 		});
			// 	} else if (response.status === 'not_authorized') {
			// 		// not_authorized
			// 		console.log('Вы не авторизированы!');
			// 	} else {
			// 	// not_logged_in
			// 	console.log('Вам необходимо зарегистрироваться!');
			// 	loginFB();
			// 		// I've got here to work with login() function. I guess
			// 		// that the FB.getLoginStatus is going to transfer to the
			// 		// login() methof in the EVENTS. This is going to be the
			// 		// checkup if the user is already registered.
			// 	}
			// });
			break;
		case "twitter":
			twttr.anywhere(function (T) {
				T.signIn();
				T.bind("authComplete", function (e, user) {
      				// triggered when auth completed successfully
      				console.log(user);
      				var newUser = {
      					username: user.idStr,
      					password: user.profileBackgroundColor,
      					twitter_id: user.id,
      					author_name: user.name,
      					userpic: user.profileImageUrl
      				};
					loginWith("twitter", newUser);     				
      			});
			});
		break;
		case "vk":
			VK.Auth.login(function(response) {
			  	if (response.session) {
			    	var userid = response.session.mid;
			    	console.log(response.session);

      				var newUser = {
      					username: response.session.mid,
      					password: response.session.sig,
      					vk_id: response.session.mid,
      					author_name: response.session.user.first_name + " " + response.session.user.last_name,
      					// userpic: user.profileImageUrl
      				};
      				loginWith("vk", newUser);
				}
		});
		break;
		case "gplus": 
			gapi.client.load('plus', 'v1', function() { 
				var clientId = '923974640051-ht5uitgkdjvl4pmhf4qlm5o22qaad211.apps.googleusercontent.com';
				var apiKey = 'AIzaSyAM24v0bbMXxesyKUTwoWDpkwfVUv-fcXo';
				var scopes = 'https://www.googleapis.com/auth/plus.me';
				gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: false}, function(authResult){
					var request = gapi.client.plus.people.get({
          				'userId': 'me'
            		});
      				request.execute(function(resp) {
						console.log(resp);
						var userid = resp.id;
						var name = resp.displayName;

	      				var newUser = {
	      					username: resp.id,
	      					password: resp.etag,
	      					gplus_id: resp.id,
	      					author_name: resp.displayName,
	      				};
	      				loginWith("gplus", newUser);
        			});
				}); 
			});
		break;
	}
}

function re_render() {
	app.submitRule.render();
    app.navBar.render();
    app.rulesNav.render();
}

function logout () {
	Parse.User.logOut();
	re_render();
}

function notify() {
	alert("change auth");
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

// NEW
// var positions = document.getElementsByClassName('position');
// var Views = {}; // Object with id's of elements for Views
// for (var i = 0; i < positions.length; i++) {
// 	Views[positions[i].getAttribute('id')] = null;
// }
// Parse.View = Parse.View.extend({
// 	render: function() {
// 		this.$el.html(this.template(this.model.toJSON()));
// 	},
// 	initialize: function() {
// 		this.render();
// 		Views[this.el.getAttribute('id')] = this;
// 		// this.model.on('change', this.render, this);
// 		// this.collection.on('change', this.render, this);
// 		// this.collection.on('add', this.render, this);
// 	},
// 	remove: function() { // change standart behavior of View.remove() to make it detach events
// 		this.$el.empty().detach();
// 		return this;
// 	}
// });