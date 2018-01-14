var socket;
var myName;
var scoreboardRows;
var $playground;
$(function(){
    socket = io.connect();
    var $userForm = $('#userForm'); //Form
    var $username = $('#username'); //Textfield
    var $loginDiv = $('#LoginDiv');
    var $mainArea = $('#website');
    var $createRoomButton = $('#createRoomButton'); //Button
     //Textfield
    $playground = $('#playground');
    var $roomChooserTab = $('#roomChooserTab');
    myName = 'default';
    scoreboardRows = [];

    $userForm.submit(function(e){
        e.preventDefault();
        if($username.val() == ''){
            alert("Du musst einen Namen eingeben.");
        }else {
            console.log('Eingabe Client: ' + $username.val());
            socket.emit('new User', $username.val());
            myName = $username.val();
            $username.val('');
        }
    });

    socket.on('redundant Username', function(data){
        alert(data + " ist bereits vergeben. Bitte nimm einen anderen Nutzernamen.");
        console.log('Eingabe Client: '+data);
    });

    socket.on('successfull Username', function () {
        console.log("Müsste jetzt die GUI ändern")
        $loginDiv.hide();
        $mainArea.show();
    });

    $createRoomButton.submit(function(e){
        e.preventDefault();
        socket.emit('create Room', $roomName.val());
        $roomName.val('');
    });

    socket.on('refresh Players', function(data){
        console.log("Refresh Players");
        $('#playerArea').empty();
        for(var i = 0; i < data.length; i++){
            //TODO: Alle Spielernamen müssen der Liste hinzugefügt werden
            $('#playerArea').append('<div class="player">'+data[i]._name+'</div>');
        }
    });

    socket.on('return rooms', function(data){
        $playground.empty();
        $playground.append('<div id="RoomChooserArea">')
        if(data.length == 0){
            $playground.append('Keine Räume gefunden.'); //TODO: Anzeige sollte mittig sein
        }else{
            //TODO: Auflistung der Räume in der GUI
            var roomsExist = false;
            for(var i = 0; i < data.length; i++){
                if(data[i]._fullOrPlaying == 0) {
                    roomsExist = true;
                    $playground.append('<div class="Room" val="' + data[i]._roomname + '" onclick="joinRoom(\'' + data[i]._roomname + '\')">' + data[i]._roomname + '</div>');
                }
            }
            if(roomsExist == false){
                $playground.append('Keine Räume gefunden.');
            }
        }
        $playground.append('</div><div id="RoomChooserAreaCreate" class="confirmArea">' +
            '<input id="roomName" class="textfeld">' +
            '</div>'); //TODO: Button muss noch mittig

        $('#RoomChooserAreaCreate').append('<button id="createRoomButton" value="Raum erstellen" class="button" onclick="createRoom()">Raum erstellen</button>');
    });

    socket.on('start Game error', function(){
        alert('Es sind noch nicht genügend Spieler anwesend.');
    });

    socket.on('start Game', function(room){
        console.log("Get successsfull Gamestart...");
        $playground.empty();
        var trumpColour = translateColour(room._trumpColour);
        console.log(trumpColour);
        $playground.append('<div id="trumpColourArea">Trumpf: '+trumpColour+'</div><div id="enemyArea"></div><div id="selfArea"></div>');
        var index = 0;
        for(var i = 0;i<room._players.length;i++){
            if(room._players[i]._name == myName) {
                index = i;
            }
        }
        var players = sortPlayersByIndex(index,room._players);
        for(var i = 1;i<room._players.length;i++){
            $('#enemyArea').append('<div class="player" id="player'+(i+1)+'"><div class="playerName" id="player'+i+'Name">'+players[i]._name+'</div><div class="playerCard" id="player'+(i+1)+'Card"></div></div>')
        }
        $('#selfArea').append('<select id="cardDeck" onclose="chooseCard()"></select>');

        //create Scoreboard
        var $scoreboard = $('#scoreboard');
        $scoreboard.append('<table id="scoreboardTable" "|"></table>');
        var $scoreboardTable = $('#scoreboardTable');
        for(var i = 0;i<room._playRounds+1;i++){
            for(var j = 0;j<room._players.length+1;j++){
                if(i == 0){
                    if(j == 0){
                        $scoreboardTable.append('<tr id="row'+i+'">');
                        $scoreboardTable.append('<th></th>');
                    }else if(j == room._players.length - 1){
                        $scoreboardTable.append('<th colspan="2">'+room._players[j-1]._name+'</th>');
                        $scoreboardTable.append('</tr>');
                    }else{
                        $scoreboardTable.append('<th colspan="2">'+room._players[j-1]._name+'</th>');
                    }
                }else{
                    if(j == 0){
                        $scoreboardTable.append('<tr id="row'+i+'">');
                        $scoreboardTable.append('<th>'+i+'</th>');
                    }else if(j == room._players.length - 1){
                        $scoreboardTable.append('<td class="points'+room._players[j-1]._name+'">10</td><td class="tricks'+room._players[j-1]._name+'">2</td>');
                        $scoreboardTable.append('</tr>');
                    }else{
                        $scoreboardTable.append('<td class="points'+room._players[j-1]._name+'">10</td><td class="tricks'+room._players[j-1]._name+'">2</td>');
                    }
                }
            }
        }
        console.log("GUI placed...");

    });

    socket.on('hand round Cards', function(cards){
        for(var i = 0;i<cards.length;i++){
            var cardColour = translateColour(cards[i]._colour);
            var cardValue = translateValue(cards[i]._val);
            var card = cardColour +' '+ cardValue;
            $('#cardDeck').append('<option value="'+cards[i]+'">'+card+'</option>');
            $('#cardDeck').select(null);
        }
        $('#selfArea').append('<div id="trickArea"><input id="prediction" class="textfeld"><button id="predictionButton" class="button" onclick="predictionApply()">Stichansage bestätigen</button></div>')
    });

});

