var socket;
$(function(){
    socket = io.connect();
    var $userForm = $('#userForm'); //Form
    var $username = $('#username'); //Textfield
    var $loginDiv = $('#LoginDiv');
    var $mainArea = $('#website');
    var $createRoomButton = $('#createRoomButton'); //Button
     //Textfield
    var $playground = $('#playground');
    var $roomChooserTab = $('#roomChooserTab');

    $userForm.submit(function(e){
        e.preventDefault();
        if($username.val() == ''){
            alert("Du musst einen Namen eingeben.");
        }else {
            console.log('Eingabe Client: ' + $username.val());
            socket.emit('new User', $username.val());
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
        for(var i = 0; i < data.length; i++){
            //TODO: Alle Spielernamen müssen der Liste hinzugefügt werden
        }
    });

    socket.on('return rooms', function(data){
        $playground.empty();
        $playground.append('<div id="RoomChooserArea">')
        if(data.length == 0){
            $playground.append('<h4 style="padding-top:200px; text-align:center">Keine Räume gefunden.</h4>');
        }else{
            $playground.append('</br><h id="roomsCreated">Bis jetzt wurden folgende Räume erstellt welchen du beitreten kannst:</h></br>');
            //TODO: Auflistung der Räume in der GUI
            for(var i = 0; i < data.length; i++){
                $playground.append
                    ('</br><div class="Room" val="'+data[i]._roomname+'">'+data[i]._roomname+'</div>');
            }
        }
        $playground.append(
            '</div><div id="RoomChooserAreaCreate">' +
            '<form id="createRoomForm">' +
            '<input id="roomName">' +
            '<input type="submit" value="Raum erstellen" class="button">' +
            '</form>' +
            '</div>');

        var $createRoomForm = $('#createRoomForm');
        $createRoomForm.submit(function(){
            console.log("Raum erstellen Button geklickt");
            var $roomName = $('#roomName');
            var check = $roomName.val();
            console.log(check);
            if(check == ""){
                alert("Bitte gib einen Namen für den Raum ein.");
            }else{
                socket.emit('request roomname', check);
                socket.on('answer roomname', function (data) {
                    if (data) {
                        console.log("Habe Antwort auf Raumnamen bekommen: " + data);
                        socket.emit('new Room', check);
                        //TODO: RaumerstellungsGUIladen
                        socket.emit('request Players', check);
                    } else {
                        alert('Der gewählte Name ist schon vergeben.');
                    }
                });
            }
            console.log("Warum disconnecte ich?");
        })
    });
});
function getRooms(){
    console.log("OnClick getRooms ausgeführt");
    socket.emit('get Rooms');
}

function getGameRules(){
    console.log("OnClick getGameRules ausgeführt");
    $playground.empty();
    $playground.append('</div><h2>TEST</h2>');
}

function getMyProfile(){
    console.log("OnClick getMyProfile ausgeführt");
    $playground.empty();
    $playground.append('</div><h2>TEST</h2>');
}

function getOnlineShop(){
    console.log("OnClick getOnlineShop ausgeführt");
    $playground.empty();
    $playground.append('</div><h2>TEST</h2>');
}