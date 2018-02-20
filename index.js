var token = '488613077:AAEuds_bXCYZ766hzA81fHdeU1BlV7HVDDc'

const express = require('express');
const bodyParser = require('body-parser');
const packageInfo = require('./package.json');

const app = express();
app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.json({ version: packageInfo.version });
});

var server = app.listen(process.env.PORT, "0.0.0.0", () => {
  const host = server.address().address;
  const port = server.address().port;
  console.log('Web server started at http://%s:%s', host, port);
});

app.post('/' + process.env['WEBHOOK_URL'], (req, res) => {
  console.log(req.body);
  res.sendStatus(200);
});
