import React, { memo } from 'react'

const ChildOne = ({ data }) => {
  console.log("Chil component rendering");

  return (
    <div className=' w-8/12 border-2 border-red-600 p-4'>
      Hello, This is {data.name}
    </div>
  )
}

export default memo(ChildOne)
