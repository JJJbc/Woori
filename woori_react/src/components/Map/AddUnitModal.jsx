import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const AddUnitModal = ({ open, onClose, onSubmit, address, lat, lng }) => {
  const [detail, setDetail] = useState('');
  const [rooms, setRooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [area, setArea] = useState('');
  const [dealType, setDealType] = useState('');
  const [price, setPrice] = useState('');
  const [lessor, setLessor] = useState('');
  const [lessorPhone, setLessorPhone] = useState('');
  const [lessee, setLessee] = useState('');
  const [lesseePhone, setLesseePhone] = useState('');
  const [moveInDate, setMoveInDate] = useState('');
  const [contractPeriod, setContractPeriod] = useState('');
  const [memo, setMemo] = useState('');

  
  useEffect(() => {
    if (open) {
      setDetail('');
      setRooms('');
      setBathrooms('');
      setArea('');
      setDealType('');
      setPrice('');
      setLessor('');
      setLessorPhone('');
      setLessee('');
      setLesseePhone('');
      setMoveInDate('');
      setContractPeriod('');
      setMemo('');
    }
  }, [open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      address,
      detail,
      rooms: Number(rooms),
      bathrooms: Number(bathrooms),
      area: Number(area),
      dealType,
      price: Number(price),
      lessor,
      lessorPhone,
      lessee,
      lesseePhone,
      moveInDate,
      contractPeriod,
      lat,
      lng,
      memo,
    });
    
  };

  return (
    <Modal
      isOpen={open}
      onRequestClose={onClose}
      style={{
        overlay: { background: 'rgba(0,0,0,0.3)', zIndex: 1000 },
        content: {
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          transform: 'translate(-50%, -50%)',
          minWidth: '340px',
          borderRadius: '8px',
          padding: '24px',
        },
      }}
      contentLabel="유닛 추가"
    >
      <h2>추가하기</h2>
      <div style={{ marginBottom: 12, color: '#333' }}>
        <b>주소:</b> {address}
      </div>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 8 }}>
          <label>상세명: </label>
          <input value={detail} onChange={e => setDetail(e.target.value)} required />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>방 개수: </label>
          <input type="number" value={rooms} onChange={e => setRooms(e.target.value)} required />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>욕실 개수: </label>
          <input type="number" value={bathrooms} onChange={e => setBathrooms(e.target.value)} required />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>면적(㎡): </label>
          <input type="number" value={area} onChange={e => setArea(e.target.value)} required />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>거래유형: </label>
          <input value={dealType} onChange={e => setDealType(e.target.value)} required />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>가격: </label>
          <input value={price} onChange={e => setPrice(e.target.value)} required />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>임대인: </label>
          <input value={lessor} onChange={e => setLessor(e.target.value)} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>임대인 연락처: </label>
          <input value={lessorPhone} onChange={e => setLessorPhone(e.target.value)} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>임차인: </label>
          <input value={lessee} onChange={e => setLessee(e.target.value)} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>임차인 연락처: </label>
          <input value={lesseePhone} onChange={e => setLesseePhone(e.target.value)} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>입주일: </label>
          <input value={moveInDate} onChange={e => setMoveInDate(e.target.value)} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>계약 기간: </label>
          <input value={contractPeriod} onChange={e => setContractPeriod(e.target.value)} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>메모: </label>
          <textarea value={memo} onChange={e => setMemo(e.target.value)} />
        </div>
        <div style={{ marginTop: 16 }}>
          <button type="submit" style={{ marginRight: 8 }}>추가</button>
          <button type="button" onClick={onClose}>취소</button>
        </div>
        
      </form>
    </Modal>
  );
};

export default AddUnitModal;
