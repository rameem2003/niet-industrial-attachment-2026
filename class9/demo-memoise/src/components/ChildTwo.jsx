import React, { memo } from 'react'

const ChildTwo = ({ onClick }) => {
    console.log("child Rendering");

    return (
        <div>
            <button className=' bg-blue-600 p-4 text-white' onClick={onClick} >Show Name</button>
        </div>
    )
}

export default memo(ChildTwo)
