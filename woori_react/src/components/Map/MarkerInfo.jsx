import { useEffect } from 'react';

const MarkerInfo = ({
  map,
  lat,
  lng,
  address,
  units,
  open,
  onMarkerClick,
  onInfoClose,
  onUnitClick,
  id,
  color = 'red',
}) => {
  useEffect(() => {
    if (!map) return;

    // 작은 점 마커
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
      // 주소 + 호수 리스트(내림차순)
      const sortedUnits = [...units].sort((a, b) =>
        b.unitNo.localeCompare(a.unitNo, 'ko-KR', { numeric: true })
      );
      const unitListHTML = `
        <ul style="margin:8px 0 0 0; padding:0; list-style:none;">
          ${sortedUnits
            .map(
              (u) =>
                `<li style="margin-bottom:4px;"><a href="#" data-unit="${u.unitNo}" style="color:blue;text-decoration:underline;cursor:pointer;">${u.unitNo}</a></li>`
            )
            .join('')}
        </ul>
      `;
      const content = `
  <div id="info-window-${id}" style="padding:8px 12px;">
    <div>${address}</div>
    ${unitListHTML}
  </div>
`;

      infoWindow = new window.kakao.maps.InfoWindow({
        content,
        removable: true,
      });
      infoWindow.open(map, marker);

      // 각 호수 클릭 이벤트 연결
      window.kakao.maps.event.addListener(infoWindow, 'domready', () => {
        const container = document.getElementById(`info-window-${id}`);
        if (!container) return;
        sortedUnits.forEach((u) => {
          const el = container.querySelector(`[data-unit="${u.unitNo}"]`);
          if (el) {
            el.onclick = (e) => {
              e.preventDefault();
              onUnitClick(u.unitNo);
            };
          }
        });
      });

      window.kakao.maps.event.addListener(infoWindow, 'close', onInfoClose);
    }

    return () => {
      marker.setMap(null);
      if (infoWindow) infoWindow.close();
    };
  }, [
    map,
    lat,
    lng,
    address,
    units,
    open,
    onMarkerClick,
    onInfoClose,
    onUnitClick,
    id,
    color,
  ]);

  return null;
};

export default MarkerInfo;
