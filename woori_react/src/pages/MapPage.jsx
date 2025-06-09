import React, { useRef, useState, useEffect, useCallback } from 'react';
import KakaoMap from '../components/Map/KakaoMap';
import MarkerInfo from '../components/Map/MarkerInfo';
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

  // DB에서 받아온 매물로 만든 마커 데이터
  const [markers, setMarkers] = useState([]);

  // 모달 상태
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [unitData, setUnitData] = useState(null);

  // 1. 매물 데이터 fetch (async/await)
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await fetch('/api/properties');
        const data = await res.json();
        console.log('매물 데이터:', data);

        // address/좌표별로 그룹핑
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
          markerMap[key].units.push({ _id: p._id, detail: p.detail });
        });
        setMarkers(Object.values(markerMap));
      } catch (error) {
        setSearchError('매물 데이터 불러오기 실패');
        console.error(error);
      }
    };
    fetchProperties();
  }, []);

  // 모달 열기
  const handleUnitClick = (unitId) => {
    setSelectedUnit(unitId);
    setModalOpen(true);
    setUnitData({
      tenant: '홍길동',
      area: '84㎡',
      etc: '입주일: 2024-01-01',
    });
  };

  // 모달 닫기
  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedUnit(null);
    setUnitData(null);
  };

  // 지도 로드 후 최초 1회만 mapObj 설정 및 이벤트 등록
  const handleMapLoad = useCallback((map) => {
    setMapObj((prev) => prev || map);

    // 중심 주소 갱신 함수
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

  // 마커 클릭 시 인포윈도우 열기
  const handleMarkerClick = (id) => {
    setMarkers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, open: true } : m))
    );
  };

  // 인포윈도우 X버튼 클릭 시 닫기
  const handleInfoClose = (id) => {
    setMarkers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, open: false } : m))
    );
  };

  // 검색 실행 함수 (옵션: 검색 결과로 마커 추가)
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
        const address = `${place.place_name}<br/>${
          place.road_address_name || place.address_name
        }`;
        setClickedAddress(
          `${place.place_name} / ${
            place.road_address_name || place.address_name
          }`
        );
        // 검색 결과로 마커 추가 (units는 detail로)
        setMarkers((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            lat: coords.lat,
            lng: coords.lng,
            address,
            units: [{ detail: '1502' }], // 예시, 실제 detail은 상황에 맞게
            open: true,
          },
        ]);
      } else {
        setSearchError('검색 결과가 없습니다.');
      }
    });
  };

  // 자동완성 추천 검색어
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

  // 자동완성 클릭 시
  const handleAutoItemClick = (place) => {
    setSearchKeyword(place.place_name);
    setAutoActive(false);
    setSearchError('');
    if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services)
      return;
    if (!mapObj) return;
    const coords = { lat: parseFloat(place.y), lng: parseFloat(place.x) };
    mapObj.setCenter(new window.kakao.maps.LatLng(coords.lat, coords.lng));
    const address = `${place.place_name}<br/>${
      place.road_address_name || place.address_name
    }`;
    setClickedAddress(
      `${place.place_name} / ${place.road_address_name || place.address_name}`
    );
    setMarkers((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        lat: coords.lat,
        lng: coords.lng,
        address,
        units: [{ detail: '1502' }], // 예시
        open: true,
      },
    ]);
  };

  // "금천구로 이동" 버튼 클릭 시
  const handleGotoGeumcheon = () => {
    setSearchError('');
    if (!window.kakao || !window.kakao.maps) return;
    if (!mapObj) return;
    const lat = 37.45344955498;
    const lng = 126.90018635707;
    mapObj.setCenter(new window.kakao.maps.LatLng(lat, lng));
    setClickedAddress('서울 금천구 시흥대로59길 9');
    setMarkers((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        lat,
        lng,
        address: '서울 금천구 시흥대로59길 9',
        units: [{ detail: '1502' }], // 예시
        open: true,
      },
    ]);
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
        <KakaoMap
          ref={mapRef}
          center={INITIAL_CENTER}
          onMapLoad={handleMapLoad}
        />
        {mapObj &&
          markers.map((m) => (
            <MarkerInfo
              key={m.id}
              id={m.id}
              map={mapObj}
              lat={m.lat}
              lng={m.lng}
              address={m.address}
              units={m.units}
              open={m.open}
              onMarkerClick={() => handleMarkerClick(m.id)}
              onInfoClose={() => handleInfoClose(m.id)}
              onUnitClick={handleUnitClick}
              color="red"
            />
          ))}
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
