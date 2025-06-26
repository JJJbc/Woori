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

const INITIAL_CENTER = { lat: 37.45344955498, lng: 126.90018635707 };

const MapPage = () => {
  const mapRef = useRef(null);
  const [mapObj, setMapObj] = useState(null);

  const [markers, setMarkers] = useState([]);
  const [openOverlayId, setOpenOverlayId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [unitData, setUnitData] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addTargetMarker, setAddTargetMarker] = useState(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editUnitData, setEditUnitData] = useState(null);

  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchError, setSearchError] = useState('');
  const [autoList, setAutoList] = useState([]);
  const [autoActive, setAutoActive] = useState(false);
  const [centerAddr, setCenterAddr] = useState('');
  const [clickedAddress, setClickedAddress] = useState('');

  const [tempOverlay, setTempOverlay] = useState(null);

  // ★ 검색 결과 위치 상태 추가
  const [searchResult, setSearchResult] = useState(null);

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

  const handleMarkerClick = (id) => {
    setOpenOverlayId(id);
  };

  const handleOverlayClose = () => {
    setOpenOverlayId(null);
  };

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

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedUnit(null);
    setUnitData(null);
  };

  const handleEditUnit = (unit) => {
    setModalOpen(false);
    setSelectedUnit(null);
    setUnitData(null);
    setTimeout(() => {
      setEditUnitData(unit);
      setEditModalOpen(true);
    }, 0);
  };

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

  const handleAddClick = (marker) => {
    setAddTargetMarker(marker);
    setAddModalOpen(true);
  };

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

  const handleDeleteUnit = async (id) => {
    await fetch(`/api/properties/${id}`, { method: 'DELETE' });
    setModalOpen(false);
    setSelectedUnit(null);
    setUnitData(null);
    fetchProperties();
  };

  useEffect(() => {
    if (!mapObj) return;

    const handleMapClick = (mouseEvent) => {
      const lat = mouseEvent.latLng.getLat();
      const lng = mouseEvent.latLng.getLng();

      const isMarkerHere = markers.some(
        (m) =>
          Math.abs(Number(m.lat) - lat) < 0.00001 &&
          Math.abs(Number(m.lng) - lng) < 0.00001
      );
      if (isMarkerHere) return;

      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.coord2Address(lng, lat, function (result, status) {
        if (status === window.kakao.maps.services.Status.OK) {
          const address = result[0]?.address?.address_name || '';
          setTempOverlay({ address, lat, lng });
        }
      });
    };

    window.kakao.maps.event.addListener(mapObj, 'click', handleMapClick);

    return () => {
      window.kakao.maps.event.removeListener(mapObj, 'click', handleMapClick);
    };
  }, [mapObj, markers]);

  // ★ 검색 함수 수정: 검색 결과에 임시 마커/오버레이 표시
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
          `${place.place_name} / ${place.road_address_name || place.address_name}`
        );
        setSearchResult({
          lat: coords.lat,
          lng: coords.lng,
          label: place.place_name || searchKeyword,
          address: place.road_address_name || place.address_name,
        });
      } else {
        // 키워드 검색 결과 없으면 주소 변환 시도
        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.addressSearch(searchKeyword, function (result, status) {
          if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
            const addr = result[0];
            const coords = { lat: parseFloat(addr.y), lng: parseFloat(addr.x) };
            mapObj.setCenter(new window.kakao.maps.LatLng(coords.lat, coords.lng));
            setClickedAddress(addr.address_name || searchKeyword);
            setSearchResult({
              lat: coords.lat,
              lng: coords.lng,
              label: addr.address_name || searchKeyword,
              address: addr.address_name,
            });
          } else {
            setSearchError('검색 결과가 없습니다.');
            setSearchResult(null);
          }
        });
      }
    });
  };

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
    setSearchResult({
      lat: coords.lat,
      lng: coords.lng,
      label: place.place_name,
      address: place.road_address_name || place.address_name,
    });
  };

  const handleGotoGeumcheon = () => {
    setSearchError('');
    if (!window.kakao || !window.kakao.maps) return;
    if (!mapObj) return;
    const lat = 37.45344955498;
    const lng = 126.90018635707;
    mapObj.setCenter(new window.kakao.maps.LatLng(lat, lng));
    setClickedAddress('서울 금천구 시흥대로59길 9');
    setSearchResult(null);
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

        {/* 기존 마커/오버레이 */}
        {mapObj &&
          markers.map((m) => (
            <React.Fragment key={m.id}>
              <Marker
                map={mapObj}
                lat={m.lat}
                lng={m.lng}
                onClick={() => handleMarkerClick(m.id)}
              />
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

        {/* 지도 빈 곳 클릭 시 임시 오버레이 */}
        {mapObj && tempOverlay && (
          <CustomOverlayWrapper
            map={mapObj}
            position={{ lat: tempOverlay.lat, lng: tempOverlay.lng }}
            open={!!tempOverlay}
            onClose={() => setTempOverlay(null)}
          >
            <CustomOverlayInfo
              address={tempOverlay.address}
              units={[]}
              onUnitClick={() => {}}
              onClose={() => setTempOverlay(null)}
              onAddClick={() => {
                setAddTargetMarker(tempOverlay);
                setAddModalOpen(true);
                setTempOverlay(null);
              }}
            />
          </CustomOverlayWrapper>
        )}

        {/* ★ 검색 결과 위치에 임시 마커/오버레이 표시 */}
        {mapObj && searchResult && (
          <React.Fragment>
            <Marker
              map={mapObj}
              lat={searchResult.lat}
              lng={searchResult.lng}
              onClick={() => {}}
            />
            <CustomOverlayWrapper
              map={mapObj}
              position={{ lat: searchResult.lat, lng: searchResult.lng }}
              open={true}
              onClose={() => setSearchResult(null)}
            >
              <div
                style={{
                  background: '#fff',
                  border: '1px solid #888',
                  borderRadius: 8,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  padding: 12,
                  position: 'relative',
                  minWidth: 180,
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                  {searchResult.label}
                </div>
                <div style={{ fontSize: 13, color: '#666' }}>
                  {searchResult.address}
                </div>
                <button
                  onClick={() => setSearchResult(null)}
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
            </CustomOverlayWrapper>
          </React.Fragment>
        )}

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
