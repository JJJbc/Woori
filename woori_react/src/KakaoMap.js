import React, { useEffect, useRef, useState } from "react";

const overlayStyle = `
.wrap {position: absolute;left: 0;bottom: 40px;width: 288px;height: 132px;margin-left: -144px;text-align: left;overflow: hidden;font-size: 12px;font-family: 'Malgun Gothic', dotum, '돋움', sans-serif;line-height: 1.5;}
.wrap * {padding: 0;margin: 0;}
.wrap .info {width: 286px;height: 120px;border-radius: 5px;border-bottom: 2px solid #ccc;border-right: 1px solid #ccc;overflow: hidden;background: #fff;}
.wrap .info:nth-child(1) {border: 0;box-shadow: 0px 1px 2px #888;}
.info .title {padding: 5px 0 0 10px;height: 30px;background: #eee;border-bottom: 1px solid #ddd;font-size: 18px;font-weight: bold;}
.info .close {position: absolute;top: 10px;right: 10px;color: #888;width: 17px;height: 17px;background: url('https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/overlay_close.png');}
.info .close:hover {cursor: pointer;}
.info .body {position: relative;overflow: hidden;}
.info .desc {position: relative;margin: 13px 0 0 90px;height: 75px;}
.desc .ellipsis {overflow: hidden;text-overflow: ellipsis;white-space: nowrap;}
.desc .jibun {font-size: 11px;color: #888;margin-top: -2px;}
.info .img {position: absolute;top: 6px;left: 5px;width: 73px;height: 71px;border: 1px solid #ddd;color: #888;overflow: hidden;}
.info:after {content: '';position: absolute;margin-left: -12px;left: 50%;bottom: 0;width: 22px;height: 12px;background: url('https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/vertex_white.png')}
.info .link {color: #5085BB;}
`;

const getCustomOverlayContent = (onClose) => {
  // DOM element로 생성 (닫기 버튼 이벤트를 위해)
  const div = document.createElement("div");
  div.className = "wrap";
  div.innerHTML = `
    <div class="info">
      <div class="title">
        카카오 스페이스닷원
        <div class="close" title="닫기"></div>
      </div>
      <div class="body">
        <div class="img">
          <img src="https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/thumnail.png" width="73" height="70" alt=""/>
        </div>
        <div class="desc">
          <div class="ellipsis">제주특별자치도 제주시 첨단로 242</div>
          <div class="jibun ellipsis">(우) 63309 (지번) 영평동 2181</div>
          <div><a href="https://www.kakaocorp.com/main" target="_blank" class="link">홈페이지</a></div>
        </div>
      </div>
    </div>
  `;
  div.querySelector(".close").onclick = onClose;
  return div;
};

