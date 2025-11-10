import { io } from 'socket.io-client'

export const socket = io('http://localhost:3000/',{
  reconnectionDelay: 10000, // defaults to 1000
  reconnectionDelayMax: 10000, // defaults to 5000 
  autoConnect:false
})