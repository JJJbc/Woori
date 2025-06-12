import React from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const customStyles = {
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 1000,
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    minWidth: '320px',
    borderRadius: '8px',
    padding: '24px',
  },
};

const UnitModal = ({ open, unitNo, unitData, onClose, onDelete, onEdit }) => {
  if (!open || !unitData) return null;

  const {
    id,
    _id,
    address,
    detail,
    rooms,
    bathrooms,
    area,
    dealType,
    price,
    lessor,
    lessorPhone,
    lessee,
    lesseePhone,
    moveInDate,
    contractPeriod,
  } = unitData || {};

  return (
    <Modal
      isOpen={open}
      onRequestClose={onClose}
      style={customStyles}
      contentLabel="유닛 상세 정보"
      shouldCloseOnOverlayClick={true}
      shouldCloseOnEsc={true}
    >
      <h2>{detail} 상세 정보</h2>
      <div>        
        <p><strong>주소:</strong> {address || '정보 없음'}</p>
        <p><strong>상세:</strong> {detail || '정보 없음'}</p>
        <p><strong>방 개수:</strong> {rooms ?? '정보 없음'}</p>
        <p><strong>욕실 개수:</strong> {bathrooms ?? '정보 없음'}</p>
        <p><strong>면적:</strong> {area ?? '정보 없음'}</p>
        <p><strong>거래유형:</strong> {dealType || '정보 없음'}</p>
        <p><strong>가격:</strong> {price ?? '정보 없음'}</p>
        <p><strong>임대인:</strong> {lessor || '정보 없음'}</p>
        <p><strong>임대인 연락처:</strong> {lessorPhone || '정보 없음'}</p>
        <p><strong>임차인:</strong> {lessee || '정보 없음'}</p>
        <p><strong>임차인 연락처:</strong> {lesseePhone || '정보 없음'}</p>
        <p><strong>입주일:</strong> {moveInDate || '정보 없음'}</p>
        <p><strong>계약기간:</strong> {contractPeriod || '정보 없음'}</p>
        <p><strong>메모:</strong> {unitData.memo || '정보 없음'}</p>
      </div>
      <div style={{ marginTop: 16 }}>
  <button onClick={onClose} style={{ marginRight: 8 }}>닫기</button>
  <button
    style={{ marginRight: 8 }}
    onClick={() => onEdit(unitData)}
  >
    수정하기
  </button>
  <button
    style={{ color: 'white', background: 'red' }}
    onClick={() => {
      if (window.confirm('정말 삭제하시겠습니까?')) {
        onDelete(id || _id);
      }
    }}
  >
    삭제하기
  </button>
      </div>
    </Modal>
  );
};

export default UnitModal;
