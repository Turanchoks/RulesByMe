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
	objectId: string        // Parse unique id for each object
	username: string        // first user_id from social network he/she come
	password: string        // some generated password
	authData ??             // not used in our project, standart Parse thing
	emailVerified: Boolean  // not used now
	email: string           // not used now
	url: string             // not used now
    vk_id: number           // user_id in vKontakte
    facebook_id: number     // user_id in facebook
    twitter_id: number      // user_id in twitter
    gplus_id:   number      // user_id in Google Plus
    author_name: string     // name we used in Rules By field (from first social)
    userPic: string         // url to user avatar (from fitsr social)
	voted: [
		ruleid // id of rule which has been voted for
	]
	createdAt: Date // Parse
	updatedAt: Date // Parse
	ACL: // Parse
}
