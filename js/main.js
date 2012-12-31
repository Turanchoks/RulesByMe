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
	if(!Parse.User.current()) 	{
		$('#login-modal').modal('toggle');
		return;
	}
	else {
		// if(Views['leftColumnHead']) Views['leftColumnHead'].remove();

		var now = new Date();
		var objectToPublish = {
			rule1: $('input#rule1').val(),
			rule2: $('input#rule2').val(),
			rule3: $('input#rule3').val(),
			author: $('input#author').val()
		};



		for (var i = 1; i < 4; i++) {
			if($('input#rule' + i).parent().hasClass("error")) {
				$('input#rule' + i).parent().removeClass("error");
			}

			if(trim(objectToPublish['rule' + i]).length < 3) {
				if (app.error) {
					app.error.initialize("Правило не может быть меньше 3-х букв!");
				}
				else {
					app.error = new ErrorView("Правило не может быть меньше 3-х букв!");
				}
				$('input#rule' + i).parent().addClass("error");
				return;
			}
			if ( trim(objectToPublish['rule' + i]).match(/<\/*[a-z][^>]+?>/gi) ) {
				if (app.error) {
					app.error.initialize("Правило не может быть содержать html-разметку!");
				}
				else {
					app.error = new ErrorView("Правило не может быть содержать html-разметку!");
				}
				$('input#rule' + i).parent().addClass("error");
				return;  				
			}
		};

		Parse.Cloud.run('addRule', objectToPublish, {
			success: function(obj) {
				$('.submission').find('input').val(''); // Clear inputs
			},
			error: function(error, obj) {
				console.error(JSON.parse(error.message).message);
			}
		});
	}
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
		this.model.set('author_url', document.location.pathname + '#author/'+this.model.get('user').id);
		this.model.set('vkShare', VK.Share.button({
		  url: 'http://rulesby.me' + document.location.pathname + '#rule/' + this.model.id,
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
			return;
		}
		else {
			// if(Views['leftColumnHead']) Views['leftColumnHead'].remove();

	        var increment = parseInt($(e.target).data('add-rating'));
	  		this.model.increment('rating', increment);
	        this.undelegateEvents('click .ratingChange');
	        Parse.Cloud.run('ratingChange', { "RuleID": this.model.id, "increment": increment }, {
	  			success: function(rule) {

	  			},
	  			error: function(error) {
					if (app.error) {
						app.error.initialize(error.message);
					}
					else {
						app.error = new ErrorView(error.message);
					}
	  			}
			});
		}
	},
	shareFB: function() {
		FB.ui({
	      method: 'feed',
	      link: 'http://rulesby.me' + document.location.pathname + '#rule/' + this.model.id,
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
		this.collection.on('reset', this.render, this);
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
	render: function() {
		this.toRender = {
        	isAuthorised: !!Parse.User.current(), 
        	username: Parse.User.current() ?  Parse.User.current().get('author_name') : ""		
		};
		this.$el.html(this.template(this.toRender));
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
	modalLogin: function() {
		$('#login-modal').modal('toggle');
	},
	render: function() {
		this.toRender = { isAuthorised: !!Parse.User.current() };
		if(Parse.User.current())
			this.toRender.name = Parse.User.current().get('author_name');
		this.$el.html(this.template(this.toRender));
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
	el: $('#rulesNav'),
	template: Handlebars.compile($('#template-rulesNav').html()),
	init: function() {

	}
});

var ErrorView = Parse.View.extend({
	el: $('#leftColumnHead'),
	template: Handlebars.compile($('#template-errorView').html()),
	initialize: function(error) {
		Views[this.el.getAttribute('id')] = this;
		this.toRender = {error_text: error};
		if(this.model) this.model.on('change', this.render, this);
		if(this.collection) this.collection.on('change', this.render, this);
		if(this.collection) this.collection.on('add', this.render, this);
		this.render();	
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
function queryRules(condition, id) {
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
        case 'byAuthor':
        	var author = new Parse.User();
        	author.id = id;
        	query.equalTo('user', author);
            break;
        case 'oneRule':
        	query.equalTo('objectId', id);
        	break;
        case 'new':
        	query.ascending('createdAt');
        	query.limit(10);
        	break;
	}
	return query.collection();
}

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
        "myRules" : "myRules",
        'newRules' : 'newRules'
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
		queryRules('byAuthor', Parse.User.current().id).fetch({
            success: function(collection) {
                app.rulesView.collection = collection;
                app.rulesView.render();
            }, 
            error: function() {
            	console.error(arguments)
            }
        });
    },
	oneRule: function(id) {
		queryRules('oneRule', id).fetch({
            success: function(collection) {
                app.rulesView.collection = collection;
                app.rulesView.render();
            }, 
            error: function() {
            	console.error(arguments)
            }
        });		
	},
	about: function() {},
    rulesByAuthor: function(id) {
    	queryRules('byAuthor', id).fetch({
            success: function(collection) {
                app.rulesView.collection = collection;
                app.rulesView.render();
            }, 
            error: function() {
            	console.error(arguments)
            }
        });
    },
    newRules: function() {
    	queryRules('new').fetch({
            success: function(collection) {
                app.rulesView.collection = collection;
                app.rulesView.render();
            }, 
            error: function() {
            	console.error(arguments)
            }
        });    	
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
			if (!Users.length) {
				var newUser = new Parse.User(user);
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
				Parse.Cloud.run("someFunc", {userID: Users[0].id, access: user.password}, {
					success: function(newUser) {
						Parse.User.logIn(user.username, user.password, {
							success: function() {
								re_render();
							},
							error: function() {

							}
						})
					},
					error: function(newUser, error) {

					}
				});
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
			FB.login(function(response) {
		        if (response.authResponse) {
				    FB.api('/me', function(response) {
					    var newUser = {
					    	username:		response.id,
					    	password: 		'12345',
					    	facebook_id: 	response.id,
					    	author_name:	response.name,
					    	// userpic: 		response.picture,
					    };
					    loginWith("facebook", newUser);
				    });
		        }
		    });
			break;
		case "twitter":
			twttr.anywhere(function (T) {
				T.signIn();
				T.bind("authComplete", function (e, user) {
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
//////////////
// ON START //
//////////////
var app    = new AppView();
var router = new Router();
$(function() {
   Parse.history.start(); 
});