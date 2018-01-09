$(function(){
    var socket = io.connect();
    var $userForm = $('#userForm'); //Form
    var $username = $('#username'); //Textfield
    var $loginDiv = $('#LoginDiv');
    var $mainArea = $('#field');
    var $createRoomButton = $('#createRoomButton'); //Button
    var $roomName = $('#roomName'); //Textfield

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
        alert(data + " ist bereits vergeben. Bitte nimm einen anderen Namen.");
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


});