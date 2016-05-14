var express = require('express');
var app = express();

app.use('/public', express.static('public'));


app.get('*', function(req, resp) {
	resp.sendFile(__dirname + '/index.html');
});

app.listen(9977, function () {
  console.log('WebRTC Workshop app is listening on port 9977!');
});
