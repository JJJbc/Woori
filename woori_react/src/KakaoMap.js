import React, { useEffect, useRef, useState } from "react";

const mapStyle = `
.map_wrap {position:relative;width:100%;height:800px;}
.title {font-weight:bold;display:block;}
.hAddr {position:absolute;left:10px;top:10px;border-radius:2px;background:#fff;background:rgba(255,255,255,0.8);z-index:1;padding:5px;}
#centerAddr {display:block;margin-top:2px;font-weight:normal;}
.bAddr {padding:5px;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;}
`;

const KAKAO_SDK_URL =
  "//dapi.kakao.com/v2/maps/sdk.js?appkey=295d5751352cf8f70a803a503e9c93a0&autoload=false&libraries=services";

const KakaoMap = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  const [centerAddr, setCenterAddr] = useState(""); // 지도 중심 주소
  const [clickedAddr, setClickedAddr] = useState(""); // 클릭 위치 주소
  const [clickedLatLng, setClickedLatLng] = useState(""); // 클릭 위치 좌표

  // 클릭 마커와 인포윈도우를 재사용(중복 생성 방지)
  const clickMarkerRef = useRef(null);
  const clickInfoWindowRef = useRef(null);

  useEffect(() => {
    // 1. 스크립트가 이미 있으면 window.kakao가 준비될 때까지 polling
    if (window.kakao && window.kakao.maps) {
      loadMap();
      return;
    }

    // 2. 스크립트가 없으면 추가
    if (!document.getElementById("kakao-map-sdk")) {
      const script = document.createElement("script");
      script.id = "kakao-map-sdk";
      script.src = KAKAO_SDK_URL;
      script.async = true;
      script.onload = checkAndLoadMap;
      document.head.appendChild(script);
    } else {
      // 이미 스크립트가 있는데 window.kakao가 없으면 polling
      checkAndLoadMap();
    }

    // 클린업
    return () => {
      if (clickMarkerRef.current) clickMarkerRef.current.setMap(null);
      if (clickInfoWindowRef.current) clickInfoWindowRef.current.close();
    };
    // eslint-disable-next-line
  }, []);

  // window.kakao.maps가 준비될 때까지 polling
  const checkAndLoadMap = () => {
    if (window.kakao && window.kakao.maps && window.kakao.maps.load) {
      loadMap();
    } else {
      setTimeout(checkAndLoadMap, 100);
    }
  };

  // 카카오맵 로드 및 이벤트 등록
  const loadMap = () => {
    window.kakao.maps.load(() => {
      const container = mapRef.current;
      if (!container) return; // 혹시나 null일 때 방지

      const options = {
        center: new window.kakao.maps.LatLng(37.566826, 126.9786567),
        level: 3,
      };
      const map = new window.kakao.maps.Map(container, options);
      mapInstance.current = map;

      // 지도 중심 주소 최초 표시
      updateCenterAddr(map);

      // 지도 중심/레벨 변경시 중심 주소 갱신
      window.kakao.maps.event.addListener(map, "idle", function () {
        updateCenterAddr(map);
      });

      // 지도 클릭 시 마커+주소 인포윈도우 표시
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

          // 마커/인포윈도우 재사용
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

          // 클릭 주소 React state에도 저장(원하면 화면에 표시)
          setClickedAddr(
            (!!result[0].road_address
              ? `도로명주소: ${result[0].road_address.address_name} `
              : "") + `지번주소: ${result[0].address.address_name}`
          );
        }
      }
    );
  };

  return (
    <div>
      <style>{mapStyle}</style>
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
