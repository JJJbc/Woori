import React, { useRef, useState, useEffect, useCallback } from 'react';
import MapContainer from '../components/Map/MapContainer';
import SearchBar from '../components/Search/SearchBar';
import AutoComplete from '../components/Search/AutoComplete';
import AddressDisplay from '../components/Address/AddressDisplay';
import UnitModal from '../components/Map/UnitModal';

const INITIAL_CENTER = { lat: 37.45344955498, lng: 126.90018635707 };

const MapPage = () => {
  const mapRef = useRef(null);
  const [mapObj, setMapObj] = useState(null);
  const [centerAddr, setCenterAddr] = useState('');
  const [clickedAddress, setClickedAddress] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchError, setSearchError] = useState('');
  const [autoList, setAutoList] = useState([]);
  const [autoActive, setAutoActive] = useState(false);

  const [markers, setMarkers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [unitData, setUnitData] = useState(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
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
              open: false,
            };
          }
          markerMap[key].units.push(p);
        });
        setMarkers(Object.values(markerMap));
        console.log('markers 세팅:', Object.values(markerMap));
      } catch (error) {
        setSearchError('매물 데이터 불러오기 실패');
        console.error(error);
      }
    };
    fetchProperties();
  }, []);

  const handleUnitClick = useCallback((unitId) => {
    console.log('handleUnitClick 호출', unitId);
    let found = null;
    for (const marker of markers) {
      found = marker.units.find((u) => u._id === unitId || u.id === unitId);
      if (found) break;
    }
    console.log('handleUnitClick found', found);
    if (found) {
      setUnitData(found);
      setSelectedUnit(unitId);
      setModalOpen(true);
    } else {
      setModalOpen(false);
      setUnitData(null);
      setSelectedUnit(null);
    }
  }, [markers]);

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    setSelectedUnit(null);
    setUnitData(null);
  }, []);

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

  const handleMarkerClick = useCallback((id) => {
    setMarkers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, open: true } : m))
    );
  }, []);

  const handleInfoClose = useCallback((id) => {
    setMarkers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, open: false } : m))
    );
  }, []);

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
  };

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
        <MapContainer
          mapRef={mapRef}
          center={INITIAL_CENTER}
          onMapLoad={handleMapLoad}
          markers={markers}
          onMarkerClick={handleMarkerClick}
          onInfoClose={handleInfoClose}
          onUnitClick={handleUnitClick}
        />
        <AddressDisplay
          centerAddr={centerAddr}
          clickedAddress={clickedAddress}
        />
        <UnitModal
          open={modalOpen}
          unitNo={selectedUnit}
          unitData={unitData}
          onClose={handleModalClose}
        />
      </div>
    </div>
  );
};

export default MapPage;
