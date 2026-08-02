import React, { useState } from 'react';

export default function FloatingInput({ 
    id, 
    type = 'text', 
    label, 
    value, 
    onChange, 
    error, 
    required = false, 
    isPassword = false 
}) {
    const [showPassword, setShowPassword] = useState(false);
    
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
        <div className="relative">
            <input 
                type={inputType} 
                id={id}
                value={value} 
                onChange={onChange} 
                required={required} 
                placeholder=" "
                className={`block px-4 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-2 appearance-none focus:outline-none focus:ring-0 peer transition-colors ${isPassword ? 'pr-12' : ''} ${error ? 'border-red-500 focus:border-red-600' : 'border-gray-300 focus:border-blue-600'}`} 
            />
            <label 
                htmlFor={id} 
                className={`absolute text-sm duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-2 ${error ? 'text-red-500 peer-focus:text-red-600' : 'text-gray-500 peer-focus:text-blue-600'}`}
            >
                {label}
            </label>
            
            {isPassword && (
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                    {showPassword ? (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0l3.29 3.29m0 0l3.29 3.29m0 0l3.29 3.29" />
                        </svg>
                    ) : (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    )}
                </button>
            )}
            
            {error && <p className="text-red-500 text-xs mt-1 absolute -bottom-5">{error}</p>}
        </div>
    );
}
