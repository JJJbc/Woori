import React, { useRef, useState, useCallback } from 'react';
import KakaoMap from '../components/Map/KakaoMap';
import MarkerInfo from '../components/Map/MarkerInfo';
import SearchBar from '../components/Search/SearchBar';
import AutoComplete from '../components/Search/AutoComplete';
import AddressDisplay from '../components/Address/AddressDisplay';

const INITIAL_CENTER = { lat: 37.45344955498, lng: 126.90018635707 }; // 시흥대로59길 9

const MapPage = () => {
  const mapRef = useRef(null);
  const [mapObj, setMapObj] = useState(null);
  const [centerAddr, setCenterAddr] = useState('');
  const [clickedAddress, setClickedAddress] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchError, setSearchError] = useState('');
  const [autoList, setAutoList] = useState([]);
  const [autoActive, setAutoActive] = useState(false);
  const [markerPos, setMarkerPos] = useState(INITIAL_CENTER);
  const [markerContent, setMarkerContent] =
    useState('서울 금천구 시흥대로59길 9');

  // 지도 로드 후 최초 1회만 mapObj 설정
  const handleMapLoad = useCallback((map) => {
    setMapObj((prev) => prev || map); // 이미 있으면 다시 할당하지 않음

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

    // 지도 클릭 시 마커 이동 및 주소 표시
    window.kakao.maps.event.addListener(map, 'click', function (mouseEvent) {
      const latlng = mouseEvent.latLng;
      setMarkerPos({ lat: latlng.getLat(), lng: latlng.getLng() });

      // 주소 변환(Geocoder)
      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.coord2Address(
        latlng.getLng(),
        latlng.getLat(),
        function (result, status) {
          if (status === window.kakao.maps.services.Status.OK) {
            const road = result[0].road_address
              ? `도로명주소: ${result[0].road_address.address_name}`
              : '';
            const jibun = result[0].address
              ? `지번주소: ${result[0].address.address_name}`
              : '';
            const addr = [road, jibun].filter(Boolean).join('<br/>');
            setClickedAddress([road, jibun].filter(Boolean).join(' / '));
            setMarkerContent(addr);
          } else {
            setClickedAddress('주소를 찾을 수 없습니다.');
            setMarkerContent('주소를 찾을 수 없습니다.');
          }
        }
      );
    });
  }, []);

  // 검색 실행 함수
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
        setMarkerPos(coords);
        mapObj.setCenter(new window.kakao.maps.LatLng(coords.lat, coords.lng));
        const addr = `${place.place_name}<br/>${
          place.road_address_name || place.address_name
        }`;
        setClickedAddress(
          `${place.place_name} / ${
            place.road_address_name || place.address_name
          }`
        );
        setMarkerContent(addr);
      } else {
        setSearchError('검색 결과가 없습니다.');
      }
    });
  };

  // 자동완성 추천 검색어
  React.useEffect(() => {
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
    setMarkerPos(coords);
    mapObj.setCenter(new window.kakao.maps.LatLng(coords.lat, coords.lng));
    const addr = `${place.place_name}<br/>${
      place.road_address_name || place.address_name
    }`;
    setClickedAddress(
      `${place.place_name} / ${place.road_address_name || place.address_name}`
    );
    setMarkerContent(addr);
  };

  // "금천구로 이동" 버튼 클릭 시
  const handleGotoGeumcheon = () => {
    setSearchError('');
    if (!window.kakao || !window.kakao.maps) return;
    if (!mapObj) return;
    const lat = 37.45344955498;
    const lng = 126.90018635707;
    setMarkerPos({ lat, lng });
    mapObj.setCenter(new window.kakao.maps.LatLng(lat, lng));
    setClickedAddress('서울 금천구 시흥대로59길 9');
    setMarkerContent('서울 금천구 시흥대로59길 9');
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
        {mapObj && (
          <MarkerInfo
            map={mapObj}
            lat={markerPos.lat}
            lng={markerPos.lng}
            content={`<div style="padding:8px 12px;">${markerContent}</div>`}
          />
        )}
        <AddressDisplay
          centerAddr={centerAddr}
          clickedAddress={clickedAddress}
        />
      </div>
    </div>
  );
};

export default MapPage;
