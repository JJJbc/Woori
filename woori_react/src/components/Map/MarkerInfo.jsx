import { useEffect } from 'react';

const MarkerInfo = ({ map, lat, lng, content }) => {
  useEffect(() => {
    if (!map || !window.kakao || !window.kakao.maps) return;

    const marker = new window.kakao.maps.Marker({
      position: new window.kakao.maps.LatLng(lat, lng),
      map: map,
    });

    const infoWindow = new window.kakao.maps.InfoWindow({
      content: content,
    });
    infoWindow.open(map, marker);

    return () => {
      marker.setMap(null);
      infoWindow.close();
    };
  }, [map, lat, lng, content]);

  return null;
};

export default MarkerInfo;
