var redisClient = require('../modules/redisClient');
const TIMEOUT_IN_SECONDS = 3600;

module.exports = function(io) {

	// collaboration sessions
	var collaborations = {};

	// map from socketId to sessionId
	var socketIdToSessionId = {};

	var sessionPath = '/temp_sessions/';

	// wait for connection from client
	io.on('connection', (socket) => {

		let sessionId = socket.handshake.query['sessionId'];

		socketIdToSessionId[socket.id] = sessionId;

		// add current socket id to collaboration session participants
		// if (!(sessionId in collaborations)) {
		// 	collaborations[sessionId] = {
		// 		'participants': []
		// 	};
		// }

		if (sessionId in collaborations) {
			collaborations[sessionId]['participants'].push(socket.id);

			let participants = collaborations[sessionId]['participants'];
			for (let i = 0; i < participants.length; i++) {
				io.to(participants[i]).emit('userChange', participants);
			}
		} else {
			redisClient.get(sessionPath + sessionId, (data) => {
				if (data) {
					console.log('session terminated previously, pulling back from redis');
					collaborations[sessionId] = {
						'participants': [],
						'cachedInstructions': JSON.parse(data)
					};
				} else {
					console.log('create new session');
					collaborations[sessionId] = {
						'participants': [],
						'cachedInstructions': []
					};
				}

				collaborations[sessionId]['participants'].push(socket.id);

				let participants = collaborations[sessionId]['participants'];
				for (let i = 0; i < participants.length; i++) {
					io.to(participants[i]).emit('userChange', participants);
				}

				console.log(collaborations[sessionId]['participants']);
			});
		}
		

		// socket event listeners
		socket.on('change', delta => {
			console.log('change from ' + socketIdToSessionId[socket.id] + ': ' + delta);
			
			let sessionId = socketIdToSessionId[socket.id];
			if (sessionId in collaborations) {
				collaborations[sessionId]['cachedInstructions']
					.push(["change", delta, Date.now()]);

				let participants = collaborations[sessionId]['participants'];
				for (let i = 0; i < participants.length; i++) {
					if (socket.id != participants[i]) {
						io.to(participants[i]).emit('change', delta);
					}
				}
			} else {
				console.log('warning: could not find socket id in collaborations!');
			}
		});

		// restore from redis
		socket.on('restoreBuffer', () => {
			let sessionId = socketIdToSessionId[socket.id];
			console.log('restore buffer for session: ' + sessionId + ', socket: ' + socket.id);

			if (sessionId in collaborations) {
				let instructions = collaborations[sessionId]['cachedInstructions'];

				for (let i = 0; i < instructions.length; i++) {
					socket.emit(instructions[i][0], instructions[i][1]);
				}
			} else {
				console.log('no collaboration found for this socket');
			}
		});

		socket.on('disconnect', () => {
			let sessionId = socketIdToSessionId[socket.id];
			console.log('disconnect session: ' + sessionId + ', socket: ' + socket.id);

			console.log(collaborations[sessionId]['participants']);

			let foundAndRemoved = false;

			if (sessionId in collaborations) {
				let participants = collaborations[sessionId]['participants'];
				let index = participants.indexOf(socket.id);

				if (index >= 0) {
					participants.splice(index, 1);
					foundAndRemoved = true;

					// if participants.length == 0, this is the last one
					// leaving the session
					if (participants.length == 0) {
						console.log('last participants is leaving, commit to redis');

						let key = sessionPath + sessionId;
						let value = JSON.stringify(
							collaborations[sessionId]['cachedInstructions']);
						redisClient.set(key, value, redisClient.redisPrint);

						redisClient.expire(key, TIMEOUT_IN_SECONDS);
						delete collaborations[sessionId];
					}
				}


				for (let i = 0; i < participants.length; i++) {
					io.to(participants[i]).emit('userChange', participants);
				}
			}

			if (!foundAndRemoved) {
				console.log('warning: could not found socket id in collaborations');
			}
		});
	});
}