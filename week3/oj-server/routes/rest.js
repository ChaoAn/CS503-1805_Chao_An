const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const problemService = require('../services/problemService');

const nodeRestClient = require('node-rest-client').Client;

const restClient = new nodeRestClient();

EXECUTOR_SERVER_URL = 'http://localhost:5000/build_and_run';
restClient.registerMethod('build_and_run', EXECUTOR_SERVER_URL, 'POST');

// get all problems
router.get('/problems', (req, res) => {
	problemService.getProblems()
		.then(problems => res.json(problems));
});

// get single problem
router.get('/problems/:id', (req, res) => {
	const id = req.params.id;
	problemService.getProblem(+id)
		.then(problem => res.json(problem));
});

// add a new problem
router.post('/problems', jsonParser, (req, res) => {
	problemService.addProblem(req.body)
		.then(problem => {
			res.json(problem);
		}, error => {
			res.status(400).send('Problem name already exists!');
		});
});

router.post('/build_and_run', jsonParser, (req, res) => {
	const code = req.body.code;
	const lang = req.body.lang;

	console.log('lang: ', lang, ' code: ', code)

	restClient.methods.build_and_run({
		data: {code: code, lang: lang},
		headers: {'Content-Type': 'application/json'},	
	}, (data, response) => {
		const text = `Build output: ${data['build']}, execute output: ${data['run']}`;
		res.json(text);
	});
});

module.exports = router;