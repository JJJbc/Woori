import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';


const CustomOverlayWrapper = ({
  map,
  position,
  open,
  children,
  zIndex = 3,
  onClose,
}) => {
  const overlayRef = useRef(null);
  const containerRef = useRef(document.createElement('div'));

  useEffect(() => {
    if (!map || !open) return;

   
    overlayRef.current = new window.kakao.maps.CustomOverlay({
      position: new window.kakao.maps.LatLng(position.lat, position.lng),
      content: containerRef.current,
      xAnchor: 0.5,
      yAnchor: 1.2,
      zIndex,
      clickable: true
    });

    overlayRef.current.setMap(map);

    const root = ReactDOM.createRoot(containerRef.current);
    root.render(children);

    
    return () => {
      overlayRef.current.setMap(null);
      root.unmount();
    };
  }, [map, position.lat, position.lng, open, children, zIndex]);

 
  return null;
};

export default CustomOverlayWrapper;
