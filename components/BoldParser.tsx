import React from 'react';

const BoldParser: React.FC<{ text: string }> = ({ text }) => {
    // Split on the markdown-style bold delimiter, keeping the delimiter
    // e.g., "Hello **world**!" -> ["Hello ", "**world**", "!"]
    const parts = text.split(/(\*\*.*?\*\*)/g).filter(Boolean);
    return (
        <>
            {parts.map((part, i) =>
                part.startsWith('**') && part.endsWith('**') ? (
                    <strong key={i}>{part.slice(2, -2)}</strong>
                ) : (
                    part
                )
            )}
        </>
    );
};

export default BoldParser;