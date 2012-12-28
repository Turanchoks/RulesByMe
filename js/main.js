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
	},
	init: function() {
		this.model.set('datetime', dateToString(this.model.createdAt));
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
	submitRule : function() {
		console.log('clicked');
	}
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
    	console.log(iconClass.slice(iconClass.search('-')+1))
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
function loginWith (event) {
	$('#login-modal').modal('hide');
	switch(event.data.type) {
		case "facebook":
			// Checking is the guy is logged or not.
			// Login function
			var loginFB = function() {
				FB.login(function(response) {
			        if (response.authResponse) {
			            // connected
			            // Creating new user on the server.
					    FB.api('/me', function(response) {
						    var newUser = new Parse.User({
						    	url:		response.link,
						    	username:	response.name,
						    	email:  	'gaga@gaga.com',
						    	password: 	'12345'
						    });
						    newUser.signUp(null,
								{
								success: function(user)	{
								    app.submitRule.render();
								    app.navBar.render();
								    app.rulesNav.render();
								},
								error: function(user, error) {
									// Show the error message somewhere and let the user try again.
									alert("Error: " + error.code + " " + error.message);
								}
							});
					    });
			        }
			        else {
			            // cancelled
			        }
			    });

			};
		    // Checking function.
			FB.getLoginStatus(function(response) {
				if (response.status === 'connected') {
					// connected
					console.log('This guy is connected');
					alert('Да вы уже зашли, сударь!');
				} else if (response.status === 'not_authorized') {
					// not_authorized
					console.log('Да вы хер с горы, сударь!');
				} else {
				// not_logged_in
				console.log('Вам необходимо зарегистрироваться!');
				loginFB();
					// I've got here to work with login() function. I guess
					// that the FB.getLoginStatus is going to transfer to the
					// login() methof in the EVENTS. This is going to be the
					// checkup if the user is already registered.
				}
			});
			break;
		case "twitter":
			twttr.anywhere(function (T) {
				T.signIn();
				T.bind("authComplete", function (e, user) {
      				// triggered when auth completed successfully
      				console.log(user);
      				var userid = user.idStr;
      				var name = user.name;
      				var userPic = user.profileImageUrl;

      				var qSearchTW = new Parse.Query('User');
      				qSearchTW.equalTo("username", userid);
      				qSearchTW.find({
						success: function(User) {
							// console.log(User.length);
							if(!User.length) {
								var newUser = new Parse.User();
								newUser.set("username", userid);
								newUser.set("password", "test");
								newUser.set("twAuth", {
									userid: userid,
									name: name,
								});
								newUser.set("userPic", userPic);

								newUser.signUp(null,
								{
								success: function(user)	{
								    app.submitRule.render();
								    re_render();
								},
								error: function(user, error) {
									// Show the error message somewhere and let the user try again.
									alert("Error: " + error.code + " " + error.message);
								}
								});
							}
							else {
								Parse.User._saveCurrentUser(User[0]);
								re_render();
							}
						},
						error: function() {

					  	}
					});	
    			});
			});
			break;
		case "vk":
			VK.Auth.login(function(response) {
			  if (response.session) {
			    	var userid = response.session.mid;
			    	console.log(response.session);

					var qSearchVK = new Parse.Query('User');
					qSearchVK.equalTo("username", userid);
					qSearchVK.find({
						success: function(User) {
							// console.log(User.length);
							if(!User.length) {
								var newUser = new Parse.User();
								newUser.set("username", userid);
								newUser.set("password", "test");
								newUser.set("vkAuth", {
									userid: userid,
									name: response.session.user.first_name + " " + response.session.user.last_name
								});

								newUser.signUp(null,
								{
								success: function(user)	{
								    app.submitRule.render();
								    re_render();
								},
								error: function(user, error) {
									// Show the error message somewhere and let the user try again.
									alert("Error: " + error.code + " " + error.message);
								}
								});
							}
							else {
								Parse.User._saveCurrentUser(User[0]);
								re_render();
							}
						},
						error: function() {

					  	}
						});						
						}
					// });
			  // });
			  //  else {
			  // 	}
			// }
		});
		break;
		case "gplus": 
			gapi.client.load('plus', 'v1', function() { 
				// alert("gplus sdk loaded");
				var clientId = '923974640051-ht5uitgkdjvl4pmhf4qlm5o22qaad211.apps.googleusercontent.com';
				var apiKey = 'AIzaSyAM24v0bbMXxesyKUTwoWDpkwfVUv-fcXo';
				var scopes = 'https://www.googleapis.com/auth/plus.me';
				gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: false}, function(authResult){
					// console.log(authResult);
					var request = gapi.client.plus.people.get({
          				'userId': 'me'
            		});
      				request.execute(function(resp) {
						// console.log(resp);
						var userid = resp.id;
						var name = resp.displayName;

						var qSearchGplus = new Parse.Query('User');
						qSearchGplus.equalTo("gplusID", userid);
						qSearchGplus.find({
							success: function(User) {
								if(!User.length) {
									var newUser = new Parse.User();
									newUser.set("username", userid);
									newUser.set("password", "test");
									newUser.set("gplusAuth", {
										userid: userid,
										name: name
									});
									newUser.set("gplusID", userid);

									newUser.signUp(null,
									{
									success: function(user)	{
										re_render();
									},
									error: function(user, error) {
										// Show the error message somewhere and let the user try again.
										alert("Error: " + error.code + " " + error.message);
									}
									});
								}
								else {
									Parse.User._saveCurrentUser(User[0]);
									re_render();
								}
							},
							error: function() {

							}
						})
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

//////////////
// ON START //
//////////////
var app    = new AppView();
var router = new Router();
$(function() {
   Parse.history.start(); 
});

