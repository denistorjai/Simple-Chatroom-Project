function Message({ Message, Author }) {
  return (
    <>
    <div className='flex flex-col h-24 p-5 rounded w-128 bg-[#0C0F1B] justify-self-center align-bottom mb-3' >
      <h1 className="self-start mb-2" > {Author} </h1>
      <h1 className="self-start text-sm " > {Message} </h1>
    </div>
    </>
  )
}

export default Message
