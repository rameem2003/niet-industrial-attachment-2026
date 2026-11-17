import React, { useState, useMemo } from 'react'
import ChildOne from './ChildOne'

const ExampleOne = () => {
    const [count, setCount] = useState(0)
    console.log("Parent Rendering");


    const user = useMemo(() => {
        return {
            name: "Rameem",
            email: "rameem@gmail.com"
        }
    }, [])


    return (
        <div>
            <h1 className=' text-5xl text-blue-600'>React memo, useMemo Example</h1>
            <ChildOne data={user} />
            <button className=' bg-blue-600 p-4 text-white' onClick={() => setCount(p => p + 1)}>Count {count}</button>
        </div>
    )
}

export default ExampleOne
