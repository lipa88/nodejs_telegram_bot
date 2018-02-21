var token = '488613077:AAEuds_bXCYZ766hzA81fHdeU1BlV7HVDDc'

const express = require('express');
const bodyParser = require('body-parser');
const packageInfo = require('./package.json');

const app = express();
app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.json({
        version: packageInfo.version
    });
});

var server = app.listen(process.env.PORT, "0.0.0.0", () => {
    const host = server.address().address;
    const port = server.address().port;
    console.log('Web server started at http://%s:%s', host, port);
});

function key(n, cb) {
    // if (cb == '') {cb == n}
    return {
        "text": n,
        "callback_data": cb + n
    }
}

function make_keys(cb) {
    var res = []
    var keys_list = [
        ['AC', '+', '-'],
        ['7', '8', '9'],
        ['4', '5', '6'],
        ['1', '2', '3'],
        [' ', '0', ' '],
    ]
    keys_list.forEach(function (value_list) {
        var current_json = [];
        value_list.forEach(value => current_json.push(key(value, cb)));
        res.push(current_json);
    });
    return res
}

function handle_message(req, res) {
    var cb = ''
    res.send({
        'method': 'sendMessage',
        'text': '0',
        'chat_id': req.body.message.chat.id,
        'reply_markup': {
            'inline_keyboard': make_keys(cb)
        }
    });

}

function handle_callback(req, res) {
    var mt
    var cb

    if (req.body.callback_query.data == '+' || req.body.callback_query.data == '-'){
        mt = req.body.callback_query.message.text; 
        cb = req.body.callback_query.data;
    }
    else if (req.body.callback_query.data == "++" || req.body.callback_query.data == "--" ||req.body.callback_query.data == "-+" ||req.body.callback_query.data == "+-"){
        mt = req.body.callback_query.message.text; 
        cb = req.body.callback_query.data.slice(-1);
    }
    else if (req.body.callback_query.message.text.match(/\d+[\+\-]\d+[\+\-]/)) {
        mt = eval(req.body.callback_query.message.text.slice(0,-2));
        cb = req.body.callback_query.message.text.slice(-1);
    }
    else if (!isNaN(req.body.callback_query.data)){
        if (req.body.callback_query.message.text != '0'){
        mt = req.body.callback_query.message.text + req.body.callback_query.data;
        } 
        else {mt = req.body.callback_query.data;}
        cb = ''
    }
    else {mt = 0; cb = ''}

    res.send({
        'method': 'editMessageText',
        'chat_id': req.body.callback_query.message.chat.id,
        'message_id': req.body.callback_query.message.message_id,
        'text': mt,
        'reply_markup': {
            'inline_keyboard': make_keys(cb)
        }
    });
}

app.post('/' + process.env['WEBHOOK_URL'], (req, res) => {
    console.log(req.body);
    if (req.body.callback_query != undefined) {
        handle_callback(req, res)
    }
    if (req.body.message != undefined) {
        handle_message(req, res)
    }
});