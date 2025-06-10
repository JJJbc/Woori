import React, { useRef, useState, useEffect, useCallback } from 'react';
import KakaoMap from '../components/Map/KakaoMap';
import CustomOverlayWrapper from '../components/Map/CustomOverlayWrapper';
import CustomOverlayInfo from '../components/Map/CustomOverlayInfo';
import UnitModal from '../components/Map/UnitModal';
import AddUnitModal from '../components/Map/AddUnitModal';
import EditUnitModal from '../components/Map/EditUnitModal';
import SearchBar from '../components/Search/SearchBar';
import AutoComplete from '../components/Search/AutoComplete';
import AddressDisplay from '../components/Address/AddressDisplay';

const INITIAL_CENTER = { lat: 37.45344955498, lng: 126.90018635707 };

const MapPage = () => {
  const mapRef = useRef(null);
  const [mapObj, setMapObj] = useState(null);

  // 지도/마커/오버레이/모달
  const [markers, setMarkers] = useState([]);
  const [openOverlayId, setOpenOverlayId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [unitData, setUnitData] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);

  // 유닛 추가 모달 관련 상태
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addTargetMarker, setAddTargetMarker] = useState(null);

  // 수정 모달 상태
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editUnitData, setEditUnitData] = useState(null);

  // 검색/자동완성/주소표시
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchError, setSearchError] = useState('');
  const [autoList, setAutoList] = useState([]);
  const [autoActive, setAutoActive] = useState(false);
  const [centerAddr, setCenterAddr] = useState('');
  const [clickedAddress, setClickedAddress] = useState('');

  // 매물 데이터 불러오기
  const fetchProperties = useCallback(async () => {
    const res = await fetch('/api/properties');
    const data = await res.json();
    const markerMap = {};
    data.forEach((p) => {
      const key = `${p.address}_${p.lat}_${p.lng}`;
      if (!markerMap[key]) {
        markerMap[key] = {
          id: key,
          lat: p.lat,
          lng: p.lng,
          address: p.address,
          units: [],
        };
      }
      markerMap[key].units.push(p);
    });
    setMarkers(Object.values(markerMap));
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // 지도 로드 및 중심 주소 표시
  const handleMapLoad = useCallback((map) => {
    setMapObj((prev) => prev || map);

    const updateCenterAddr = () => {
      const geocoder = new window.kakao.maps.services.Geocoder();
      const center = map.getCenter();
      geocoder.coord2RegionCode(
        center.getLng(),
        center.getLat(),
        function (result, status) {
          if (status === window.kakao.maps.services.Status.OK) {
            for (let i = 0; i < result.length; i++) {
              if (result[i].region_type === 'H') {
                setCenterAddr(result[i].address_name);
                break;
              }
            }
          }
        }
      );
    };
    updateCenterAddr();
    window.kakao.maps.event.addListener(map, 'idle', updateCenterAddr);
  }, []);

  // 마커 클릭 시 오버레이 열기
  const handleMarkerClick = (id) => {
    setOpenOverlayId(id);
  };

  // 오버레이 닫기
  const handleOverlayClose = () => {
    setOpenOverlayId(null);
  };

  // 유닛 클릭(상세 모달 오픈)
  const handleUnitClick = (unitId) => {
    let found = null;
    for (const marker of markers) {
      found = marker.units.find((u) => u._id === unitId || u.id === unitId);
      if (found) break;
    }
    if (found) {
      setUnitData(found);
      setSelectedUnit(unitId);
      setModalOpen(true);
    }
  };

  // 모달 닫기
  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedUnit(null);
    setUnitData(null);
  };

  // 수정 버튼 클릭 시
  const handleEditUnit = (unit) => {
    setModalOpen(false);       // 상세 모달 닫기
  setSelectedUnit(null);
  setUnitData(null);
  setTimeout(() => {
    setEditUnitData(unit);   // 수정 모달 열기
    setEditModalOpen(true);
  }, 0); // 비동기 처리로 자연스럽게 전환
  };

  // 수정 완료 시 (PUT 요청)
  const handleUpdateUnit = async (updatedUnit) => {
    await fetch(`/api/properties/${updatedUnit.id || updatedUnit._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedUnit),
    });
    setEditModalOpen(false);
    setEditUnitData(null);
    setModalOpen(false);
    setSelectedUnit(null);
    setUnitData(null);
    fetchProperties();
  };

  // "추가하기" 버튼 클릭 시
  const handleAddClick = (marker) => {
    setAddTargetMarker(marker);
    setAddModalOpen(true);
  };

  // 유닛 추가 완료 시 (POST 요청)
  const handleAddUnit = async (newUnit) => {
    await fetch('/api/properties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUnit),
    });
    setAddModalOpen(false);
    setAddTargetMarker(null);
    fetchProperties();
  };

  // 유닛 삭제 핸들러
  const handleDeleteUnit = async (id) => {
    await fetch(`/api/properties/${id}`, { method: 'DELETE' });
    setModalOpen(false);
    setSelectedUnit(null);
    setUnitData(null);
    fetchProperties();
  };

  // 검색 기능
  const handleSearch = (e) => {
    e.preventDefault();
    setSearchError('');
    setAutoActive(false);
    if (!searchKeyword.trim()) {
      setSearchError('검색어를 입력하세요.');
      return;
    }
    if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
      setSearchError('카카오맵 로딩 중입니다. 잠시 후 다시 시도하세요.');
      return;
    }
    if (!mapObj) {
      setSearchError('지도가 아직 준비되지 않았습니다.');
      return;
    }
    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(searchKeyword, function (data, status) {
      if (status === window.kakao.maps.services.Status.OK && data.length > 0) {
        const place = data[0];
        const coords = { lat: parseFloat(place.y), lng: parseFloat(place.x) };
        mapObj.setCenter(new window.kakao.maps.LatLng(coords.lat, coords.lng));
        setClickedAddress(
          `${place.place_name} / ${
            place.road_address_name || place.address_name
          }`
        );
      } else {
        setSearchError('검색 결과가 없습니다.');
      }
    });
  };

  // 자동완성 기능
  useEffect(() => {
    if (
      !searchKeyword.trim() ||
      !window.kakao ||
      !window.kakao.maps ||
      !window.kakao.maps.services
    ) {
      setAutoList([]);
      return;
    }
    if (searchKeyword.trim().length < 2) {
      setAutoList([]);
      return;
    }
    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(searchKeyword, function (data, status) {
      if (status === window.kakao.maps.services.Status.OK) {
        setAutoList(data.slice(0, 7));
      } else {
        setAutoList([]);
      }
    });
  }, [searchKeyword]);

  // 자동완성 항목 클릭
  const handleAutoItemClick = (place) => {
    setSearchKeyword(place.place_name);
    setAutoActive(false);
    setSearchError('');
    if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services)
      return;
    if (!mapObj) return;
    const coords = { lat: parseFloat(place.y), lng: parseFloat(place.x) };
    mapObj.setCenter(new window.kakao.maps.LatLng(coords.lat, coords.lng));
    setClickedAddress(
      `${place.place_name} / ${place.road_address_name || place.address_name}`
    );
  };

  // 금천구로 이동
  const handleGotoGeumcheon = () => {
    setSearchError('');
    if (!window.kakao || !window.kakao.maps) return;
    if (!mapObj) return;
    const lat = 37.45344955498;
    const lng = 126.90018635707;
    mapObj.setCenter(new window.kakao.maps.LatLng(lat, lng));
    setClickedAddress('서울 금천구 시흥대로59길 9');
  };

  return (
    <div>
      <SearchBar
        value={searchKeyword}
        onChange={(e) => {
          setSearchKeyword(e.target.value);
          setAutoActive(true);
        }}
        onSubmit={handleSearch}
        onGotoGeumcheon={handleGotoGeumcheon}
        searchError={searchError}
      >
        <AutoComplete
          autoList={autoList}
          onClick={handleAutoItemClick}
          visible={autoActive}
        />
      </SearchBar>
      <div style={{ position: 'relative' }}>
        <KakaoMap ref={mapRef} center={INITIAL_CENTER} onMapLoad={handleMapLoad} />
        <AddressDisplay
          centerAddr={centerAddr}
          clickedAddress={clickedAddress}
        />
        {mapObj &&
          markers.map((m) => (
            <React.Fragment key={m.id}>
              {/* 마커 표시 */}
              <Marker
                map={mapObj}
                lat={m.lat}
                lng={m.lng}
                onClick={() => handleMarkerClick(m.id)}
              />
              {/* 커스텀 오버레이 표시 */}
              <CustomOverlayWrapper
                map={mapObj}
                position={{ lat: m.lat, lng: m.lng }}
                open={openOverlayId === m.id}
                onClose={handleOverlayClose}
              >
                <CustomOverlayInfo
                  address={m.address}
                  units={m.units}
                  onUnitClick={handleUnitClick}
                  onClose={handleOverlayClose}
                  onAddClick={() => handleAddClick(m)}
                />
              </CustomOverlayWrapper>
            </React.Fragment>
          ))}
        <UnitModal
          open={modalOpen}
          unitNo={selectedUnit}
          unitData={unitData}
          onClose={handleModalClose}
          onDelete={handleDeleteUnit}
          onEdit={handleEditUnit}
        />
        <AddUnitModal
          open={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          onSubmit={handleAddUnit}
          address={addTargetMarker?.address}
          lat={addTargetMarker?.lat}
          lng={addTargetMarker?.lng}
        />
        <EditUnitModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          unitData={editUnitData}
          onSubmit={handleUpdateUnit}
        />
      </div>
    </div>
  );
};

export default MapPage;

// 마커 컴포넌트
const Marker = ({ map, lat, lng, onClick }) => {
  useEffect(() => {
    if (!map) return;
    const marker = new window.kakao.maps.Marker({
      position: new window.kakao.maps.LatLng(lat, lng),
      map: map,
    });
    marker.addListener('click', onClick);
    return () => {
      marker.setMap(null);
    };
  }, [map, lat, lng, onClick]);
  return null;
};
