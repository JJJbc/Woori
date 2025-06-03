import React from 'react';

const AutoComplete = ({ autoList, onClick, visible }) => {
  if (!visible || autoList.length === 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        top: '38px',
        left: 0,
        width: '260px',
        background: '#fff',
        border: '1px solid #ccc',
        borderRadius: '4px',
        zIndex: 10,
        maxHeight: '220px',
        overflowY: 'auto',
      }}
    >
      {autoList.map((place) => (
        <div
          key={place.id}
          style={{
            padding: '8px 12px',
            cursor: 'pointer',
            borderBottom: '1px solid #eee',
          }}
          onMouseDown={() => onClick(place)}
        >
          <b>{place.place_name}</b>
          <br />
          <span style={{ fontSize: '12px', color: '#888' }}>
            {place.road_address_name || place.address_name}
          </span>
        </div>
      ))}
    </div>
  );
};

export default AutoComplete;
