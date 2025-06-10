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
      const safeUnits = Array.isArray(units) ? units : [];
      const sortedUnits = [...safeUnits].sort((a, b) =>
        (a.detail || '').localeCompare(b.detail || '', 'ko-KR', { numeric: true })
      );
      console.log('MarkerInfo units:', units);
      console.log('MarkerInfo sortedUnits:', sortedUnits);

      const unitListHTML = `
        <ul style="margin:8px 0 0 0; padding:0; list-style:none;">
          ${sortedUnits
            .map(
              (u) =>
                `<li style="margin-bottom:4px;">
                  <a href="#" data-unit="${u._id || u.id}" style="color:blue;text-decoration:underline;cursor:pointer;">
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

      window.kakao.maps.event.addListener(infoWindow, 'domready', () => {
        console.log('domready fired', id);
        const container = document.getElementById(`info-window-${id}`);
        console.log('container:', container);
        sortedUnits.forEach((u) => {
          const el = container && container.querySelector(`[data-unit="${u._id || u.id}"]`);
          console.log('el:', el, u._id || u.id);
          if (el) {
            el.onclick = (e) => {
              e.preventDefault();
              console.log('onUnitClick 호출', u._id || u.id, u);
              onUnitClick(u._id || u.id);
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
    id,
    onMarkerClick,
    onInfoClose,
    onUnitClick,
    color,
  ]);

  return null;
};

export default MarkerInfo;
