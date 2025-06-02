import React, { useEffect, useRef, useState } from "react";

const mapStyle = `
.map_wrap {position:relative;width:100%;height:700px;}
.title {font-weight:bold;display:block;}
.hAddr {position:absolute;left:10px;top:10px;border-radius:2px;background:#fff;background:rgba(255,255,255,0.8);z-index:1;padding:5px;}
#centerAddr {display:block;margin-top:2px;font-weight:normal;}
.bAddr {padding:5px;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;}
.autocomplete-list {background:#fff;border:1px solid #ccc;border-radius:4px;max-height:220px;overflow-y:auto;position:absolute;z-index:10;width:260px;margin-top:2px;}
.autocomplete-item {padding:8px 12px;cursor:pointer;}
.autocomplete-item:hover {background:#f0f0f0;}
`;

const KAKAO_SDK_URL =
  "//dapi.kakao.com/v2/maps/sdk.js?appkey=295d5751352cf8f70a803a503e9c93a0&autoload=false&libraries=services,places";

const KakaoMap = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  const [centerAddr, setCenterAddr] = useState(""); // 지도 중심 주소
  const [clickedAddr, setClickedAddr] = useState(""); // 클릭 위치 주소
  const [clickedLatLng, setClickedLatLng] = useState(""); // 클릭 위치 좌표

  // 검색 관련 상태
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchError, setSearchError] = useState("");
  const [autoList, setAutoList] = useState([]); // 자동완성 리스트
  const [autoActive, setAutoActive] = useState(false);

  // 마커/인포윈도우 재사용
  const clickMarkerRef = useRef(null);
  const clickInfoWindowRef = useRef(null);
  const searchMarkerRef = useRef(null);
  const searchInfoWindowRef = useRef(null);

  useEffect(() => {
    if (window.kakao && window.kakao.maps) {
      loadMap();
      return;
    }

    if (!document.getElementById("kakao-map-sdk")) {
      const script = document.createElement("script");
      script.id = "kakao-map-sdk";
      script.src = KAKAO_SDK_URL;
      script.async = true;
      script.onload = checkAndLoadMap;
      document.head.appendChild(script);
    } else {
      checkAndLoadMap();
    }

    return () => {
      if (clickMarkerRef.current) clickMarkerRef.current.setMap(null);
      if (clickInfoWindowRef.current) clickInfoWindowRef.current.close();
      if (searchMarkerRef.current) searchMarkerRef.current.setMap(null);
      if (searchInfoWindowRef.current) searchInfoWindowRef.current.close();
    };
    // eslint-disable-next-line
  }, []);

  const checkAndLoadMap = () => {
    if (window.kakao && window.kakao.maps && window.kakao.maps.load) {
      loadMap();
    } else {
      setTimeout(checkAndLoadMap, 100);
    }
  };

  const loadMap = () => {
    window.kakao.maps.load(() => {
      const container = mapRef.current;
      if (!container) return;

      const options = {
        center: new window.kakao.maps.LatLng(37.566826, 126.9786567),
        level: 3,
      };
      const map = new window.kakao.maps.Map(container, options);
      mapInstance.current = map;

      updateCenterAddr(map);

      window.kakao.maps.event.addListener(map, "idle", function () {
        updateCenterAddr(map);
      });

      window.kakao.maps.event.addListener(map, "click", function (mouseEvent) {
        setClickedLatLng(
          `위도: ${mouseEvent.latLng.getLat()}, 경도: ${mouseEvent.latLng.getLng()}`
        );
        showClickedAddress(map, mouseEvent.latLng);
      });
    });
  };

  // 지도 중심좌표의 행정동 주소를 가져와서 표시
  const updateCenterAddr = (map) => {
    if (!window.kakao.maps.services) return;
    const geocoder = new window.kakao.maps.services.Geocoder();
    const center = map.getCenter();
    geocoder.coord2RegionCode(
      center.getLng(),
      center.getLat(),
      function (result, status) {
        if (status === window.kakao.maps.services.Status.OK) {
          for (let i = 0; i < result.length; i++) {
            if (result[i].region_type === "H") {
              setCenterAddr(result[i].address_name);
              break;
            }
          }
        }
      }
    );
  };

  // 클릭 위치의 상세 주소를 가져와서 마커+인포윈도우 표시
  const showClickedAddress = (map, latLng) => {
    if (!window.kakao.maps.services) return;
    const geocoder = new window.kakao.maps.services.Geocoder();
    geocoder.coord2Address(
      latLng.getLng(),
      latLng.getLat(),
      function (result, status) {
        if (status === window.kakao.maps.services.Status.OK) {
          let detailAddr = !!result[0].road_address
            ? `<div>도로명주소 : ${result[0].road_address.address_name}</div>`
            : "";
          detailAddr += `<div>지번 주소 : ${result[0].address.address_name}</div>`;
          const content = `<div class="bAddr"><span class="title">주소정보</span>${detailAddr}</div>`;

          if (!clickMarkerRef.current) {
            clickMarkerRef.current = new window.kakao.maps.Marker();
          }
          if (!clickInfoWindowRef.current) {
            clickInfoWindowRef.current = new window.kakao.maps.InfoWindow({ zindex: 1 });
          }
          clickMarkerRef.current.setPosition(latLng);
          clickMarkerRef.current.setMap(map);

          clickInfoWindowRef.current.setContent(content);
          clickInfoWindowRef.current.open(map, clickMarkerRef.current);

          setClickedAddr(
            (!!result[0].road_address
              ? `도로명주소: ${result[0].road_address.address_name} `
              : "") + `지번주소: ${result[0].address.address_name}`
          );
        }
      }
    );
  };

  // 주소/키워드로 장소 검색 (엔터/버튼)
  const handleSearch = (e) => {
    e.preventDefault();
    setSearchError("");
    setAutoActive(false);
    if (!searchKeyword.trim()) {
      setSearchError("검색어를 입력하세요.");
      return;
    }
    if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services || !window.kakao.maps.services.Places) {
      setSearchError("카카오맵 로딩 중입니다. 잠시 후 다시 시도하세요.");
      return;
    }

    const map = mapInstance.current;
    const ps = new window.kakao.maps.services.Places();

    if (searchMarkerRef.current) searchMarkerRef.current.setMap(null);
    if (searchInfoWindowRef.current) searchInfoWindowRef.current.close();

    ps.keywordSearch(searchKeyword, function (data, status) {
      if (status === window.kakao.maps.services.Status.OK && data.length > 0) {
        const place = data[0];
        const coords = new window.kakao.maps.LatLng(place.y, place.x);

        if (!searchMarkerRef.current) {
          searchMarkerRef.current = new window.kakao.maps.Marker();
        }
        searchMarkerRef.current.setPosition(coords);
        searchMarkerRef.current.setMap(map);

        if (!searchInfoWindowRef.current) {
          searchInfoWindowRef.current = new window.kakao.maps.InfoWindow({ zindex: 2 });
        }
        searchInfoWindowRef.current.setContent(
          `<div style="padding:8px 12px;"><b>${place.place_name}</b><br/>${place.road_address_name || place.address_name}</div>`
        );
        searchInfoWindowRef.current.open(map, searchMarkerRef.current);

        map.setCenter(coords);
      } else {
        setSearchError("검색 결과가 없습니다.");
      }
    });
  };

  // 자동완성: 입력할 때마다 연관 장소 리스트 검색
  useEffect(() => {
    if (
      !searchKeyword.trim() ||
      !window.kakao ||
      !window.kakao.maps ||
      !window.kakao.maps.services ||
      !window.kakao.maps.services.Places
    ) {
      setAutoList([]);
      return;
    }
    // 너무 짧은 검색어는 자동완성 안 함
    if (searchKeyword.trim().length < 2) {
      setAutoList([]);
      return;
    }

    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(searchKeyword, function (data, status) {
      if (status === window.kakao.maps.services.Status.OK) {
        setAutoList(data.slice(0, 7)); // 최대 7개만
      } else {
        setAutoList([]);
      }
    });
  }, [searchKeyword]);

  // 자동완성 아이템 클릭 시 지도 이동 + 마커 표시
  const handleAutoItemClick = (place) => {
    setSearchKeyword(place.place_name);
    setAutoActive(false);
    setSearchError("");
    if (!window.kakao || !window.kakao.maps) return;
    const map = mapInstance.current;
    const coords = new window.kakao.maps.LatLng(place.y, place.x);

    if (searchMarkerRef.current) searchMarkerRef.current.setMap(null);
    if (!searchMarkerRef.current) searchMarkerRef.current = new window.kakao.maps.Marker();
    searchMarkerRef.current.setPosition(coords);
    searchMarkerRef.current.setMap(map);

    if (!searchInfoWindowRef.current) {
      searchInfoWindowRef.current = new window.kakao.maps.InfoWindow({ zindex: 2 });
    }
    searchInfoWindowRef.current.setContent(
      `<div style="padding:8px 12px;"><b>${place.place_name}</b><br/>${place.road_address_name || place.address_name}</div>`
    );
    searchInfoWindowRef.current.open(map, searchMarkerRef.current);

    map.setCenter(coords);
  };

  return (
    <div>
      <style>{mapStyle}</style>
      <div style={{ position: "relative", marginBottom: "10px" }}>
        <form onSubmit={handleSearch} autoComplete="off">
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => {
              setSearchKeyword(e.target.value);
              setAutoActive(true);
            }}
            placeholder="주소 또는 건물명을 입력하세요"
            style={{ width: "260px", padding: "6px", borderRadius: "4px", border: "1px solid #ccc" }}
            onFocus={() => setAutoActive(true)}
            onBlur={() => setTimeout(() => setAutoActive(false), 200)} // blur 후에도 클릭 가능하게 약간 딜레이
          />
          <button type="submit" style={{ marginLeft: "8px", padding: "6px 16px" }}>
            검색
          </button>
          {searchError && (
            <span style={{ color: "red", marginLeft: "16px" }}>{searchError}</span>
          )}
        </form>
        {autoActive && autoList.length > 0 && (
          <div className="autocomplete-list">
            {autoList.map((place) => (
              <div
                key={place.id}
                className="autocomplete-item"
                onMouseDown={() => handleAutoItemClick(place)}
              >
                <b>{place.place_name}</b>
                <br />
                <span style={{ fontSize: "12px", color: "#888" }}>
                  {place.road_address_name || place.address_name}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="map_wrap">
        <div
          ref={mapRef}
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
            overflow: "hidden",
          }}
        />
        <div className="hAddr">
          <span className="title">지도 중심 행정동 주소</span>
          <span id="centerAddr">{centerAddr}</span>
        </div>
      </div>
      <div
        style={{
          margin: "12px 0",
          background: "#f0f0f0",
          padding: "8px",
          borderRadius: "4px",
          minHeight: "24px",
        }}
      >
        <b>클릭한 위치 좌표:</b> {clickedLatLng}
        <br />
        <b>클릭한 위치 주소:</b> {clickedAddr}
      </div>
    </div>
  );
};

export default KakaoMap;
