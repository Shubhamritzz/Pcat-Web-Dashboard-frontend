import React from 'react'
import Sidebar from './Sidebar'
import { Outlet } from 'react-router-dom'

function MainLayou() {
    return (
        <div className="flex">

            <Sidebar />


            <div className="flex-1 ml-64 bg-gray-100 min-h-screen p-6">
                <Outlet />
            </div>
        </div>
    )
}

export default MainLayou