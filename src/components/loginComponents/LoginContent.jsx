import React from 'react'

function LoginContent() {
  return (
    <div className='flex flex-col '>
        <div>
        <input type="text" className='border rounded-md p-2'/>
      </div>
      <div>
        <button className='bg-blue-400 text-white p-2 rounded-md'>Login</button>
      </div>
    </div>
  )
}

export default LoginContent