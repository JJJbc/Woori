import { useEffect } from 'react';

const MarkerInfo = ({
  map,
  lat,
  lng,
  address,
  units, // [{ _id, detail, ... }]
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
      // units가 배열이 아닐 수 있으니 방어 코드 추가
      const safeUnits = Array.isArray(units) ? units : [];
      // detail 기준 오름차순 정렬 (detail이 없으면 빈 문자열로 처리)
      const sortedUnits = [...safeUnits].sort((a, b) =>
        (a.detail || '').localeCompare(b.detail || '', 'ko-KR', { numeric: true })
      );
      // 주소 + detail 리스트
      const unitListHTML = `
        <ul style="margin:8px 0 0 0; padding:0; list-style:none;">
          ${sortedUnits
            .map(
              (u) =>
                `<li style="margin-bottom:4px;">
                  <a href="#" data-unit="${u._id}" style="color:blue;text-decoration:underline;cursor:pointer;">
                    <b>${u.detail || ''}</b>
                  </a>
                </li>`
            )
            .join('')}
        </ul>
      `;
      const content = `
        <div id="info-window-${id}" style="padding:8px 12px;">
          <div><b>${address}</b></div>
          ${unitListHTML}
        </div>
      `;

      infoWindow = new window.kakao.maps.InfoWindow({
        content,
        removable: true,
      });
      infoWindow.open(map, marker);

      // 각 detail(호수) 클릭 이벤트 연결
      window.kakao.maps.event.addListener(infoWindow, 'domready', () => {
        const container = document.getElementById(`info-window-${id}`);
        if (!container) return;
        sortedUnits.forEach((u) => {
          const el = container.querySelector(`[data-unit="${u._id}"]`);
          if (el) {
            el.onclick = (e) => {
              e.preventDefault();
              onUnitClick(u._id);
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
