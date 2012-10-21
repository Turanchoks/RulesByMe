var config = {
	ruleTemplate: $('#rule-tmp').html(),
	divRules: $('div.rules'),
	submission: {
		rulesby: $('input#author'),
		rule1: $('input#rule1'),
		rule2: $('input#rule2'),
		rule3: $('input#rule3')
	},
}


Parse.initialize("7NWULxIRFzuMWrQ6bX1O8mm357Nz7jfHEWXhPevn", "yQmxvt5eKgJfbSCePpBM040ZUMj3iNHiucWBlpas");



// STRUCTURE 

var RuleObject = Parse.Object.extend('Rule', {});
var RuleCollection = Parse.Collection.extend({model: RuleObject});
var ruleCollection = new RuleCollection();
var RuleView = Parse.View.extend({
	className: 'rule',
	template: _.template(config.ruleTemplate),
	initialize: function(){
		this.model.on('change', this.render, this);
	},
	render: function() {
		this.$el.attr('id','rule-id-'+this.model.id).html(this.template(this.model.toJSON()));
		return this;
	}
});
var RuleCollectionView = Parse.View.extend({
	id: 'rulesList',
	initialize: function(){
		this.collection.on('add', this.addOne, this);
	},
	render: function(){
		this.collection.forEach(this.addOne, this);
	},
	addOne: function(ruleModel){
		var ruleView = new RuleView({model: ruleModel});
		ruleView.render()
		this.$el.prepend(ruleView.$el.fadeToggle('slow'));
	}	
});
var ruleCollectionView = new RuleCollectionView ({collection: ruleCollection});
ruleCollection.fetch({
	success: function(collection) {
		ruleCollectionView.render();
		$('#right-column').append(ruleCollectionView.$el);
	},
	error: function(collection, error) {
		console.warn(error);
	}
});


// SUBMISSION
$('.btn.publish').click(function(){
	var ruleObjectToPublish = new RuleObject({		
		rule1: config.submission.rule1.val(),
		rule2: config.submission.rule2.val(),
		rule3: config.submission.rule3.val(),
		author: config.submission.rulesby.val(),
		author_url: 'jlksjad.com'
	});
	ruleObjectToPublish.save();
	ruleCollection.add(ruleObjectToPublish);
});



// STYLE


// EXPEREMENTAL





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

