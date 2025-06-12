import React from 'react';

const CustomOverlayInfo = ({
  address,
  units,
  onUnitClick,
  onClose,
  onAddClick,
}) => (
  <div
  onClick={e => e.stopPropagation()}
    style={{
      width: 240,
      background: '#fff',
      border: '1px solid #888',
      borderRadius: 8,
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      padding: 12,
      position: 'relative',
    }}
  >
    <div style={{ fontWeight: 'bold', marginBottom: 8 }}>{address}</div>
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {units.map((u) => (
        <li key={u._id || u.id} style={{ marginBottom: 6 }}>
          <button
            style={{
              color: 'blue',
              textDecoration: 'underline',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              padding: 0,
              font: 'inherit',
            }}
            onClick={() => onUnitClick(u._id || u.id)}
          >
            <b>{u.detail}</b>
          </button>
        </li>
      ))}
    </ul>
    <button
      onClick={onAddClick}
      style={{
        marginTop: 12,
        width: '100%',
        background: '#2d8cf0',
        color: '#fff',
        border: 'none',
        borderRadius: 4,
        padding: '8px 0',
        cursor: 'pointer',
        fontWeight: 'bold',
      }}
    >
      추가하기
    </button>
    <button
      onClick={e => {
    e.stopPropagation(); 
    onClose();
  }}
      style={{
        position: 'absolute',
        top: 8,
        right: 8,
        background: '#eee',
        border: 'none',
        borderRadius: 4,
        padding: '2px 8px',
        cursor: 'pointer',
      }}
    >
      닫기
    </button>
  </div>
);

export default CustomOverlayInfo;
