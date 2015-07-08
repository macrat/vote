var PASSWORD = 'admin';  // please change this.

function sendHTML(fname, res){
	fs.readFile(fname, 'utf-8', function(err, data){
		if(err){
			res.writeHead(500, {'Content-Type': 'text/plain'});
			res.end('server error.');
		}else{
			res.writeHead(200, {'Content-Type': 'text/html'});
			res.end(data);
		}
	});
}

var fs = require('fs');
var server = require('http').createServer(function(req, res){
	switch(req.url){
		case '/':
			sendHTML('index.html', res);
			break;
		case '/admin':
			sendHTML('admin.html', res);
			break;
		case '/ranking.json':
			res.writeHead(200, {'Content-Type': 'application/json'});
			res.end(JSON.stringify(getRanking(), null, '\t'));
			break;
		default:
			res.writeHead(404, {'Content-Type': 'text/plain'});
			res.end('not found.');
			break;
	}
}).listen(8080, function(){
	console.log('start listen...');
});

var io = require('socket.io').listen(server);

var scores = {};
try{
	scores = JSON.parse(fs.readFileSync('scores.json', 'utf-8'));
}catch(e){}
var current = null;
var scoreChanged = false;

function saveScore(func){
	console.log('save');
	fs.writeFile('scores.json', JSON.stringify(scores, null, '\t'), func);
	scoreChanged = false;
}
function autoSave(){
	if(scoreChanged){
		saveScore(function(){
			setTimeout(autoSave, 10*1000);
		});
	}else{
		setTimeout(autoSave, 10*1000);
	}
}
autoSave();

function getRanking(){
	return Object.keys(scores).map(function(x){
		return { name:x, good:scores[x].good, bad:scores[x].bad };
	}).sort(function(a, b){
		if(a.good == 0 && a.bad == 0 && b.good == 0 && b.bad == 0){
			if(a.name < b.name){
				return -1;
			}else{
				return 1;
			}
		}else if(a.good == 0 && a.bad == 0){
			return 1;
		}else if(b.good == 0 && b.bad == 0){
			return -1;
		}else{
			var ascore = a.good - a.bad;
			var bscore = b.good - b.bad;
			if(ascore > bscore){
				return -1;
			}else if(ascore < bscore){
				return 1;
			}else{
				if(a.good > b.good){
					return -1;
				}else if(a.good < b.good){
					return 1;
				}else{
					if(a.name < b.name){
						return -1;
					}else{
						return 1;
					}
				}
			}
		}
	});
}

io.sockets.on('connection', function(socket){
	console.log('connection:', socket.client.conn.remoteAddress);

	if(current != null){
		socket.emit(current[0], current[1]);
		if(current[0] == 'speaker'){
			socket.emit('good', scores[current[1]].good);
			socket.emit('bad', scores[current[1]].bad);
		}
	}

	socket.on('good', function(){
		if(current[0] == 'speaker'){
			scoreChanged = true;
			scores[current[1]].good++;
			io.sockets.emit('good', scores[current[1]].good);
		}
	});
	socket.on('bad', function(){
		if(current[0] == 'speaker'){
			scoreChanged = true;
			scores[current[1]].bad++;
			io.sockets.emit('bad', scores[current[1]].bad);
		}
	});

	socket.on('admin', function(password){
		if(password != PASSWORD){
			console.log('login fail:', socket.client.conn.remoteAddress);
			socket.emit('incorrect');
		}else{
			console.log('login:', socket.client.conn.remoteAddress);

			socket.emit('speakers', Object.keys(scores));

			socket.on('reset', function(){
				console.log('reset:', socket.client.conn.remoteAddress);

				for(var x in scores){
					scores[x] = {good:0, bad:0};
				}
				current = null;

				saveScore();

				io.sockets.emit('reset');
			});

			socket.on('speaker', function(name){
				if(current != null && current[0] == 'speaker' && current[1] == name){
					return;
				}
				console.log('speaker:', name, ':', socket.client.conn.remoteAddress);

				current = ['speaker', name];
				io.sockets.emit('speaker', name);
				io.sockets.emit('good', scores[current[1]].good);
				io.sockets.emit('bad', scores[current[1]].bad);
			});

			socket.on('ranking', function(){
				if(current != null && current[0] == 'ranking'){
					return;
				}
				console.log('ranking:', socket.client.conn.remoteAddress);

				var ranking = getRanking();
				current = ['ranking', ranking];
				io.sockets.emit('ranking', ranking);
			});

			socket.on('speakers', function(speakers){
				speakers = speakers.filter(function(x, i){ return x && speakers.indexOf(x) == i; }).map(function(x){ return x.trim(); });

				console.log('change speakers:', speakers.length, ':', socket.client.conn.remoteAddress);

				newscores = {};
				for(var i in speakers){
					if(scores.hasOwnProperty(speakers[i])){
						newscores[speakers[i]] = scores[speakers[i]];
					}else{
						newscores[speakers[i]] = {good:0, bad:0};
					}
				}
				scores = newscores;
				current = null;

				saveScore();

				socket.emit('speakers', Object.keys(scores));
				io.sockets.emit('reset');
			});
		}
	});
});
