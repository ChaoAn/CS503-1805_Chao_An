const express = require('express');
const path = require('path');
const app = express();

// connect to mongodb
const mongoose = require('mongoose');
mongoose.connect('mongodb://user:user123456@ds229373.mlab.com:29373/1805_problems');

const restRouter = require('./routes/rest');
const indexRouter = require('./routes/index');

// app.get('/', (req, res) => {
// 	res.send('Hello world from express!');
// });
app.use('/api/v1', restRouter);
app.use(express.static(path.join(__dirname, '../public')))

app.listen(3000, () => {
	console.log('App is listening on port 3000!');
});

app.use((req, res) => {
	res.sendFile('index.html', { root: path.join(__dirname, '../public') });
});