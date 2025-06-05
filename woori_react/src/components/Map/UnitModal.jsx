import React from 'react';

const modalStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0,0,0,0.3)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const contentStyle = {
  background: '#fff',
  padding: '24px',
  borderRadius: '8px',
  minWidth: '320px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
};

const UnitModal = ({ open, unitNo, unitData, onClose }) => {
  if (!open) return null;
  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        <h2>{unitNo} 상세 정보</h2>
        {unitData ? (
          <div>
            <p>세입자: {unitData.tenant || '정보 없음'}</p>
            <p>면적: {unitData.area || '정보 없음'}</p>
            <p>기타: {unitData.etc || '정보 없음'}</p>
          </div>
        ) : (
          <p>데이터가 없습니다.</p>
        )}
        <button onClick={onClose}>닫기</button>
      </div>
    </div>
  );
};

export default UnitModal;
