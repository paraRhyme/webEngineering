$(function(){
    var socket = io.connect();
    var $userForm = $('#userForm'); //Form
    var $username = $('#username'); //Textfield
    var $loginDiv = $('#LoginDiv');
    var $mainArea = $('#website');
    var $createRoomButton = $('#createRoomButton'); //Button
    var $roomName = $('#roomName'); //Textfield
    var $playground = $('#cardsfield');
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

    socket.on('redundant Roomname', function(data){
        alert(data + " ist bereits vergeben. Bitte nimm einen anderen Raumnamen.");
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

    socket.on('successfull Roomcreation', function(data){
        //TODO: RaumerstellungsGUI laden
    });

    socket.on('refresh Players', function(data){
        for(var i = 0; i < data.length; i++){
            //TODO: Alle Spielernamen müssen der Liste hinzugefügt werden
        }
    });

    socket.on('return rooms', function(data){
        if(data.length == 0){
            $playground.append('Keine Räume gefunden.');
        }else{
            //TODO: Auflistung der Räume in der GUI
        }
    });


    //TODO: Tabs mit Funktionen verbinden
    $roomChooserTab.onclick = function(){
        console.log("OnClick ausgeführt");
        socket.emit('get Rooms');
    }
});