"use client";

import { $resizerWidth, $isResizing } from "@/store/uiStore";
import { useStore } from "@nanostores/react";
import { useEffect } from "react";

export function Resizer() {
  const isResizing = useStore($isResizing);

  const startResizing = () => {
    $isResizing.set(true);
    document.body.style.cursor = 'col-resize';
  };

  const stopResizing = () => {
    $isResizing.set(false);
    document.body.style.cursor = 'default';
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const container = document.querySelector('.plants-layout');
      if (container) {
        const rect = container.getBoundingClientRect();
        const containerRight = rect.right;
        const newWidth = containerRight - e.clientX;
        
        if (newWidth > 300 && newWidth < 800) {
          $resizerWidth.set(newWidth);
        }
      }
    };

    const handleMouseUp = () => {
      if (isResizing) stopResizing();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  return (
    <div id="resizer" className={`resizer ${isResizing ? 'dragging' : ''}`} onMouseDown={startResizing}></div>
  );
}
