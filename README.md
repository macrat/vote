vote!
=====

Real time vote system for lightning talk event.

## Requirement
server: node.js

client: Modern browser that supports HTML5.

## Usage
First, please change password of administrator page.
This option is defined in app.js.

Next, install required package with npm. Then, start server.
```
	$ npm install
	$ node app.js
```
Lastly, access to port 8080 with browser.

## URLs
- /

	Client page.
	Make vote and view ranking.

- /admin

	Administrator page.
	Change page of client view, edit speakers list, and reset votes.

- /ranking.json

	Download score data.

## Files
- app.js

	Server program.

- package.json

	Defines for npm.

- scores.json

	Speakers and scores. Make by app.js.

- index.html

	Client program.

- admin.html

	Admin page program.

- README.md

	This file.


## License / Author
MIT License (c)2015 [MacRat](http://blanktar.jp/)
