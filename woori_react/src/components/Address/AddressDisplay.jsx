import React from 'react';

const AddressDisplay = ({ centerAddr, clickedAddress }) => (
  <>
    <div
      style={{
        position: 'absolute',
        left: 10,
        top: 10,
        background: 'rgba(255,255,255,0.8)',
        borderRadius: '2px',
        padding: '5px',
        zIndex: 2,
      }}
    >
      <span style={{ fontWeight: 'bold' }}>지도 중심 행정동 주소: </span>
      <span>{centerAddr}</span>
    </div>
    <div
      style={{
        marginTop: '12px',
        background: '#f0f0f0',
        padding: '8px',
        borderRadius: '4px',
      }}
    >
      <b>클릭/검색 위치 주소:</b> {clickedAddress}
    </div>
  </>
);

export default AddressDisplay;
