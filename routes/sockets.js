
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
           io.sockets.in(roomName).emit('new player joined', {id: socket.id, handle: nickname});
           var currentPlayers = [];
           io.sockets.clients(roomName).forEach(function(socket){
              // @todo replace with official method, kind of hackish right now
              currentPlayers.push({handle:socket.store.data.nickname, id:socket.id});
           });
           socket.emit('players list',currentPlayers);
           numPlayers++;
           console.log("numplayers: " + numPlayers);
           if (numPlayers >= 3)
           {
              var cards = shuffle(['Win', 'Lose', 'Bannana']);
              io.sockets.clients(roomName).forEach(function(socket,i){
                socket.emit('deal', cards[i]); 
                if (cards[i] === 'Win'){
                   io.sockets.in(roomName).emit('winner', {id: socket.id, handle: socket.store.data.nickname});
                }
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
              var msgPackage = {handle: nickname, message: msg};
              io.sockets.in(roomname).emit('msg',msgPackage);
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
