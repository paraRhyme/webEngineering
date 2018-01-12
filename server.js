#!/usr/bin/env node
//"use strict";
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

    class Player {
        constructor(name, socket){
            this.name = name;
            this.socketIndex = socket;
            this.cards = [];
            this.points = 0;
            this.prediction = 0;
            this.tricks = 0;
        }
        set cards(cards){
            this._cards = cards;
        }
        get cards(){
            return this._cards;
        }
        set socketIndex(socket){
            this._socketIndex = socket;
        }
        get socketIndex() {
            return this._socketIndex;
        }
        set name(name){
            this._name = name;
        }
        get name(){
            return this._name;
        }

        set points(set){
            this._points = set;
        }
        get points(){
            return this._points;
        }
        addPoints(val){
            this._points += val;
        }

        set prediction(set){
            this._prediction = set;
        }
        get prediction(){
            return this.prediction;
        }

        set tricks(set){
            this._tricks = set;
        }
        get tricks(){
            return this._tricks;
        }
        addTrick(){
            this._tricks++;
        }
    }

    class Room {
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

        set roomname(set){
            this._roomname = set;
        }
        get roomname(){
            return this._roomname;
        }
        set players(setter) {
            this._players = setter;
        }
        get players(){
            return this._players;
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
            //TODO: gegebenenfalls Raum löschen
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
            if(error == false) {
                console.log("Server: Name einzigartig...")
                users.push(data);
                socket.emit('successfull Username');
            }
        });

        //create Room
        socket.on('new Room', function(roomName){
            console.log("Server: Neuer Raum wird erstellt...");
            var username = users[connections.indexOf(socket)];
            console.log("Server: Username: "+username);
            var player = new Player(username,connections.indexOf(socket));
            console.log("Server: Player: "+player);
            console.log(player.socketIndex);
            var room = new Room(roomName, player);
            console.log("Server: Room: "+room);
            rooms.push(room);
            console.log("Server: Room of Array: "+rooms[0]);
            console.log('Server: Raum mit Namen "'+ roomName +'" erstellt');
        });

        //join Room
        socket.on('join Room', function(roomName){
            var index = 0;
            for(var i = 0;i<rooms.length;i++){
                if(rooms[i].roomname == roomName){
                    index = i;
                }
            }
            var room = rooms[index];
            room.addPlayer(new Player(users[users.indexOf(connections.indexOf(socket))],connections.indexOf(socket)));
            for(var i = 0; i < room.players.length;i++){
                connections[room.players[i].socketIndex].emit('refresh Players', room.players);
            }
        });

        //ckeckout for Rooms
        socket.on('get Rooms', function(){
            console.log("Server: got Room request")
            socket.emit('return rooms', rooms);
        });

        //redundant roomName?
        socket.on('request roomname', function(data){
            var result = true;
            if(rooms.length >=1){
                for(var i = 0;i < rooms.length;i++){
                    if (rooms[i] == data){
                        result = false; //TODO: funktion überprüfen
                    }
                }
            }
            socket.emit('answer roomname', result);
        });

        socket.on('request Players', function(roomName){
            console.log("Server: Raumname: "+roomName);
            var index = 0;
            for(var i = 0;i<rooms.length;i++){
                if(rooms[i].roomname == roomName){
                    index = i;
                }
            }
            var room = rooms[index];
            console.log(room);
            console.log('Server: Raumindex: '+index);
            for(var i = 0; i < room.players.length;i++){
                console.log("server: Daten an "+room.players[i]._name+" werden gesendet...");
                //TODO: Fehler finden -> Irgendein Modul spinnt hier rum
                console.log("Server: "+room.players[i]);
                console.log('Server: '+connections[room.players[i].socketIndex]);
                connections[room.players[i].socketIndex].emit('refresh Players', room.players);
                console.log("Server: Daten an "+room.players[i]._name+" wurden gesendet...");
            }
        });
    });




