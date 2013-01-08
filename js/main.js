////////////
// CONFIG //
////////////

var baseUrl = "http://rulesby.me/turanchoks";
var baseUrlV = "http://rulesby.me/vanadium23";
//DEBUG


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
		if(Views[this.el.getAttribute('id')]) Views[this.el.getAttribute('id')].remove;	
		Views[this.el.getAttribute('id')] = this;
		if(this.init) this.init();
		if(this.model) this.model.on('change', this.render, this);
		if(this.collection) this.collection.on('change', this.render, this);
		if(this.collection) this.collection.on('add', this.render, this);
		this.render();	
	},
	remove: function() { // change standart behavior of View.remove() to make it detach events
		this.$el.empty().undelegate();
		return this;
	}
});
Parse.initialize("7NWULxIRFzuMWrQ6bX1O8mm357Nz7jfHEWXhPevn", "yQmxvt5eKgJfbSCePpBM040ZUMj3iNHiucWBlpas");

function dateToString(date) {
	var trimmedDate = date.getFullYear().toString();
	trimmedDate += '-';
	trimmedDate += (date.getMonth().toString().length == 1) ? '0'+ (date.getMonth()+1).toString() : (date.getMonth()+1).toString();
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
		if (app.error) app.error.remove(); 

		var now = new Date();
		var objectToPublish = {
			rule1: $('input#rule1').val(),
			rule2: $('input#rule2').val(),
			rule3: $('input#rule3').val(),
			author: $('input#author').val()
		};

		var error = [];

		for (var i = 1; i < 4; i++) {
			if($('input#rule' + i).parent().hasClass("error")) {
				$('input#rule' + i).parent().removeClass("error");
			}

			if(trim(objectToPublish['rule' + i]).length < 3) {
				error.push("Правило №"+i+" не может быть меньше 3-х букв!");
				$('input#rule' + i).parent().addClass("error");
			}

			if ( trim(objectToPublish['rule' + i]).match(/<\/*[a-z][^>]+?>/gi) ) {
				error.push("Правило №"+i+" не может быть содержать html-разметку!");
				$('input#rule' + i).parent().addClass("error");
			}

			if (trim(objectToPublish['rule' + i]).length > 140) {
				error.push("Правило №"+i+" не может быть больше 140 символов!");
				$('input#rule' + i).parent().addClass("error");	
			}

		};

		if (error != "") {
			app.error = new ErrorView(error);
			return;
		}

		$("leftColumnFirstDiv").html(Handlebars.compile($('#template-gifLoader').html()));

		Parse.Cloud.run('addRule', objectToPublish, {
			success: function(obj) {
				$('.submission').find('input').val(''); // Clear inputs
				app.addedView = new addedView(obj);
			},
			error: function(error, obj) {
				app.addedView = new addedView(obj, error);	
			}
		});
	}
}


var Share = {
    vkontakte: function(options) {
        url  = 'http://vkontakte.ru/share.php?';
        url += 'url='          + encodeURIComponent(options.url);
        url += '&title='       + encodeURIComponent(options.title);
        url += '&description=' + encodeURIComponent(options.text);
        url += '&image='       + encodeURIComponent(options.img);
        url += '&noparse=true';
        Share.popup(url);
    },
    facebook: function(options) {
        url  = 'http://www.facebook.com/sharer.php?s=100';
        url += '&p[title]='     + encodeURIComponent(options.title);
        url += '&p[summary]='   + encodeURIComponent(options.text);
        url += '&p[url]='       + encodeURIComponent(options.url);
        url += '&p[images][0]=' + encodeURIComponent(options.img);
        Share.popup(url);
    },
    twitter: function(options) {
        url  = 'http://twitter.com/share?';
        url += 'text='      + encodeURIComponent(options.title);
        url += '&url='      + encodeURIComponent(options.url);
        url += '&counturl=' + encodeURIComponent(options.url);
        url += '&hashtags=' + encodeURIComponent(options.hashtag)
        Share.popup(url);
    },
    popup: function(url) {
        window.open(url,'','toolbar=0,status=0,width=626,height=436');
    },
    go: function(model, social) {
    	console.log(model, social);
    	if(!model || !Share[social]) return;
		var shareObj = {
			url: baseUrl+'#rule/'+model.get('num_id'),
			title: 'Rules by ' + model.get('author_name'),
			text: '1. ' + model.get('rule1') + '\n' + ' 2. ' + model.get('rule2') + '\n' + ' 3. ' + model.get('rule3'),
			image: 'http://rulesby.me/img/logo_rbm.png',
			hashtag: 'RulesByMe'
		};
		Share[social](shareObj);
    }
};


////////////////
// STRUCTURE  //
////////////////
var RuleObject = Parse.Object.extend('Rule',{});
var RuleCollection = Parse.Collection.extend({
 	model: RuleObject
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
		'click .share img' : 'share'
	},
	init: function() {
		this.model.set('datetime', dateToString(this.model.createdAt));
		this.model.set('author_url', '#author/'+this.model.get('user'));
	},
	ratingChange: function(e) {
		if(!Parse.User.current()) 	{
			$('#login-modal').modal('toggle');
			return;
		}
		else {
	        var increment = parseInt($(e.target).data('add-rating'));
	  		this.model.increment('rating', increment);
	        this.undelegateEvents('click .ratingChange');
	        Parse.Cloud.run('ratingChange', { "RuleID": this.model.id, "increment": increment }, {
	  			success: function(rule) {

	  			},
	  			error: function(error) {
					app.error = new ErrorView([error.message]);
	  			}
			});
		}
	},
	share: function(e) {
		Share.go(this.model, e.srcElement.getAttribute('data-social'));
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
		if(Views[this.el.getAttribute('id')]) Views[this.el.getAttribute('id')].remove;
		Views[this.el.getAttribute('id')] = this;
		this.toRender = {error_text: error};
		if(this.model) this.model.on('change', this.render, this);
		if(this.collection) this.collection.on('change', this.render, this);
		if(this.collection) this.collection.on('add', this.render, this);
		this.render();	
	}
});

var addedView = Parse.View.extend({
	el: $('#leftColumnFirstDiv'),
	template: Handlebars.compile($('#template-addedView').html()),
	events: {
		'click #copy': 'copy',
		'click .share img' : 'share',
		'click .again': 'again'
	},
	initialize: function(rule, error) {
		if(Views[this.el.getAttribute('id')]) Views[this.el.getAttribute('id')].remove();
		Views[this.el.getAttribute('id')] = this;
		this.model = rule;
		this.toRender = {
			url: baseUrl,
			id: rule.get('num_id'),
		 	error: error ?  error.message : ""
		};
		this.render();	
	},
	render: function() {
		this.$el.html(this.template(this.toRender));
	},
	copy: function () {
		var text_input = document.getElementById('url');
		text_input.focus();
		text_input.select();
	},
	again: function() {
		app.submitRule = new SubmitRuleView();
	},
	share: function(e) {
		Share.go(this.model, e.srcElement.getAttribute('data-social'));
	}
});

var PaginationView = Parse.View.extend({
	el: $('#pagination'),
	template: Handlebars.compile($('#template-pagination').html()),
	initialize: function() {
		Views[this.el.getAttribute('id')] = this;
		this.render();
	},
	render: function(where, page) {
		if(page) {
			var toRender = {
				prev: '#'+where+'/'+(page-1),
				next: '#'+where+'/'+(page+1)
			};			
		} else {
			var toRender = {
				next: '#'+where+'/1',
				isFirst: true
			};				
		};
		this.$el.html(this.template(toRender));
	}
});

var AppView = Parse.View.extend({
	render: function() {
		this.navBar         = new NavBarView();
		this.rulesNav       = new RulesNav();
		this.rulesView      = new RuleCollectionView();
		this.submitRule     = new SubmitRuleView();
		this.LogInView      = new LogInView();
		this.paginationView = new PaginationView();
	}
});

//////////////////////
// HELPER FUNCTIONS //
//////////////////////
function queryRules(condition, options) {
	var now   = new Date(); // today
	var query = new Parse.Query(RuleObject);
	var rulesPerFetch = 5;
	query.ascending('rating');
	query.limit(rulesPerFetch);
	query.descending('createdAt');
	if(options.page) query.skip(rulesPerFetch*options.page);
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
        	query.equalTo('user', parseInt(options.id));
            break;
        case 'oneRule':
        	query.equalTo("num_id", parseInt(options.id));
        	break;
        case 'new':
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
		"": "newRules",
		"rule/:id": "oneRule",
		"author/:id": "rulesByAuthor",
		"about": "about",
		"best/:period": "getBest",
		"best/:period/:page": "getBest",
        "myRules" : "myRules",
        "newRules" : 'newRules',
        "newRules/:page": "newRules",
	},
	initialize: function() {},
	index: function() {

	},
	getBest: function(period,page) {
		if(page) var page = parseInt(Math.abs(page));
        queryRules(period, {page: page}).fetch({
            success: function(collection) {
                app.rulesView.collection = collection.sortBy(function(rule) {
                	return rule.get('createdAt')
                });;
                app.rulesView.render();
                app.paginationView.render("best/"+period, page);
            }
        });
	},
    myRules: function() {
    	if(page) var page = parseInt(Math.abs(page));
		queryRules('byAuthor', {id: Parse.User.current().id, page: page}).fetch({
            success: function(collection) {
                app.rulesView.collection = collection;
                app.rulesView.render();
                app.paginationView.render("myRules", page);
            }, 
            error: function() {
            	console.error(arguments)
            }
        });
    },
	oneRule: function(id) {
		(queryRules('oneRule', {id:id})).fetch({
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
    	if(page) var page = parseInt(Math.abs(page));
    	queryRules('byAuthor', {id:id, page: page}).fetch({
            success: function(collection) {
            	console.log(collection);
                app.rulesView.collection = collection.sortBy(function(rule) {
                	return rule.get('createdAt')
                });
                app.rulesView.render();
                app.paginationView.render("author/"+id, page);
            }, 
            error: function() {
            	console.error(arguments)
            }
        });
    },
    newRules: function(page) {
		if(page) var page = parseInt(Math.abs(page));
    	queryRules('new', {page: page}).fetch({
            success: function(collection) {
                app.rulesView.collection = collection.sortBy(function(rule) {
                	return rule.get('createdAt')
                });
                app.rulesView.render();
                app.paginationView.render("newRules", page);
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
function loginWith(provider, user) {
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
