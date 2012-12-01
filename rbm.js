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
		increment = parseInt($(e.srcElement).data('add-rating'));		//Очень не нравится подумайте пожалуйста как сделать лучше!!!
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
		$('.leftColumn').append(this.el);
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
var AppView = Parse.View.extend({
	initialize: function() {
		this.render();
	}, 
	render: function() {
		var self = this;
        $('.rightColumn').prepend($('#template-gifLoader').html());
		this.navBar = new NavBarView();
		this.submitRule = new SubmitRuleView();
        this.rulesNav = new RulesNav();
        this.rulesView = new RuleCollectionView();
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
//////////////////////
// HELPER FUNCTIONS //
//////////////////////
function queryRules(condition, userId) {
	var now   = new Date(); // today
	var query = new Parse.Query(RuleObject);
	query.descending('rating');
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
	};
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
		"best/:period": "getBest"
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
	oneRule: function(id) {},
	about: function() {}
});
//////////////
// ON START //
//////////////
var app    = new AppView();
var router = new Router();
$(function() {
   Parse.history.start(); 
});