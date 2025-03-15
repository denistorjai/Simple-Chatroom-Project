function Message({ Message, Author, IsCurrentUser, IsEdited, EditTimestamp, onEdit, onDelete }) {
  return (
    <div className={`flex flex-col p-5 rounded w-128 ${IsCurrentUser ? 'bg-[#0F1B2A]' : 'bg-[#0C0F1B]'} justify-self-center align-bottom mb-3`}>
      <div className="flex justify-between mb-2">
        <h1 className={`self-start ${IsCurrentUser ? 'text-blue-300' : ''}`}> 
          {Author} {IsCurrentUser && <span className="text-xs opacity-60">(you)</span>} 
        </h1>
        {IsCurrentUser && (
          <div className="flex gap-2">
            <button 
              onClick={onEdit}
              className="text-xs text-gray-400 hover:text-gray-200"
            >
              Edit
            </button>
            <button 
              onClick={onDelete}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Delete
            </button>
          </div>
        )}
      </div>
      <div className="flex flex-col">
        <h1 className="self-start text-sm">{Message}</h1>
        {IsEdited && (
          <span className="text-xs text-gray-500 mt-1">
            edited {EditTimestamp ? new Date(EditTimestamp).toLocaleString() : ''}
          </span>
        )}
      </div>
    </div>
  );
}

export default Message;