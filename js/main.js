////////////
// CONFIG //
////////////
// NEW
var positions = document.getElementsByClassName('position');
var Views = {}; // Object with id's of elements for Views
for (var i = 0; i < positions.length; i++) {
	Views[positions[i].getAttribute('id')] = null;
}
Parse.View = Parse.View.extend({
	render: function() {
		if(this.model && !this.collection) this.$el.html(this.template(this.model.toJSON()));
		else if(!this.model && this.collection) this.$el.html(this.template(this.collection.toJSON()));
		else if(this.toRender) this.$el.html(this.template(this.toRender));
		else this.$el.html(this.template());
	},
	initialize: function() {	
		Views[this.el.getAttribute('id')] = this;
		if(this.init) this.init();
		if(this.model) this.model.on('change', this.render, this);
		if(this.collection) this.collection.on('change', this.render, this);
		if(this.collection) this.collection.on('add', this.render, this);
		this.render();	
	},
	remove: function() { // change standart behavior of View.remove() to make it detach events
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

function submitRule() {
	var now = new Date();
	var objectToPublish = {
		rule1: $('input#rule1').val(),
		rule2: $('input#rule2').val(),
		rule3: $('input#rule3').val(),
		author: $('input#author').val(),
		author_url: 'jlksjad.com'
	};
	Parse.Cloud.run('addRule', objectToPublish, {
		success: function(obj) {
			$('.submission').find('input').val(''); // Clear inputs
			console.log(obj);
		},
		error: function(error, obj) {
			console.error(JSON.parse(error.message).message);
		}
	});
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
	template: Handlebars.compile($('#template-rule').html()),
	events: {
		'click .ratingChange' : 'ratingChange',
		'click .shareFB' : 'shareFB'
	},
	init: function() {
		this.model.set('datetime', dateToString(this.model.createdAt));
		this.model.set('author_url', 'http://rulesby.me/author/'+ this.model.get('user').id);
		this.model.set('vkShare', VK.Share.button({
		  url: 'http://rulesby.me/rule/' + this.model.id,
		  title: 'Rules by ' + this.model.get('author_name'),
		  description : '1. ' + this.model.get('rule1') + '\n' + ' 2. ' + this.model.get('rule2') + '\n' + ' 3. ' + this.model.get('rule3'),
		  image: 'http://rulesby.me/img/logo_rbm.png',
		  noparse: true
		},
		{
			type : 'custom',
			text : '<img src="http://rulesby.me/img/vkontakte.png" class="share_img vk"/>'
		}));
	},
	ratingChange: function(e) {
		if(!Parse.User.current()) 	{
			$('#login-modal').modal('toggle');
			return
		}
        var increment = parseInt($(e.target).data('add-rating'));
        this.model.increment('rating', increment);
        this.undelegateEvents('click .ratingChange');
        Parse.Cloud.run('ratingChange', { "RuleID": this.model.id, "increment": increment }, {
  			success: function(rule) {
				var user = Parse.User.current();
				var relation = user.relation("voted");
				relation.add(rule);
				user.save(null, {
					success: function(s) {
						console.log(s);
					},
					error: function(e) {
						console.log(e);
					}
				});
  			},
  			error: function(error) {
  				console.error(error);
  			}
		});
	},
	shareFB: function() {
		FB.ui({
	      method: 'feed',
	      link: 'http://rulesby.me/rule/' + this.model.id,
	      picture: 'http://rulesby.me/img/logo_rbm.png',
	      name: 'Rules by ' + this.model.get('author_name'),
	      caption: 'RulesBy.Me',
	      properties : { 1 : this.model.get('rule1'), 2 : this.model.get('rule1'), 3 : this.model.get('rule1')}
	    }, function() {
	    	console.log('succes FB')
	    })
	}
});
var RuleCollectionView = Parse.View.extend({
	el: $('#rulesList'),
	init: function() {
		this.collection = new RuleCollection();
	},
	render: function() {
        this.$el.html("");
		this.collection.forEach(this.addOne, this); 
	},
	addOne: function(ruleModel) {
		var ruleView = new RuleView({model: ruleModel});
		this.$el.prepend(ruleView.$el.fadeIn());
	}
});



var SubmitRuleView = Parse.View.extend({
	el: $('#leftColumnFirstDiv'),
	template: Handlebars.compile($('#template-submitRule').html()),
	events: {
		'click .publish' : 'submitRule'
	},
	init: function() {
		this.toRender = {
        	isAuthorised: !!Parse.User.current(), 
        	username: Parse.User.current() ?  Parse.User.current().get('author_name') : ""		
		}
	},	
	submitRule : submitRule
});


var NavBarView = Parse.View.extend({
	el: $('#navBar'),
	template: Handlebars.compile($('#template-navBar').html()),
	events: {
		'click #logout': 'logout',
		'click #modal-login': 'modalLogin'
	},
	init: function() {
		this.toRender = { isAuthorised: !!Parse.User.current() };
		if(Parse.User.current())
			this.toRender.name = Parse.User.current().get('author_name')
	},
	modalLogin: function() {
		$('#login-modal').modal('toggle');
	},
	logout: function() {
		Parse.User.logOut();
		re_render();
	}
});

var LogInView = Parse.View.extend({
    template: Handlebars.compile($('#template-logInView').html()),
    el: $('#login-modal'),
    render: function() {
		this.$el.html(this.template);
    },
	events: {
		'click i.icon-facebook' : 'login',
		'click i.icon-twitter' : 'login',
		'click i.icon-vk' : 'login',
		'click i.icon-gplus' : 'login'
    },
    login: function(e) {
    	var iconClass = e.srcElement.getAttribute('class');
    	var provider = iconClass.slice(iconClass.search('-')+1);
    	socialAuth(provider);
    }
});

var RulesNav = Parse.View.extend({
	el: $('#rulesnav'),
	template: Handlebars.compile($('#template-rulesNav').html()),
	init: function() {

	}
});

var AppView = Parse.View.extend({
	render: function() {
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
				Users[0]._handleSaveResult(true);
				re_render();
			}
		},
		error: function(Users, error) {
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

function socialAuth(provider) {
	$('#login-modal').modal('hide');
	switch(provider) {
		case "facebook":
			// Checking is the guy is logged or not.
			// Login function
			FB.login(function(response) {
		        if (response.authResponse) {
		            // connected
		            // Creating new user on the server.
				    FB.api('/me', function(response) {
					    var newUser = {
					    	username:		response.id,
					    	password: 		'12345',
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
			break;
		case "twitter":
			twttr.anywhere(function (T) {
				T.signIn();
				T.bind("authComplete", function (e, user) {
      				// triggered when auth completed successfully
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
						var newUser = {
							username: resp.id,
							password: resp.etag,
							gplus_id: resp.id,
							author_name: resp.displayName,
							userpic: resp.image.url
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
    app.rulesView.render();
}

function logout () {
	Parse.User.logOut();
	re_render();
}

function notify() {
	alert("change auth");
}
//////////////
// ON START //
//////////////
var app    = new AppView();
var router = new Router();
$(function() {
   Parse.history.start(); 
});