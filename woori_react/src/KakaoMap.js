import React, { useEffect, useRef, useState } from 'react';

const KAKAO_SDK_URL =
  'https://dapi.kakao.com/v2/maps/sdk.js?appkey=1b17628cd47f21a6b296c1f7b69422e2&autoload=false&libraries=services';

const KakaoMapWithGotoButton = () => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const infoWindowRef = useRef(null);
  const [centerAddr, setCenterAddr] = useState('');
  const [clickedAddress, setClickedAddress] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchError, setSearchError] = useState('');
  const [autoList, setAutoList] = useState([]);
  const [autoActive, setAutoActive] = useState(false);

  useEffect(() => {
    if (!window.kakao || !window.kakao.maps) {
      const script = document.createElement('script');
      script.src = KAKAO_SDK_URL;
      script.async = true;
      script.onload = () => {
        window.kakao.maps.load(drawMap);
      };
      document.head.appendChild(script);
    } else {
      window.kakao.maps.load(drawMap);
    }
    // eslint-disable-next-line
  }, []);

  const openInfoWindow = (marker, content) => {
    if (!infoWindowRef.current) {
      infoWindowRef.current = new window.kakao.maps.InfoWindow({ zIndex: 10 });
    }
    infoWindowRef.current.setContent(content);
    infoWindowRef.current.open(marker.getMap(), marker);
  };

  const drawMap = () => {
    const container = mapRef.current;
    if (!container) return;
    const options = {
      center: new window.kakao.maps.LatLng(37.45344955498, 126.90018635707),
      level: 3,
    };
    const map = new window.kakao.maps.Map(container, options);

    // 최초 마커
    const markerPosition = new window.kakao.maps.LatLng(
      37.45344955498,
      126.90018635707
    );
    const marker = new window.kakao.maps.Marker({
      position: markerPosition,
      map: map,
    });
    markerRef.current = marker;

    // 최초 인포윈도우
    const geocoder = new window.kakao.maps.services.Geocoder();
    geocoder.coord2Address(
      markerPosition.getLng(),
      markerPosition.getLat(),
      function (result, status) {
        if (status === window.kakao.maps.services.Status.OK) {
          const road = result[0].road_address
            ? `도로명주소: ${result[0].road_address.address_name}`
            : '';
          const jibun = result[0].address
            ? `지번주소: ${result[0].address.address_name}`
            : '';
          const addr = [road, jibun].filter(Boolean).join('<br/>');
          openInfoWindow(
            marker,
            `<div style="padding:8px 12px;">${addr}</div>`
          );
        }
      }
    );

    // 지도 중심 주소 갱신 함수
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

    // 최초 중심 주소 표시
    updateCenterAddr();

    // 지도 이동/확대/축소 시 중심 주소 갱신
    window.kakao.maps.event.addListener(map, 'idle', updateCenterAddr);

    // 지도 클릭 시 마커 이동 및 주소 표시
    window.kakao.maps.event.addListener(map, 'click', function (mouseEvent) {
      const latlng = mouseEvent.latLng;
      marker.setPosition(latlng);

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
            openInfoWindow(
              marker,
              `<div style="padding:8px 12px;">${addr}</div>`
            );
          } else {
            setClickedAddress('주소를 찾을 수 없습니다.');
            openInfoWindow(
              marker,
              `<div style="padding:8px 12px;">주소를 찾을 수 없습니다.</div>`
            );
          }
        }
      );
    });

    // 마커 클릭 시 인포윈도우 열기
    window.kakao.maps.event.addListener(marker, 'click', function () {
      if (clickedAddress) {
        openInfoWindow(
          marker,
          `<div style="padding:8px 12px;">${clickedAddress.replace(
            ' / ',
            '<br/>'
          )}</div>`
        );
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
    const map =
      mapRef.current && markerRef.current && markerRef.current.getMap();
    if (!map) {
      setSearchError('지도가 아직 준비되지 않았습니다.');
      return;
    }
    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(searchKeyword, function (data, status) {
      if (status === window.kakao.maps.services.Status.OK && data.length > 0) {
        const place = data[0];
        const coords = new window.kakao.maps.LatLng(place.y, place.x);
        markerRef.current.setPosition(coords);
        markerRef.current.setMap(map);
        map.setCenter(coords);
        const addr = `${place.place_name}<br/>${
          place.road_address_name || place.address_name
        }`;
        setClickedAddress(
          `${place.place_name} / ${
            place.road_address_name || place.address_name
          }`
        );
        openInfoWindow(
          markerRef.current,
          `<div style="padding:8px 12px;">${addr}</div>`
        );
      } else {
        setSearchError('검색 결과가 없습니다.');
      }
    });
  };

  // 자동완성 클릭 시
  const handleAutoItemClick = (place) => {
    setSearchKeyword(place.place_name);
    setAutoActive(false);
    setSearchError('');
    if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services)
      return;
    const map =
      mapRef.current && markerRef.current && markerRef.current.getMap();
    if (!map) return;
    const coords = new window.kakao.maps.LatLng(place.y, place.x);
    markerRef.current.setPosition(coords);
    markerRef.current.setMap(map);
    map.setCenter(coords);
    const addr = `${place.place_name}<br/>${
      place.road_address_name || place.address_name
    }`;
    setClickedAddress(
      `${place.place_name} / ${place.road_address_name || place.address_name}`
    );
    openInfoWindow(
      markerRef.current,
      `<div style="padding:8px 12px;">${addr}</div>`
    );
  };

  // "금천구로 이동" 버튼 클릭 시
  const handleGotoGeumcheon = () => {
    if (!window.kakao || !window.kakao.maps) return;
    const map =
      mapRef.current && markerRef.current && markerRef.current.getMap();
    if (!map) return;

    // 위도, 경도 직접 지정
    const lat = 37.45344955498;
    const lng = 126.90018635707;
    const coords = new window.kakao.maps.LatLng(lat, lng);

    markerRef.current.setPosition(coords);
    markerRef.current.setMap(map);
    map.setCenter(coords);

    // 인포윈도우 및 주소 표시도 필요하다면 추가
    setClickedAddress('서울 금천구 시흥대로59길 9');
    openInfoWindow(
      markerRef.current,
      `<div style="padding:8px 12px;">서울 금천구 시흥대로59길 9</div>`
    );
  };

  return (
    <div>
      <form
        onSubmit={handleSearch}
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
          value={searchKeyword}
          onChange={(e) => {
            setSearchKeyword(e.target.value);
            setAutoActive(true);
          }}
          placeholder="주소 또는 건물명을 입력하세요"
          style={{
            width: '260px',
            padding: '6px',
            borderRadius: '4px',
            border: '1px solid #ccc',
          }}
          onFocus={() => setAutoActive(true)}
          onBlur={() => setTimeout(() => setAutoActive(false), 200)}
        />
        <button
          type="submit"
          style={{ marginLeft: '8px', padding: '6px 16px' }}
        >
          검색
        </button>
        <button
          type="button"
          onClick={handleGotoGeumcheon}
          style={{
            marginLeft: '8px',
            padding: '6px 16px',
            background: '#2d8cf0',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
          }}
        >
          사무실로 이동
        </button>
        {searchError && (
          <span style={{ color: 'red', marginLeft: '16px' }}>
            {searchError}
          </span>
        )}
        {autoActive && autoList.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '38px',
              left: 0,
              width: '260px',
              background: '#fff',
              border: '1px solid #ccc',
              borderRadius: '4px',
              zIndex: 10,
              maxHeight: '220px',
              overflowY: 'auto',
            }}
          >
            {autoList.map((place) => (
              <div
                key={place.id}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #eee',
                }}
                onMouseDown={() => handleAutoItemClick(place)}
              >
                <b>{place.place_name}</b>
                <br />
                <span style={{ fontSize: '12px', color: '#888' }}>
                  {place.road_address_name || place.address_name}
                </span>
              </div>
            ))}
          </div>
        )}
      </form>
      <div style={{ position: 'relative' }}>
        <div
          ref={mapRef}
          style={{
            width: '100%',
            height: '800px',
            border: '2px solid #333',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 10,
            top: 10,
            background: 'rgba(255,255,255,0.8)',
            borderRadius: '2px',
            padding: '5px',
            zIndex: 2,
          }}
        >
          <span style={{ fontWeight: 'bold' }}>지도 중심 행정동 주소: </span>
          <span>{centerAddr}</span>
        </div>
      </div>
      <div
        style={{
          marginTop: '12px',
          background: '#f0f0f0',
          padding: '8px',
          borderRadius: '4px',
        }}
      >
        <b>클릭/검색 위치 주소:</b> {clickedAddress}
      </div>
    </div>
  );
};

export default KakaoMapWithGotoButton;
