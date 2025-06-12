import React, { useEffect, useRef } from 'react';

const KAKAO_SDK_URL =
  'https://dapi.kakao.com/v2/maps/sdk.js?appkey=1b17628cd47f21a6b296c1f7b69422e2&autoload=false&libraries=services';

const KakaoMap = React.forwardRef(({ center, onMapLoad }, ref) => {
  const initialized = useRef(false);

  useEffect(() => {
    if (!ref.current || initialized.current) return;

   
    const loadMap = () => {
      if (!window.kakao || !window.kakao.maps) return;
      window.kakao.maps.load(() => {
        if (!ref.current || initialized.current) return;
        const map = new window.kakao.maps.Map(ref.current, {
          center: new window.kakao.maps.LatLng(center.lat, center.lng),
          level: 3,
        });
        ref.current.__kakaoMap__ = map;
        initialized.current = true;
        if (onMapLoad) onMapLoad(map);
      });
    };

    if (!window.kakao || !window.kakao.maps) {
      const script = document.createElement('script');
      script.src = KAKAO_SDK_URL;
      script.async = true;
      script.onload = loadMap;
      document.head.appendChild(script);
    } else {
      loadMap();
    }
  }, [center, onMapLoad, ref]);

  return (
    <div
      ref={ref}
      style={{
        width: '100%',
        height: '700px',
        border: '2px solid #333',
      }}
    />
  );
});

export default KakaoMap;
