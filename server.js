#!/usr/bin/env node

// set up ========================
    var express  = require('express');
    var app      = express();                               // create our app w/ express
    var server   = require('http').createServer(app);
    var io = require('socket.io').listen(server);
    var mongoose = require('mongoose');                     // mongoose for mongodb
    var morgan = require('morgan');             // log requests to the console (express4)
    var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
    var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
    var connections = [];
    var users = [];
    var rooms = [];
    class player {
        constructor(username, socket){
            this.username = username;
            this.socket = socket;
        }
        getCards(cards){
            this.cards = cards;
        }
    }
    class room {
        constructor(name, player){
            this.roomname = name;
            this.players = [];
            this.players.push(player);
        }
        addPlayer(player){
            players.push(player);
        }
        removePlayer(player){
            players.splice(players.indexOf(player),1);
        }
    }

    // configuration =================

    // mongoose.connect('mongodb://node:nodeuser@mongo.onmodulus.net:27017/uwO3mypu');     // connect to mongoDB database on modulus.io

    app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users
    app.use(morgan('dev'));                                         // log every request to the console
    app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
    app.use(bodyParser.json());                                     // parse application/json
    app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
    app.use(methodOverride());

    // listen (start app with node server.js) ======================================
    server.listen(3000);
    console.log("App listening on port 3000");

    io.sockets.on('connection', function(socket){
        //Connect
        connections.push(socket);
        console.log('Connected: %s sockets connected', connections.length);

        //Disconnect
        socket.on('disconnect', function(data){
            var index = connections.indexOf(socket);
            connections.splice(index, 1);
            users.splice(index, 1);
            console.log('Disconnected: %s sockets connected', connections.length);
        });

        //create User
        socket.on('new User', function(data){
            console.log("Server: Namen bekommen -> "+data);
            var error = false;
            if(users.length >= 1) {
                for (var i = 0; i < users.length; i++) {
                    console.log("Server: " + users[i]);
                    if (users[i] == data) {
                        console.log("Server: Name doppelt...")
                        socket.emit('redundant Username', data);
                        error = true;
                    }
                }
            }
            if(!(error)) {
                console.log("Server: Name einzigartig...")
                users.push(data);
                socket.emit('successfull Username');
            }
        });

        //create Room
        socket.on('new Room', function(roomName){
            var error = false;
            if(rooms.length >=1){
                for(var i = 0;i < rooms.length;i++){
                    if (rooms[i] == roomName){
                        socket.emit('redundant Roomname', roomName);
                        error = true;
                    }
                }
            }
            if(!(error)) {
                rooms.push(roomName, new player(users[users.indexOf(connections.indexOf(socket))], socket));
                socket.emit('successfull Roomcreation', roomName);
            }
        });

        //join Room
        socket.on('join room', function(roomName){
            var index = rooms.indexOf(roomName);
            rooms[index].addPlayer(new player(users[users.indexOf(connections.indexOf(socket))],socket))
            for(var i = 0; i < rooms[index].players.length;i++){
                rooms[index].players.socket.emit('refresh Players', rooms[index].players);
            }
        });

        //ckeckout for Rooms
        socket.on('get Rooms', function(){
            socket.emit('return rooms', rooms);
        });
    });




