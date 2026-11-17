import React, { useState, useCallback } from 'react'
import ChildTwo from './ChildTwo';

const ExampleTwo = () => {
    const [name, setName] = useState(null)
    const [count, setCount] = useState(0)
    console.log("Parent Rendering");

    const showName = useCallback(() => {
        alert(name)
    }, [name])

    return (
        <div>
            <h1 className=' text-5xl text-blue-600'>React memo, useCallback Example</h1>

            <input className=' w-6/12 border-2 border-blue-600' type="text" onChange={e => setName(e.target.value)}
                placeholder='name'
            />
            <ChildTwo onClick={showName} />

            <button className=' bg-blue-600 p-4 text-white' onClick={() => setCount(p => p + 1)}>Count {count}</button>
        </div>
    )
}

export default ExampleTwo
