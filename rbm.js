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
////////////////
// STRUCTURE  //
////////////////
var RuleObject = Parse.Object.extend('Rule');
var RuleCollection = Parse.Collection.extend({
 	model: RuleObject,
});
////////////
// FB SDK //
////////////
  // Load the SDK's source Asynchronously
  // Note that the debug version is being actively developed and might 
  // contain some type checks that are overly strict. 
  // Please report such bugs using the bugs tool.
  (function(d, debug){
     var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement('script'); js.id = id; js.async = true;
     js.src = "//connect.facebook.net/en_US/all" + (debug ? "/debug" : "") + ".js";
     ref.parentNode.insertBefore(js, ref);
   }(document, /*debug*/ false));

window.fbAsyncInit = function() {
    // init the FB JS SDK
    Parse.FacebookUtils.init({
      appId      : '452789981444955', // App ID from the App Dashboard
      status     : true, // check the login status upon init?
      cookie     : true, // set sessions cookies to allow your server to access the session?
      xfbml      : true  // parse XFBML tags on this page?
    });
    // Additional initialization code such as adding Event Listeners goes here
};

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
		this.render();
	},
	render: function(rating) {
		if (Parse._.isUndefined(this.model.toJSON().rating)) {
			this.model.set("rating", 0);							//This is exapmle of hurma! Rule need to be created with rating 0
		}

		if (Parse._.isUndefined(this.model.toJSON().rating)) {
			this.model.set("rating", rating);							//This is exapmle of hurma! Rule need to be created with rating 0
		}

		var data = Parse._.extend(this.model.toJSON(), {
			time: this.model.createdAt,
		});
		this.$el.attr('id', 'rule-id-' + this.model.id).html(this.template(data));
		return this;
	},
	ratingChange: function(e) {
        var clickedButton = $(e.srcElement);
        var ratingValue = clickedButton.siblings('.ratingValue');
		var increment = parseInt($(e.srcElement).data('add-rating'));		//Очень не нравится подумайте пожалуйста как сделать лучше!!!
		ratingValue.text(parseInt(ratingValue.text())+increment);
        this.$el.undelegate('.ratingChange', 'click');
        this.$el.find('.ratingChange').fadeOut()
        clickedButton.siblings('.ratingChange').off('click');
        Parse.Cloud.run('ratingChange', { "RuleID": this.model.id, "increment": increment }, {
  			success: function(obj) {

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
	template: $('#template-submitRule').html(),
	events: {
		'click .publish' : 'submitRule'
	},
	render: function() {
		this.$el.html(this.template);
		$('.firstLeft').html(this.el);
	},
	initialize: function() {
		this.render();
	},
	submitRule : function() {
		Parse.Cloud.run('addRule', {
			rule1: $('input#rule1').val(),
			rule2: $('input#rule2').val(),
			rule3: $('input#rule3').val(),
			author: $('input#author').val(),
			author_url: 'jlksjad.com'
		},
		{
			success: function(obj) {
				// app.rulesView.collection.add(obj); // Do not rerender the whole view by fetching data from server.
				$('.submission').find('input').val(''); // Clear inputs
			},
			error: function(obj, error) {
				console.log(error);
				alert(error.message);
				// throw new Error(error);
			}
		});
	}
});
var NavBarView = Parse.View.extend({
	el: $('#navBar'),
	template: $('#template-navBar').html(),
	initialize: function(el) {
		this.render();
	},
	render: function() {
		this.$el.html(this.template);
	}
});

var RulesNav = Parse.View.extend({
   template: $('#template-rulesNav').html(),
   className: 'rulesNav',
   initialize: function() {
       this.render();
   },
   render: function() {
       this.$el.html(this.template);
       $('.rightColumn').prepend(this.el);
   }
});
var LogInView = Parse.View.extend({
    template: $('#template-logInView').html(),
    initialize: function(){
        this.render();
    },
    render: function() {
        this.$el.html(this.template);
        $('.firstLeft').html(this.el);
    },
    events: {
		"click #loginbutton": "login",
		"keypress #password": "goOnEnter",
        "click #signupView": "signupView"
	},
	goOnEnter: function(e) {
		if(e.keyCode == 13) this.login();
	},
	login: function(e) {
		var self = this;
		Parse.User.logIn($("#email").val(), $("#password").val(), {
			success: function(user) {
                self.remove();
                app.submitRule = new SubmitRuleView();
			},
			error: function(user, error) {
				console.warn(user, error);
			}
		});
	},
    signupView: function() {
        if(app.logInView) 
            app.logInView.remove();
        app.signUpView = new SignUpView();   
    }
});
var SignUpView = Parse.View.extend({
    template: $('#template-signUp').html(),
    events: {
		"click #signupbutton": "signup",
		"keypress #password": "goOnEnter",
        "click #loginView": "loginView"
	},
    initialize: function(){
        this.render();
    },
    goOnEnter: function(e) {
		if(e.keyCode == 13) this.signup();
	},
    render: function() {
        this.$el.html(this.template);
        $('.firstLeft').html(this.el);
    },
    signup: function(e) {
        var self = this;
		var user = new Parse.User();
		user.set("username", $("#fullName").val());
		user.set("password", $("#password").val());
		user.set("email", $("#email").val());
        user.signUp(null,{
            success: function() {
                self.remove();
                app.submitRule = new SubmitRuleView();
            },
            error: function(user, error) {
                console.warn(error.message);
            }
        })
	},
    loginView: function() {
        if(app.signUpView) 
            app.signUpView.remove();
        app.logInView = new LogInView();   
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
        if(Parse.User.current()) {
        	this.submitRule = new SubmitRuleView();
        } else {
            this.logInView = new LogInView();
        }
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
		"about": "about",
		"best/:period": "getBest",
		"login": "login",
        "myRules" : "myRules",
        "logout": "logout"
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
	login: function () {
//		Parse.FacebookUtils.logIn(null, {
//		  success: function(user) {
//		    if (!user.existed()) {
//		      alert("User signed up and logged in through Facebook!");
//		    } else {
//		      alert("User logged in through Facebook!");
//		    }
//		  },
//		  error: function(user, error) {	
//		    alert("User cancelled the Facebook login or did not fully authorize.");
//		  }
//		});
	},
    logout: function() {
        Parse.User.logOut();
        app.submitRule.remove();
        app.logInView = new LogInView();
    }
});
/////////////////////
// SOCIAL NETWORKS //
/////////////////////

//
//// OPPA FACEBOOK STYLE!
//// Инициализация приложения Facebook, стандартная форма с вставленным идентификатором и введёнными функциями Parse
//window.fbAsyncInit = function() {
//    // init the FB JS SDK
//    Parse.FacebookUtils.init({
//      appId      : '452789981444955', // App ID from the App Dashboard
//      // channelUrl : '//WWW.YOUR_DOMAIN.COM/channel.html', // Channel File for x-domain communication
//      status     : true, // check the login status upon init?
//      cookie     : true, // set sessions cookies to allow your server to access the session?
//      xfbml      : true  // parse XFBML tags on this page?
//    });
//
//    // Additional initialization code such as adding Event Listeners goes here
//
//};
//
//// Load the SDK's source Asynchronously
//// Note that the debug version is being actively developed and might 
//// contain some type checks that are overly strict. 
//// Please report such bugs using the bugs tool.
//(function(d, debug){
// var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
// if (d.getElementById(id)) {return;}
// js = d.createElement('script'); js.id = id; js.async = true;
// js.src = "//connect.facebook.net/en_US/all" + (debug ? "/debug" : "") + ".js";
// ref.parentNode.insertBefore(js, ref);
//}(document, /*debug*/ false));
////Работа с поступающими при регистрации данными
//Parse.FacebookUtils.getLoginStatus(function(response) {
//  if (response.status === 'connected') {
//    var signedRequest = response.authResponse.signedRequest;
//  }
// });


//////////////
// ON START //
//////////////
var app    = new AppView();
var router = new Router();
$(function() {
   Parse.history.start(); 
});