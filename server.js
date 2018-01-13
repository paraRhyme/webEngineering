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

    class Card {
        constructor(colour, val){
            this.colour = colour;
            this.val = val;
        }

        set colour(set){
            this._colour = set;
        }
        get colour(){
            return this._colour;
        }

        set val(set){
            this._val = set;
        }
        get val(){
            return this._val;
        }
    }

    //0 = Narr, 14 = Wizard

    class Player {
        constructor(name, socket){
            this.name = name;
            this.socketIndex = socket;
            this.cards = [];
            this.points = [];
            this.predictions = [];
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
            this._points.push(this._points[this._points.length - 1] + val);
        }

        set predictions(set){
            this._predictions = set;
        }
        get predictions(){
            return this._predictions;
        }
        addPrediction(pred){
            this._predictions.push(pred);
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
            this.cardDeck = [];
            this.fullOrPlaying = 0;
            this.roomname = name;
            this.players = [];
            this.players.push(player);
            this.trumpColour = 'none';
        }
        addPlayer(player){
            this._players.push(player);
            if(this._players.length == 6){
                this._fullOrPlaying = 1;
            }
        }
        removePlayer(playername){
            for(var i = 0;i< this._players.length;i++){
                if(this._players[i]._name == playername){
                    this._players.splice(this._players[i],1);
                }
            }
            this._fullOrPlaying = 0;
        }

        set fullOrPlaying(set){
            this._fullOrPlaying = set;
        }
        get fullOrPlaying(){
            return this._fullOrPlaying;
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
        set trumpColour(set){
            this._trumpColour = set;
        }
        get trumpColour(){
            return this.trumpColour;
        }
        set cardDeck(set){
            this._cardDeck = set;
        }
        get cardDeck() {
            return this._cardDeck;
        }
        createCardDeck(){
            this._cardDeck = [new Card("red",0), new Card("red",1), new Card("red",2), new Card("red",3), new Card("red",4), new Card("red",5), new Card("red",6), new Card("red",7), new Card("red",8), new Card("red",9), new Card("red",10), new Card("red",11), new Card("red",12), new Card("red",13), new Card("red",14), new Card("blue",0), new Card("blue",1), new Card("blue",2), new Card("blue",3), new Card("blue",4), new Card("blue",5), new Card("blue",6), new Card("blue",7), new Card("blue",8), new Card("blue",9), new Card("blue",10), new Card("blue",11), new Card("blue",12), new Card("blue",13), new Card("blue",14), new Card("green",0), new Card("green",1), new Card("green",2), new Card("green",3), new Card("green",4), new Card("green",5), new Card("green",6), new Card("green",7), new Card("green",8), new Card("green",9), new Card("green",10), new Card("green",11), new Card("green",12), new Card("green",13), new Card("green",14), new Card("yellow",0), new Card("yellow",1), new Card("yellow",2), new Card("yellow",3), new Card("yellow",4), new Card("yellow",5), new Card("yellow",6), new Card("yellow",7), new Card("yellow",8), new Card("yellow",9), new Card("yellow",10), new Card("yellow",11), new Card("yellow",12), new Card("yellow",13), new Card("yellow",14)];
        }
        shuffleCards() {
            var currentIndex = this._cardDeck.length, temporaryValue, randomIndex ;

            // While there remain elements to shuffle...
            while (0 !== currentIndex) {

                // Pick a remaining element...
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;

                // And swap it with the current element.
                temporaryValue = this._cardDeck[currentIndex];
                this._cardDeck[currentIndex] = this._cardDeck[randomIndex];
                this._cardDeck[randomIndex] = temporaryValue;
            }
        }
        handRoundCards(number){
            for(var i =0;i<this.players.length;i++){
                var cards = [];
                for(var j = 0; j < number;j++){
                    cards.push(this.cardDeck[0]);
                    this.cardDeck.splice(this.cardDeck[0],1);
                }
                this.players[i]._cards = cards;
            }
        }
        getTrumpColour(){
            if(this.cardDeck.length == 0){
                this._trumpColour = 'None';
            }else if(this._cardDeck[0]._val == 0) {
                this._trumpColour = 'None';
            }else{
                this._trumpColour = this._cardDeck[0]._colour;
            }
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
            for(var i = 0;i<rooms.length;i++){
                for(var j = 0;j<rooms[i]._players.length;j++){
                    if(rooms[i]._players[j]._name == users[index]){
                        rooms[i].removePlayer(users[index]);
                        var room = rooms[i];
                        for(var x = 0; x < room._players.length;x++){
                            connections[room._players[x]._socketIndex].emit('refresh Players', room._players);
                        }
                        console.log(room._players);
                    }
                }
            }
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
                console.log("Server: Name einzigartig...");
                users[connections.indexOf(socket)] = data;
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
            console.log("Server: Join-Anfrage");
            var index = 0;
            for(var i = 0;i<rooms.length;i++){
                if(rooms[i].roomname == roomName){
                    index = i;
                }
            }
            var room = rooms[index];
            room.addPlayer(new Player(users[connections.indexOf(socket)],connections.indexOf(socket)));
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
            var result = 1;
            if(rooms.length >=1){
                for(var i = 0;i < rooms.length;i++){
                    if (rooms[i]._roomname == data){
                        result = 0; //TODO: funktion überprüfen
                    }
                }
            }
            socket.emit('answer roomname', { res: result});
        });

        socket.on('request Players', function(roomName){
            var room = getRoom(roomName);
            socket.emit('refresh Players', room.players);
        });

        socket.on('start Game', function(roomname){
            console.log("Start Game...");
            var room =  getRoom(roomname);
            if(room._players.length < 3){
                console.log("Throw start Game error...");
                socket.emit('start Game error');
            }else{
                room._fullOrPlaying = 1;
                console.log("Start Game successfull...");
                socket.emit('start Game', room);
                gameController(room);
            }
        });

        function getRoom(roomName){
            var index = 0;
            for(var i = 0;i<rooms.length;i++){
                if(rooms[i]._roomname == roomName){
                    index = i;
                }
            }
            return rooms[index];
        }

        function gameController(room){
            console.log("Initialize Game...");
            for(var round = 0;round < (60 / room._players.length);round++){
                room.createCardDeck();
                room.shuffleCards();
                room.handRoundCards(round);
                room.getTrumpColour();
                for(var i = 0; i < room._players.length;i++){
                    connections[room._players[i]._socketIndex].emit('hand round Cards', room._players[i]._cards);
                    connections[room._players[i]._socketIndex].emit('hand out TrumpColour', room._trumpColour);
                }

            }
        }

    });




