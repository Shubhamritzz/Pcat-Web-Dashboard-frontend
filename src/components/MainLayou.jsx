import React, { useState } from 'react'
import Sidebar from './Sidebar'
import { Outlet } from 'react-router-dom'
import { Menu, ArrowLeft } from 'lucide-react'

function MainLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen)
    }

    const closeSidebar = () => {
        setSidebarOpen(false)
    }

    return (
        <div className="flex w-full h-screen overflow-hidden bg-gray-100">
            {/* Mobile Toggle Button */}
            <button
                onClick={toggleSidebar}
                className=" top-4 left-4 z-50 md:hidden p-2 bg-white shadow-lg hover:bg-gray-100 transition-colors"
                aria-label="Toggle sidebar"
            >
                {sidebarOpen ? (
                    <ArrowLeft className="w-6 h-6 text-gray-800" />
                ) : (
                    <Menu className="w-6 h-6 text-gray-800" />
                )}
            </button>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={closeSidebar}
                />
            )}

            {/* Sidebar */}
            <div
                className={`fixed md:relative md:block w-64 h-screen bg-white shadow-lg transition-transform duration-300 ease-in-out z-40 
                ${sidebarOpen ? 'translate-x-10' : '-translate-x-full md:translate-x-0'}`}
            >
                <Sidebar onClose={closeSidebar} />
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <div className="w-full min-h-screen bg-gray-100 p-4 md:p-6 pt-16 md:pt-6">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

export default MainLayout