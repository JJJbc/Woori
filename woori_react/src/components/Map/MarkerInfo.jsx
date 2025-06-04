import { useEffect } from 'react';

const MarkerInfo = ({
  map,
  lat,
  lng,
  info,
  open,
  onMarkerClick,
  onInfoClose,
  id,
  color = 'red',
}) => {
  useEffect(() => {
    if (!map) return;

    // 아주 작은 점 마커(SVG)
    const markerImage = new window.kakao.maps.MarkerImage(
      `data:image/svg+xml;utf8,<svg width="8" height="8" xmlns="http://www.w3.org/2000/svg"><circle cx="4" cy="4" r="4" fill="${color}"/></svg>`,
      new window.kakao.maps.Size(8, 8)
    );

    const marker = new window.kakao.maps.Marker({
      position: new window.kakao.maps.LatLng(lat, lng),
      map: map,
      image: markerImage,
      zIndex: 2,
    });

    marker.addListener('click', onMarkerClick);

    let infoWindow;
    if (open) {
      infoWindow = new window.kakao.maps.InfoWindow({
        content: info, // 주소+표 HTML 문자열
        removable: true,
      });
      infoWindow.open(map, marker);

      // X버튼 클릭 시 onInfoClose 호출
      window.kakao.maps.event.addListener(infoWindow, 'close', onInfoClose);
    }

    return () => {
      marker.setMap(null);
      if (infoWindow) infoWindow.close();
    };
  }, [map, lat, lng, info, open, onMarkerClick, onInfoClose, id, color]);

  return null;
};

export default MarkerInfo;
