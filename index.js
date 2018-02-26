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

function handle_callback(cq, res) {
    var mt
    var cb

    if (cq.data == undefined || cq.data.length == 0) {
        mt = '0';
        cb = '';
    }
    else if (cq.data.slice(-2) == 'AC') {
        mt = '0';
        cb = '';
    }
    else if (cq.data.length == 1) {
        if (cq.data == '+' || cq.data == '-') {
            mt = cq.message.text;
            cb = cq.message.text + cq.data;
        }
        else if (cq.message.text == '0') {
            mt = cq.data;
            cb = '';
        }
        else {
            mt = cq.message.text + cq.data;
            cb = '';
        }
    }
    else {
        if (cq.data.slice(-1) == '+' || cq.data.slice(-1) == '-') {
            if (cq.data.slice(-2, -1) == '+' || cq.data.slice(-2, -1) == '-') {
                mt = cq.message.text;
                cb = cq.data.slice(0, -2) + cq.data.slice(-1);
            }
            else {
                r = eval(cq.data.slice(0, -1))
                mt = r;
                cb = r + cq.data.slice(-1);
            }
        }
        else {
            if (cq.data.slice(-2, -1) == '+' || cq.data.slice(-2, -1) == '-') {
                mt = cq.data.slice(-1);
            }
            else {
                mt = cq.message.text + cq.data.slice(-1);
            }
            cb = cq.data;
        }
    }

    res.send({
        'method': 'editMessageText',
        'chat_id': cq.message.chat.id,
        'message_id': cq.message.message_id,
        'text': mt,
        'reply_markup': {
            'inline_keyboard': make_keys(cb)
        }
    });
}

app.post('/' + process.env['WEBHOOK_URL'], (req, res) => {
    console.log(req.body);
    if (req.body.callback_query != undefined) {
        handle_callback(req.body.callback_query, res)
    }
    if (req.body.message != undefined) {
        handle_message(req, res)
    }
});
