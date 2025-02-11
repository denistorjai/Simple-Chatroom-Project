import { useState } from 'react'

function Messagebox({ PostMessage }) {

  // Get Text
  const [ message, setmessage ] = useState("")

  return (
    <>
    <div className='flex flex-col w-128 justify-self-center' >
    <textarea className='bg-[#0C0F1B] rounded border-[#1B1E29] border-2 p-2 pt-1 md:resize-y focus:outline-none' 
    rows={4} cols={40} 
    value={message}
    onChange={ (e) => setmessage(e.target.value) }
    />
    <button className='mt-6 bg-[#1B1E29] w-27 h-8 rounded-md self-end cursor-pointer' onClick={() => PostMessage(message)} > Post </button>
    </div>
    </>
  )
}

export default Messagebox
