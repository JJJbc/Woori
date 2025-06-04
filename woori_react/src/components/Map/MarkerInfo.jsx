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
      // content를 HTMLElement로 만듦
      const contentDiv = document.createElement('div');
      contentDiv.style.padding = '8px 12px';
      contentDiv.style.position = 'relative';
      contentDiv.innerHTML = info;

      const closeBtn = document.createElement('span');
      closeBtn.textContent = 'X';
      closeBtn.style.position = 'absolute';
      closeBtn.style.top = '4px';
      closeBtn.style.right = '8px';
      closeBtn.style.cursor = 'pointer';
      closeBtn.style.fontWeight = 'bold';
      closeBtn.onclick = onInfoClose;

      contentDiv.appendChild(closeBtn);

      infoWindow = new window.kakao.maps.InfoWindow({
        content: contentDiv,
        removable: false, // X버튼 직접 구현
      });
      infoWindow.open(map, marker);
    }

    return () => {
      marker.setMap(null);
      if (infoWindow) infoWindow.close();
    };
  }, [map, lat, lng, info, open, onMarkerClick, onInfoClose, id, color]);

  return null;
};

export default MarkerInfo;
