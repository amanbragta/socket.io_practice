import next from "next";
import { createServer } from "node:http";
import { Server } from "socket.io";
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const dev = process.env.NODE_ENV !== 'production'
const app = next({dev})
const handler = app.getRequestHandler()

const db = await open({
  filename: 'chat.db',
  driver: sqlite3.Database
});

await db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT,
      senderId INTEGER,
      roomId TEXT
  );
`);

app.prepare().then(()=>{
    const httpServer = createServer((req,res)=> handler(req,res))
    const io = new Server(httpServer,{connectionStateRecovery:{}})

    io.on('connect', async (socket)=>{
        if(socket.recovered) console.log("recovered")
       console.log("connected", socket.id)
        
        const {userId} = socket.handshake.auth
        socket.on('join-room', async ({userId, partnerId})=>{
            const roomId = [userId, partnerId].sort().join("_");
            socket.join(roomId)
            socket.roomId = roomId
             const prevMessages = await db.all(`select * from messages where roomId=?`,[roomId])
             socket.emit('load-messages',prevMessages)
        })
        
        socket.on('message',async ({message, userId, partnerId})=>{
            let result;
            const roomId = [userId, partnerId].sort().join("_");
            try{
                result = await db.run('insert into messages (content, roomId, senderId) values (?,?,?)',[message, roomId, userId])
                io.to(roomId).emit('newMessage', {message, senderId:userId, result})
            } catch(err){ return; }
        })
        socket.on('disconnect',(reason)=>{
            console.log("closed-->",reason)
        })
        socket.on('connect',()=>{
            console.log("connected->",socket.recovered)
        })
        if (!socket.recovered) {
    // if the connection state recovery was not successful
        try {
        await db.each('SELECT id, content FROM messages WHERE id > ?',
            [socket.handshake.auth.serverOffset || 0],
            (_err, row) => {
            socket.emit('chat message', row.content, row.id);
            }
        )
        } catch (e) {
        // something went wrong
        }
    }
    })
    httpServer.listen(3000,()=> console.log("running on port 3000"))
})