const KakaoMap = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [mapLevel, setMapLevel] = useState(3);
  const [mapInfo, setMapInfo] = useState("");
  const [clickedLatLng, setClickedLatLng] = useState("");
  const markersRef = useRef([]); // [{ marker, overlay }]

  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "//dapi.kakao.com/v2/maps/sdk.js?appkey=295d5751352cf8f70a803a503e9c93a0&autoload=false";
    script.async = true;

    script.onload = () => {
      window.kakao.maps.load(() => {
        const container = mapRef.current;
        const options = {
          center: new window.kakao.maps.LatLng(33.450701, 126.570667),
          level: 3,
        };
        const map = new window.kakao.maps.Map(container, options);
        mapInstance.current = map;

        // 지도 타입 컨트롤
        const mapTypeControl = new window.kakao.maps.MapTypeControl();
        map.addControl(mapTypeControl, window.kakao.maps.ControlPosition.TOPRIGHT);

        // 줌 컨트롤
        const zoomControl = new window.kakao.maps.ZoomControl();
        map.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);

        // 마커 배열 초기화
        markersRef.current = [];

        // 최초 마커 1개 추가
        addMarker(new window.kakao.maps.LatLng(33.450701, 126.570667), map);

        // 지도 클릭 시 마커 추가
        window.kakao.maps.event.addListener(map, "click", function (mouseEvent) {
          addMarker(mouseEvent.latLng, map);
          setClickedLatLng(
            `클릭한 위치의 위도는 ${mouseEvent.latLng.getLat()} 이고, 경도는 ${mouseEvent.latLng.getLng()} 입니다`
          );
        });

        // 지도 레벨 변경 이벤트 등록
        window.kakao.maps.event.addListener(map, "zoom_changed", () => {
          setMapLevel(map.getLevel());
        });

        setMapLevel(map.getLevel());
      });
    };

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
      markersRef.current = [];
    };
    // eslint-disable-next-line
  }, []);

  // 마커 추가 함수 (마커 클릭 시 커스텀 오버레이)
  const addMarker = (position, map) => {
    const marker = new window.kakao.maps.Marker({
      position: position,
    });
    marker.setMap(map);

    // 커스텀 오버레이 생성 (닫기 버튼 이벤트 등록)
    let overlay = null;
    const content = getCustomOverlayContent(() => {
      overlay.setMap(null);
    });
    overlay = new window.kakao.maps.CustomOverlay({
      content,
      position: position,
      yAnchor: 1.4, // 말풍선 화살표 위치 조정
    });

    // 마커 클릭 시 오버레이 표시 (중복 방지: 모든 오버레이 닫기)
    window.kakao.maps.event.addListener(marker, "click", function () {
      markersRef.current.forEach(({ overlay: o }) => o.setMap(null));
      overlay.setMap(map);
    });

    markersRef.current.push({ marker, overlay });
  };

  // 모든 마커 지도에 표시
  const showMarkers = () => {
    if (!mapInstance.current) return;
    markersRef.current.forEach(({ marker }) => marker.setMap(mapInstance.current));
  };

  // 모든 마커 지도에서 감추기 + 오버레이 닫기
  const hideMarkers = () => {
    markersRef.current.forEach(({ marker, overlay }) => {
      marker.setMap(null);
      overlay.setMap(null);
    });
  };

  // 지도 중심좌표 이동 (setCenter)
  const setCenter = () => {
    if (!mapInstance.current) return;
    const moveLatLon = new window.kakao.maps.LatLng(33.452613, 126.570888);
    mapInstance.current.setCenter(moveLatLon);
  };

  // 지도 중심좌표 부드럽게 이동 (panTo)
  const panTo = () => {
    if (!mapInstance.current) return;
    const moveLatLon = new window.kakao.maps.LatLng(33.450580, 126.574942);
    mapInstance.current.panTo(moveLatLon);
  };

  // 지도 레벨 -1 (확대)
  const zoomIn = () => {
    if (!mapInstance.current) return;
    const level = mapInstance.current.getLevel();
    mapInstance.current.setLevel(level - 1);
    setMapLevel(level - 1);
  };

  // 지도 레벨 +1 (축소)
  const zoomOut = () => {
    if (!mapInstance.current) return;
    const level = mapInstance.current.getLevel();
    mapInstance.current.setLevel(level + 1);
    setMapLevel(level + 1);
  };

  // 지도 정보 얻어오기
  const getInfo = () => {
    if (!mapInstance.current) return;
    const map = mapInstance.current;
    const center = map.getCenter();
    const level = map.getLevel();
    const mapTypeId = map.getMapTypeId();
    const bounds = map.getBounds();
    const swLatLng = bounds.getSouthWest();
    const neLatLng = bounds.getNorthEast();

    let message = `지도 중심좌표는 위도 ${center.getLat()}, <br>`;
    message += `경도 ${center.getLng()} 이고 <br>`;
    message += `지도 레벨은 ${level} 입니다 <br><br>`;
    message += `지도 타입은 ${mapTypeId} 이고 <br>`;
    message += `지도의 남서쪽 좌표는 ${swLatLng.getLat()}, ${swLatLng.getLng()} 이고 <br>`;
    message += `북동쪽 좌표는 ${neLatLng.getLat()}, ${neLatLng.getLng()} 입니다`;

    setMapInfo(message);
  };

  return (
    <div>
      <style>{overlayStyle}</style>
      <div
        ref={mapRef}
        style={{ width: "100%", height: "350px" }}
      ></div>
      <p>
        <button onClick={hideMarkers}>마커 감추기</button>
        <button onClick={showMarkers} style={{ marginLeft: "10px" }}>
          마커 보이기
        </button>
      </p>
      <em>
        클릭한 위치에 마커가 표시되고, <b>마커를 클릭하면 닫기버튼이 있는 커스텀 오버레이가 뜹니다!</b>
      </em>
      <div
        id="clickLatlng"
        style={{
          margin: "10px 0",
          background: "#f0f0f0",
          padding: "8px",
          borderRadius: "4px",
          minHeight: "24px",
        }}
      >
        {clickedLatLng}
      </div>
      <p>
        <button onClick={setCenter}>지도 중심좌표 이동시키기</button>
        <button onClick={panTo} style={{ marginLeft: "10px" }}>
          지도 중심좌표 부드럽게 이동시키기
        </button>
      </p>
      <p>
        <button onClick={zoomIn}>지도레벨 - 1</button>
        <button onClick={zoomOut} style={{ marginLeft: "10px" }}>
          지도레벨 + 1
        </button>
        <span style={{ marginLeft: "20px" }}>
          현재 지도 레벨은 {mapLevel} 레벨 입니다.
        </span>
      </p>
      <p>
        <button onClick={getInfo}>지도 정보 얻어오기</button>
      </p>
      <div
        style={{
          marginTop: "10px",
          background: "#f8f8f8",
          padding: "10px",
          borderRadius: "4px",
          minHeight: "50px",
        }}
        dangerouslySetInnerHTML={{ __html: mapInfo }}
      />
    </div>
  );
};

export default KakaoMap;
