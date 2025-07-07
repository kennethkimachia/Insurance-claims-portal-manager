import React from 'react'

function page() {
  return (
    <div className=' flex border border-red-500 w-full h-full'>

        <div className='border border-yellow-400 w-[1/3]'>

          File claim

        </div>
        <div className='block border border-pink-500 w-[2/3]'>
          <div className='border border-green-500'>Ongoing claims</div>
          <div className='border border-indigo-600'>Past claims</div>

      </div>
    </div>
  )
}

export default page