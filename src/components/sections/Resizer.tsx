"use client";

import { $resizerWidth, $isResizing } from "@/store/uiStore";
import { useStore } from "@nanostores/react";
import { useEffect } from "react";

export function Resizer() {
  const isResizing = useStore($isResizing);

  useEffect(() => {
    const syncInitialWidth = () => {
      if (typeof window === "undefined" || window.innerWidth < 1024) {
        return;
      }

      const container = document.querySelector(".plants-layout");
      const detailPanel = document.querySelector("#plant-detail-panel");

      if (!(container instanceof HTMLElement)) {
        return;
      }

      if ($resizerWidth.get() <= 0) {
        const containerWidth = container.getBoundingClientRect().width;
        const panelWidth = detailPanel instanceof HTMLElement ? detailPanel.getBoundingClientRect().width : containerWidth * 0.4;

        $resizerWidth.set(panelWidth);
      }
    };

    syncInitialWidth();
    window.addEventListener("resize", syncInitialWidth);

    return () => window.removeEventListener("resize", syncInitialWidth);
  }, []);

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
        const containerWidth = rect.width;
        const containerRight = rect.right;
        const newWidth = containerRight - e.clientX;
        
        const minWidth = containerWidth * 0.2; // 20%
        const maxWidth = containerWidth * 0.8; // 80%
        
        if (newWidth >= minWidth && newWidth <= maxWidth) {
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
