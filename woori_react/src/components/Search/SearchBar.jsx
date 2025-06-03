import React from 'react';

const SearchBar = ({
  value,
  onChange,
  onSubmit,
  onGotoGeumcheon,
  searchError,
  children,
}) => (
  <form
    onSubmit={onSubmit}
    style={{
      marginBottom: '12px',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
    }}
    autoComplete="off"
  >
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder="주소 또는 건물명을 입력하세요"
      style={{
        width: '260px',
        padding: '6px',
        borderRadius: '4px',
        border: '1px solid #ccc',
      }}
    />
    <button type="submit" style={{ marginLeft: '8px', padding: '6px 16px' }}>
      검색
    </button>
    <button
      type="button"
      onClick={onGotoGeumcheon}
      style={{
        marginLeft: '8px',
        padding: '6px 16px',
        background: '#2d8cf0',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
      }}
    >
      금천구로 이동
    </button>
    {searchError && (
      <span style={{ color: 'red', marginLeft: '16px' }}>{searchError}</span>
    )}
    {children}
  </form>
);

export default SearchBar;
