import React from 'react';

export default function Header({ content }){
    return(
        <div>
            <h1 className="text-3xl py-4 font-bold mb-6 text-gray-800">{content.title}</h1>
            <p className="py-4">{content.blurb}</p>
        </div>
    );
}