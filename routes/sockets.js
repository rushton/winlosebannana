
var socketio = require('socket.io'),
    util = require('util');

var currentRoomId = 0;
var numPlayers = 0;
function init(app)
{
   var io = socketio.listen(app, {log: false});
   io.sockets.on('connection', function(socket){

     socket.on('set nickname', function(nickname){
        socket.set('nickname', nickname, function(){
           var roomName = 'room' + currentRoomId;
           socket.join(roomName);
           socket.set('room', roomName);
           numPlayers++;
           if (numPlayers >= 3)
           {
              var cards = shuffle(['Win', 'Lose', 'Bannana']);
              io.sockets.clients(roomName).forEach(function(socket,i){
                socket.emit('deal', cards[i]); 
              });
              numPlayers = 0;
              currentRoomId++;
           }

           socket.emit('ready');
        });
     });

     socket.on('msg', function(msg){
        socket.get('nickname', function(err,nickname){
           socket.get('room', function(err,roomname){
              console.log(msg);
              io.sockets.in(roomname).emit('msg',util.format("Room:%s %s : %s", roomname, nickname, msg));
           });
        })
     });
   });
}


function shuffle ( myArray ) {
  var i = myArray.length, j, tempi, tempj;
  if ( i == 0 ) return false;
  while ( --i ) {
     j = Math.floor( Math.random() * ( i + 1 ) );
     tempi = myArray[i];
     tempj = myArray[j];
     myArray[i] = tempj;
     myArray[j] = tempi;
   }
   return myArray;
}
exports.init = init;
