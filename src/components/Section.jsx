import React from 'react'

function Section({ title, children }) {
    return (
        <div className="bg-white min-w-[400px] rounded-xl shadow-lg p-6 md:p-8 mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-3">
                {title}
            </h3>
            {children}
        </div>
    )
}

export default Section