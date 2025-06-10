import React from 'react';
import KakaoMap from './KakaoMap';
import MarkerInfo from './MarkerInfo';

const MapContainer = ({
  mapRef,
  center,
  onMapLoad,
  markers,
  onMarkerClick,
  onInfoClose,
  onUnitClick,
}) => (
  <>
    <KakaoMap ref={mapRef} center={center} onMapLoad={onMapLoad} />
    {markers.map((m) => (
      <MarkerInfo
        key={m.id}
        id={m.id}
        map={mapRef.current && mapRef.current.__kakaoMap__}
        lat={m.lat}
        lng={m.lng}
        address={m.address}
        units={m.units}
        open={m.open}
        onMarkerClick={() => onMarkerClick(m.id)}
        onInfoClose={() => onInfoClose(m.id)}
        onUnitClick={onUnitClick}
        color="red"
      />
    ))}
  </>
);

export default MapContainer;
