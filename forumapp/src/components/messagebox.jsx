import { useState } from 'react'

function Messagebox({ PostMessage, initialText = '', onCancel = null }) {
  // Get Text
  const [message, setMessage] = useState(initialText)
  
  const handleSubmit = () => {
    if (message.trim()) {
      PostMessage(message);
      setMessage('');
    }
  }

  const isEditing = onCancel !== null;

  return (
    <div className='flex flex-col w-128 justify-self-center'> 
      <textarea 
        className='bg-[#0C0F1B] rounded border-[#1B1E29] border-2 p-2 pt-1 md:resize-y focus:outline-none' 
        rows={4} 
        cols={40} 
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={isEditing ? "Edit your message..." : "Type your message..."}
      />
      <div className='mt-6 flex justify-end'>
        {isEditing && (
          <button 
            className='mr-3 bg-[#2D3748] w-27 h-8 rounded-md cursor-pointer' 
            onClick={onCancel}
          > 
            Cancel 
          </button>
        )}
        <button 
          className='bg-[#1B1E29] w-27 h-8 rounded-md self-end cursor-pointer' 
          onClick={handleSubmit}
        > 
          {isEditing ? 'Save' : 'Post'} 
        </button>
      </div>
    </div>
  )
}

export default Messagebox