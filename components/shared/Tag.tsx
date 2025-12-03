import React from 'react';

interface TagProps {
    children: React.ReactNode;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    className?: string;
    title?: string;
    category?: 'form' | 'material' | 'lever' | 'default';
}

const Tag: React.FC<TagProps> = ({ children, onClick, className = '', title, category = 'default' }) => {
    const categoryStyles = {
        default: {
            base: "bg-blue-100 border-blue-200 text-blue-800",
            hover: "hover:bg-blue-200 hover:border-blue-300",
            focus: "focus:ring-blue-500"
        },
        form: {
            base: "bg-teal-100 border-teal-200 text-teal-800",
            hover: "hover:bg-teal-200 hover:border-teal-300",
            focus: "focus:ring-teal-500"
        },
        material: {
            base: "bg-amber-100 border-amber-200 text-amber-800",
            hover: "hover:bg-amber-200 hover:border-amber-300",
            focus: "focus:ring-amber-500"
        },
        lever: {
            base: "bg-rose-100 border-rose-200 text-rose-800",
            hover: "hover:bg-rose-200 hover:border-rose-300",
            focus: "focus:ring-rose-500"
        }
    };

    const styles = categoryStyles[category] || categoryStyles.default;
    
    const baseClasses = `font-mono text-xs font-medium mr-2 mb-1 px-2.5 py-0.5 rounded-full inline-block border ${styles.base}`;

    if (onClick) {
        return (
            <button
                onClick={onClick}
                onMouseDown={e => e.stopPropagation()} // Prevent parent drag
                className={`${baseClasses} transition-colors ${styles.hover} active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-1 ${styles.focus} ${className}`}
                title={title}
            >
                {children}
            </button>
        );
    }

    return (
        <span className={`${baseClasses} ${className}`}>
            {children}
        </span>
    );
};

export default Tag;