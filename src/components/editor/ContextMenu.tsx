// src/components/editor/ContextMenu.tsx
import React, { useEffect, useRef } from 'react';

interface ContextMenuProps {
  x: number;
  y: number;
  items: { label: string; action: () => void; icon?: React.ReactNode }[];
  onClose: () => void;
}

export default function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Handle escape key to close menu
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="absolute bg-white border border-gray-200 rounded-md shadow-lg z-50 py-1"
      style={{ top: y, left: x }}
      onClick={onClose} // Close menu when an item is clicked
    >
      {items.map((item, index) => (
        <button
          key={index}
          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 focus:outline-none"
          onClick={item.action}
        >
          {item.icon && <span className="mr-2">{item.icon}</span>}
          {item.label}
        </button>
      ))}
    </div>
  );
}