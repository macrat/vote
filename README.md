vote!
=====

real time vote system for lightning talk event.

## Requirement
server: node.js

client: modern browser that supports HTML5.

## Usage
first, please change password of administrator page.
this option is defined in app.js.

next, install required package with npm. then, start server.
```
	$ npm install
	$ node app.js
```
lastly, access to port 8080 with browser.

## URLs
- /

	client page.
	make vote and view ranking.

- /admin

	administrator page.
	change page of client view, edit speakers list, and reset votes.

- /ranking.json

	download score data.

## Files
- app.js

	server program.

- package.json

	defines for npm.

- scores.json

	speakers and scores. make by app.js.

- index.html

	client program.

- admin.html

	admin page program.

- README.md

	this file.


## License / Author
MIT License (c)2015 [MacRat](http://blanktar.jp/)
