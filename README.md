RulesByMe
=========

data structure
==============

Rule
{
	objectId: string // Parse unique id for each object
	author: { 
		id: string // user id
		url: string // user link to ???
		username: string
	}
	rating: Number
	rule1: string
	rule2: string
	rule3: string
	createdAt: Date // Parse
	updatedAt: Date // Parse
	ACL: // Parse
}

User 
{
	objectId: string
	username: string
	password: string
	authData ??
	emailVerified: Boolean
	email: string
	url: string
	voted: [
		ruleid // id of rule which has been voted for
	]
	createdAt: Date // Parse
	updatedAt: Date // Parse
	ACL: // Parse
}