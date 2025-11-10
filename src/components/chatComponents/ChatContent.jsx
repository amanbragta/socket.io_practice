'use client'
import { socket } from '@/socket'
import { useEffect, useState } from 'react'

function ChatContent() {
    const [message, setMessage] = useState('')
    const [username, setUsername] = useState('')
    const [partnername, setPartnername] = useState('')
    const [userId, setUserId] = useState('')
    const [list, setList] = useState([])
    const [partnerId, setPartnerId] = useState('')

    useEffect(()=>{
            if (!userId || !partnerId) return;
            socket.connect()
            socket.on('connect',()=> console.log('recovered -->', socket.recovered))
            // socket.on('disconnect',()=> console.log('disconnected -->'))
            socket.emit('join-room', {userId, partnerId})
            socket.on('load-messages',(res)=>{
            setList(res)})
            socket.on('newMessage',({message, senderId, result})=>{
            setList(prev=>[...prev,{content:message, senderId}])
            // socket.auth.offSet = offSet})
            })
            return ()=> socket.disconnect()
  
    },[userId, partnerId])

    function sendMessage(){
        if(userId && partnerId){
            console.log("message sent")
        socket.emit('message', {message, userId, partnerId})
        setMessage('')
        }
       
    }
  return (
    <div>
        <div>
            <input type='text'className='border rounded-md p-2' onChange={(e)=>setUsername(e.target.value)}/>
            <button className='bg-blue-400 p-2 rounded-md' onClick={()=>setUserId(username)}>Register user</button>
        </div>
        <div>
            <input type='text'className='border rounded-md p-2' onChange={(e)=>setPartnername(e.target.value)}/>
            <button className='bg-blue-400 p-2 rounded-md' onClick={()=>setPartnerId(partnername)}>Register partner</button>
        </div>
        <div>
             <input type='text' value={message} onChange={(e)=>setMessage(e.target.value)} className='border rounded-md p-2'/>
        <button className='bg-blue-400 p-2 rounded-md' onClick={sendMessage}>Send</button>
        <button className='bg-blue-400 p-2 rounded-md' onClick={()=>socket.io.engine.close()}>Disconnect</button>
        <button className='bg-blue-400 p-2 rounded-md' onClick={()=>{socket.connect()}}>Connect</button>
        </div>
        <ul>
            {list.map((item, index)=>{
                return <li key={index}>{item.content} {'->'} {item.senderId}</li>
            })}
        </ul>
    </div>
  )
}

export default ChatContent