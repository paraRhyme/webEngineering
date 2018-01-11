var socket;
$(function(){
    socket = io.connect();
    var $userForm = $('#userForm'); //Form
    var $username = $('#username'); //Textfield
    var $loginDiv = $('#LoginDiv');
    var $mainArea = $('#website');
    var $createRoomButton = $('#createRoomButton'); //Button
    var $roomName = $('#roomName'); //Textfield
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
            $playground.append('Keine Räume gefunden.'); //TODO: Anzeige sollte mittig sein
        }else{
            //TODO: Auflistung der Räume in der GUI
            for(var i = 0; i < data.length; i++){
                $playground.append('<div class="Room" val="'+data[i].roomname+'">'+data[i].roomname+'</div>');
            }
        }
        $playground.append('</div><div id="RoomChooserAreaButton">' +
            '<form id="createRoomForm">' +
            '<input type="submit" value="Raum erstellen" class="button">' +
            '</form>' +
            '</div>'); //TODO: Button muss noch mittig

        var $createRoomForm = $('#createRoomForm');
        $createRoomForm.submit(function(){
            console.log("Raum erstellen Button geklickt");
            var check = prompt('Geben Sie einen Namen für den Raum ein.',''); //TODO: ohne prompt lösen -> Textfeld mit Eingabe erstellen
            socket.emit('request roomname',check);
            socket.on('answer roomname', function(data){
                if(data){
                    console.log("Habe Antwort auf Raumnamen bekommen: "+data);
                    socket.emit('new Room',check);
                    //TODO: RaumerstellungsGUIladen
                    socket.emit('request Players',check);
                }else{
                    alert('Der gewählte Name ist schon vergeben.');
                }
            });
        })
    });

});
function getRooms(){
    console.log("OnClick ausgeführt");
    socket.emit('get Rooms');
}