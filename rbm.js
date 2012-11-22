////////////
// CONFIG //
////////////
var config = {
	ruleTemplate: $('#template-rule').html(),
	divRules: $('div.rules'),
	submission: {
		rulesby: $('input#author'),
		rule1: $('input#rule1'),
		rule2: $('input#rule2'),
		rule3: $('input#rule3')
	},
};
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
var RuleObject = Parse.Object.extend('Rule', {});
// var RuleCollection = Parse.Collection.extend({
// 	model: RuleObject,
// });

///////////
// VIEWS //
///////////
var RuleView = Parse.View.extend({
	className: 'rule',
	tagName: 'li',
	template: Parse._.template($('#template-rule').html()),
	initialize: function() {
		this.model.on('change', this.render, this);
		this.render();
	},
	render: function() {
		var data = Parse._.extend(this.model.toJSON(), {
			time: this.model.createdAt
		});
		this.$el.attr('id', 'rule-id-' + this.model.id).html(this.template(data));
		return this;
	}
});
var RuleCollectionView = Parse.View.extend({
	id: 'rulesList',
	tagName: 'ul',
	initialize: function() {
		this.collection.on('add', this.addOne, this);
		this.render();
	},
	render: function() {
		this.collection.forEach(this.addOne, this);
		$('.rightColumn').append(this.el);
	},
	addOne: function(ruleModel) {
		var ruleView = new RuleView({
			model: ruleModel
		});
		this.$el.prepend(ruleView.el); // FADE IN ON
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
		var ruleObjectToPublish = new RuleObject({
			rule1: config.submission.rule1.val(),
			rule2: config.submission.rule2.val(),
			rule3: config.submission.rule3.val(),
			author: config.submission.rulesby.val(),
			author_url: 'jlksjad.com'
		});
		ruleObjectToPublish.save();
		RulesByMe.ruleCollection.add(ruleObjectToPublish);		
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
		this.navBar = new NavBarView;
		this.submitRule = new SubmitRuleView;
		if(Parse.User.current()){

		} else {
			queryRules('bestOfMonth').fetch({
				success: function(collection) {
					self.rulesView = new RuleCollectionView({collection: collection});
				},
				error: function(collection, error) {
					throw new Error(error);
				}
			});
		}
	}
});
//////////////////////
// HELPER FUNCTIONS //
//////////////////////
function queryRules(condition) {
	var now   = new Date(); // today
	var query = new Parse.Query(RuleObject);
	query.descending('rating');
	switch(condition) {
		case 'bestOfMonth':
			var date = new Date(now.getFullYear(), now.getMonth(), 1,0,0,0,0);
			query.greaterThanOrEqualTo('createdAt', date);
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
		"newest": "getNewest"
	},
	initialize: function() {},
	index: function() {},
	getNewest: function() {},
	oneRule: function(id) {},
	about: function() {}
});
//////////////
// ON START //
//////////////
// Parse.History.start();
var app    = new AppView;
var router = new Router;
//////////
// SHIT //
//////////

// function renderRule(rule){
// 	return _.template(config.ruleTemplate, rule.toJSON());
// }
// $('a.btn').click(function(){
// 	var ruleObject = new RuleObject();
// 	ruleObject.set({
// rule1: 'test1',
// rule2: 'test2',
// rule3: 'test3',
// author: 'test_author',
// author_url: 'test_author_url',
// 	});
// 	ruleObject.save(null, {
// 		success: function(ruleObject) {
// 			console.log(ruleObject.toJSON())
// 		},
// 		error: function(ruleObject, error) {
// 			console.log(ruleObject, error)
// 		}
// 	});
// });

// var query = new Parse.Query(RuleObject);
// query.find({
// 	success: function(results){
// 		$.each(results, function(i){
// 			console.log(this.toJSON())
// 		})
// 	},
// 	error: function(error) {
// 		console.log(error);
// 	}
// });


// var ruleCollectionView = new RuleCollectionView ({collection: ruleCollection});
// ruleCollection.fetch({
// 	success: function(collection) {
// 		ruleCollectionView.render();
// 		$('#right-column').append(ruleCollectionView.$el);
// 	},
// 	error: function(collection, error) {
// 		console.warn(error);
// 	}
// });
// Date.prototype.getWeek = function() {
// 	var onejan = new Date(this.getFullYear(),0,1);
// 	return Math.ceil((((this - onejan) / 86400000) + onejan.getDay()+1)/7);
// }