function predictionApply(){

}

function chooseCard(){
    //TODO: Eingabevalidierung
    console.log("card was choosen");
    var $select = $('#cardDeck');
    var choosenCard = $select.options[$select.selectedIndex].value;
    $select.delete($select.selectedIndex);
    socket.emit('play Card', choosenCard);
}

function sortPlayersByIndex(index,players){
    var newArray = [];
    console.log("Altes Array: "+players+" -> "+players[index]+" soll erster sein");
    for(var i = index;i<players.length;i++){
        newArray.push(players[i]);
    }
    for(var i = 0;i<index;i++){
        newArray.push(players[i]);
    }
    console.log(newArray);
    return newArray;
}

function translateValue(val){
    switch (val) {
        case 0:
            return 'Narr';
        case 14:
            return 'Zauberer';
        default: return ''+val;
    }
}

function translateColour(colour){
    switch (colour) {
        case 'None':
            return 'Kein Trumpf';
        case 'red' :
            return 'Rot';
        case 'blue' :
            return 'Blau';
        case 'green' :
            return 'Grün';
        case 'yellow' :
            return 'Gelb';
        default: return 'None';
    }
}

function joinRoom(val){
    console.log(val);
    socket.emit('join Room', val);
    var $playground = $('#playground');
    $playground.empty();
    $playground.append('<div id="Lobby"><div id="LobbyHeadline"><h2>'+ val +'</h2></div><div id="playerArea"></div><div id="LobbyStartArea"></div></div>');
    socket.emit('request Players', val);
}

function createRoom(){
    console.log("Raum erstellen Button geklickt");
    var $roomName = $('#roomName');
    var check = $roomName.val();
    console.log(check);
    if(check == ""){
        alert("Bite gib einen Namen für den Raum ein.");
    }else{
        socket.emit('request roomname', check);
        socket.on('answer roomname', function (data) {
            if (data.res == 1) {
                console.log("Habe Antwort auf Raumnamen bekommen: " + data.res);
                socket.emit('new Room', check);
                //TODO: RaumerstellungsGUIladen
                $playground.empty();
                $playground.append('<div id="Lobby"><div id="LobbyHeadline"><h2>'+ check +'</h2></div><div id="playerArea"></div><div id="LobbyStartArea" class="confirmArea"><button id="startGame" class="button" onclick="startGame(\''+check+'\')">Start</button></div></div>');
                socket.emit('request Players', check);
            } else {
                alert('Der gewählte Name ist schon vergeben.');
            }
        });
    }
    console.log("Warum disconnecte ich?");
}

function startGame(roomname){
    console.log("Start Game");
    socket.emit('start Game', roomname);
}

function getRooms(){
    console.log("OnClick ausgeführt");
    socket.emit('get Rooms');
}
/* bisschen Scheiß von Richard */
function clickSpielregeln(){
        alert ("Leider fehlen hier noch die Spielregeln, versuche sie doch bitte über eine Suche bei Google zu finden! (;");
}

function clickMeinProfil(){
        alert ("Leider fehlt hier noch die Integration deines Profils..");
}

function clickOnlineshop(){
        alert ("Leider fehlt hier noch der Onlineshop, demnächst kannst du hier für Ingame-Währung neue Designs für deine Spielkarten erwerben!");
}
