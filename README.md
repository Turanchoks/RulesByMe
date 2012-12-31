RulesByMe
=========

Database Structure
---------------
_Italic_ 				- 	default Parse fields  
<del>Strikeout</del> 	- 	fields not in use 

### Rule

* _objectId: string_
* author: string
* rating: number
* rule1: string
* rule2: string
* rule3: string
* user: pointer to `User Object`
* _createdAt: Date_
* _updatedAt: Date_
* _ACL:ACL_

### User 

* _objectId: string_
* username: string        	// first user_id from social network he/she come
* password: string        	// some generated password
* <del>authData: authData</del>
* <del>emailVerified: boolean</del>
* <del>email: string</del>
* <del>url: string</del>
* vk_id: number           	// user id in vKontakte
* facebook_id: number     	// user id in facebook
* twitter_id: number      	// user id in twitter
* gplus_id:   number      	// user id in Google Plus
* author_name: string     	// name we used in Rules By field (from first social)
* userPic: string         	// url to user avatar (from first social)
* voted: one-to-many relation between `User` and `Rule`
* _createdAt: Date_
* _updatedAt: Date_
* _ACL:ACL_