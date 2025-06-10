import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';

// 커스텀 오버레이를 실제로 지도 위에 올리는 래퍼
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

    // 커스텀 오버레이 생성
    overlayRef.current = new window.kakao.maps.CustomOverlay({
      position: new window.kakao.maps.LatLng(position.lat, position.lng),
      content: containerRef.current,
      xAnchor: 0.5,
      yAnchor: 1.2,
      zIndex,
    });

    overlayRef.current.setMap(map);

    // React 컴포넌트를 container에 렌더링
    const root = ReactDOM.createRoot(containerRef.current);
    root.render(children);

    // 언마운트 시 오버레이 제거
    return () => {
      overlayRef.current.setMap(null);
      root.unmount();
    };
  }, [map, position.lat, position.lng, open, children, zIndex]);

  // 실제로는 아무것도 렌더링하지 않음
  return null;
};

export default CustomOverlayWrapper;
