import { Loader } from "@googlemaps/js-api-loader";
import { useEffect, useMemo, useRef, useState } from "react";

// import { checkLocation } from "@/api/test";
import { GOOGLE_KEY } from "@/constant/googlekey";
// import useGlobalCommunityId from "@/hooks/useGlobalCommunityId";
import { cn } from "@/lib/utils";
import {
  checkBigPolygon,
  createNewPolygon,
  getPolygonListCenter,
} from "@/utils/googleMap";
import ErrorIcon from "~/icons/ErrorIcon.svg";
import RightIcon from "~/icons/RightIcon.svg";

import { AttendanceLocationAOS } from "../types";
import ControlInner from "./googleMap/ControlInner";
import MapControl from "./googleMap/MapControls";
import MapMaker from "./googleMap/MapMarker";
import PromptBox from "./googleMap/PromptBox";
import { PolygonListItem } from "./timeAndAttendace";

interface GoogleMapProps {
  apiKey?: string;
  disabled?: boolean;
  locationLat: number;
  locationLng: number;
  polygonList?: PolygonListItem[];
  setPolygonInfo: (polygonList: AttendanceLocationAOS[]) => void;
}

export interface PolygonRefItem {
  checkInPolygon: google.maps.Polygon | null;
  lastCheckInPolygon: google.maps.Polygon | null;
  hasConfirmCheckIn: boolean;
  checkOutPolygon: google.maps.Polygon | null;
  lastCheckOutPolygon: google.maps.Polygon | null;
  hasConfirmCheckOut: boolean;
}

export default function GoogleMap(props: GoogleMapProps) {
  const {
    apiKey,
    disabled,
    polygonList,
    locationLat,
    locationLng,
    setPolygonInfo,
  } = props;

  const INIT_POLYGON_INFO: PolygonRefItem = {
    checkInPolygon: null,
    lastCheckInPolygon: null,
    hasConfirmCheckIn: true,
    checkOutPolygon: null,
    lastCheckOutPolygon: null,
    hasConfirmCheckOut: true,
  };

  const defaultLat = useMemo(() => {
    if (polygonList) {
      let res = getPolygonListCenter(polygonList);
      if (res) {
        return res.lat;
      }
    }

    return 38.8936304;
  }, [polygonList]);

  const defaultLng = useMemo(() => {
    if (polygonList) {
      let res = getPolygonListCenter(polygonList);
      if (res) {
        return res.lng;
      }
    }

    return -77.218398;
  }, [polygonList]);

  const [map, setMap] = useState<google.maps.Map | null>(null);

  const [polygonState, setPolygonState] =
    useState<PolygonRefItem>(INIT_POLYGON_INFO);
  const polygonRef = useRef<PolygonRefItem>(INIT_POLYGON_INFO);

  const drawingManagerRef = useRef<google.maps.drawing.DrawingManager | null>(
    null
  );

  const loader = new Loader({
    apiKey: apiKey || GOOGLE_KEY,
    version: "weekly",
    libraries: ["places"],
    language: "en",
    region: "",
  });

  useEffect(() => {
    initMap();
  }, [apiKey, polygonList]);

  useEffect(() => {
    initMap();
  }, []);

  //for update polygon info
  const setPolygonInfoFn = (
    polygonObj: PolygonRefItem,
    updateInfo: boolean
  ) => {
    setPolygonState(polygonObj);
    polygonRef.current = polygonObj;

    checkBigPolygon({
      checkInPolygon: polygonObj.checkInPolygon,
      checkOutPolygon: polygonObj.checkOutPolygon,
    });

    if (updateInfo) {
      const checkInPolygon = {
        type: "CHECK_IN" as "CHECK_IN",
        coordinates:
          polygonObj.checkInPolygon
            ?.getPath()
            .getArray()
            .map((item) => [item.lat(), item.lng()]) || [],
      };
      const checkOutPolygon = {
        type: "CHECK_OUT" as "CHECK_OUT",
        coordinates:
          polygonObj.checkOutPolygon
            ?.getPath()
            .getArray()
            .map((item) => [item.lat(), item.lng()]) || [],
      };
      setPolygonInfo([checkInPolygon, checkOutPolygon]);
    }
  };

  const [drawing, setDrawing] = useState(false);

  // const { communityId } = useGlobalCommunityId();

  const initMap = () => {
    loader.importLibrary("geometry").then(() => {
      loader
        .importLibrary("maps")
        .then(({ Map, Polygon }) => {
          const map = new Map(document.getElementById("map") as HTMLElement, {
            center: {
              lat: defaultLat,
              lng: defaultLng,
            },
            zoom: 18,
            mapId: apiKey || GOOGLE_KEY,
            disableDefaultUI: true,
            fullscreenControl: true,
            draggable: true,
            keyboardShortcuts: false,
            gestureHandling: "cooperative",
            mapTypeControl: true,
            mapTypeControlOptions: {
              position: google.maps.ControlPosition.TOP_RIGHT,
              style: google.maps.MapTypeControlStyle.DEFAULT,
            },
          });

          setMarker(map);

          setMap(map);

          setPolygonLoader(map, Polygon);
        })
        .catch((e: any) => {});
    });
  };

  //set marker
  const setMarker = (map: google.maps.Map) => {
    loader
      .importLibrary("marker")
      .then(({ AdvancedMarkerElement, PinElement }) => {
        new AdvancedMarkerElement({
          map: map,
          position: { lat: locationLat, lng: locationLng },
          content: new PinElement({
            background: "var(--primary-color)",
            glyphColor: "var(--primary-color)",
          }).element,
        });
      });
  };

  //set polygon loader
  const setPolygonLoader = (
    map: google.maps.Map,
    Polygon: typeof google.maps.Polygon
  ) => {
    loader.importLibrary("drawing").then(({ DrawingManager }) => {
      const drawingManager = new DrawingManager({
        drawingControl: false,
        drawingMode: null,
        drawingControlOptions: {
          drawingModes: [google.maps.drawing.OverlayType.POLYGON],
        },
      });
      drawingManager.setMap(map);

      drawingManagerRef.current = drawingManager;

      drawingManager.addListener(
        "overlaycomplete",
        ({ overlay }: { type: any; overlay: google.maps.Polygon }) => {
          const { isRight, startPoint } = checkPolygon(overlay);

          if (!isRight) {
            overlay.setMap(null);
            setBottomPrompt(true);
            setDrawing(false);
            setTimeout(() => {
              openDrawing();
            }, 50);
            return;
          } else {
            setBottomPrompt(false);
            if (drawCheckType.current === "CHECK_IN") {
              setCheckInMarkerPosition({
                lat: startPoint.lat(),
                lng: startPoint.lng(),
              });
            }
            if (drawCheckType.current === "CHECK_OUT") {
              setCheckOutMarkerPosition({
                lat: startPoint.lat(),
                lng: startPoint.lng(),
              });
            }
          }

          overlay.setEditable(true);
          overlay.set("suppressUndo", true);

          polygonEvent(
            overlay,
            drawCheckType.current === "CHECK_IN" ? "CHECK_IN" : "CHECK_OUT"
          );

          drawingManager.setDrawingMode(null);

          if (drawCheckType.current === "CHECK_IN") {
            overlay.setOptions({
              strokeColor: "#63E400",
              fillColor: "#69DD30",
              fillOpacity: 0.3,
              zIndex: 2,
            });

            const lastCheckInPolygon = polygonRef.current.checkInPolygon
              ? createNewPolygon(
                  polygonRef.current.checkInPolygon.getPath().getArray(),
                  "CHECK_IN"
                )
              : polygonRef.current.checkInPolygon;
            if (lastCheckInPolygon) {
              lastCheckInPolygon.set("suppressUndo", true);
            }

            console.log("drawing -> overlay1");

            setPolygonInfoFn(
              {
                ...polygonRef.current,
                checkInPolygon: overlay,
                lastCheckInPolygon: lastCheckInPolygon,
                hasConfirmCheckIn: false,
              },
              false
            );
          } else {
            overlay.setOptions({
              strokeColor: "#FF8A0C",
              fillColor: "#FFD48E",
              fillOpacity: 0.5,
              zIndex: 1,
            });

            const lastCheckOutPolygon = polygonRef.current.checkOutPolygon
              ? createNewPolygon(
                  polygonRef.current.checkOutPolygon.getPath().getArray(),
                  "CHECK_IN"
                )
              : polygonRef.current.checkOutPolygon;

            if (lastCheckOutPolygon) {
              lastCheckOutPolygon.set("suppressUndo", true);
            }
            console.log("drawing -> overlay2");

            setPolygonInfoFn(
              {
                ...polygonRef.current,
                checkOutPolygon: overlay,
                lastCheckOutPolygon: lastCheckOutPolygon,
                hasConfirmCheckOut: false,
              },
              false
            );
          }

          setTimeout(() => {
            closeDrawing();
          }, 50);
        }
      );

      //set default polygon start
      const defaultPolygonList = polygonList || [];

      const resPolygonRef: PolygonRefItem = INIT_POLYGON_INFO;

      defaultPolygonList.forEach((paths, i) => {
        let option: google.maps.PolygonOptions = {
          paths: paths.data,
          draggable: false,
          editable: true,
          zIndex: 1,
        };
        if (paths.type === "CHECK_IN") {
          option.zIndex = 2;
          option.strokeColor = "#FF0000";
        } else {
          option.zIndex = 1;
        }
        const polygon = createNewPolygon(paths.data, paths.type);

        polygon.setMap(map);

        polygon.set("suppressUndo", true);

        polygonEvent(polygon, paths.type);

        if (paths.type === "CHECK_IN") {
          polygonRef.current.checkInPolygon = polygon;
          closeDrawing();
          resPolygonRef.checkInPolygon = polygon;
        } else {
          polygonRef.current.checkOutPolygon = polygon;
          resPolygonRef.checkOutPolygon = polygon;
        }
      });

      console.log("initMap -> resPolygonRef");

      setPolygonInfoFn(resPolygonRef, true);
      //set default polygon end
    });
  };

  const drawCheckType = useRef<"CHECK_IN" | "CHECK_OUT" | null>(null);
  const [drawType, setDrawType] = useState<"CHECK_IN" | "CHECK_OUT" | null>(
    null
  );

  const changeCheckType = (type: "CHECK_IN" | "CHECK_OUT" | null) => {
    drawCheckType.current = type;
    if (type === "CHECK_IN") {
      if (polygonRef.current.checkInPolygon) {
        closeDrawing();
        const { startPoint } = checkPolygon(polygonRef.current.checkInPolygon);
        setCheckInMarkerPosition({
          lat: startPoint.lat(),
          lng: startPoint.lng(),
        });
      } else {
        openDrawing();
      }
    } else if (type === "CHECK_OUT") {
      if (polygonRef.current.checkOutPolygon) {
        closeDrawing();
        const { startPoint } = checkPolygon(polygonRef.current.checkOutPolygon);
        setCheckOutMarkerPosition({
          lat: startPoint.lat(),
          lng: startPoint.lng(),
        });
      } else {
        openDrawing();
      }
    } else {
      closeDrawing();
    }
  };

  // Check if the number of points in polygon is greater than 2 and return the starting point
  const checkPolygon = (polygon: google.maps.Polygon) => {
    const path = polygon.getPath().getArray();
    return {
      path,
      startPoint: path[0],
      isRight: path.length > 2,
      length: path.length,
    };
  };

  const isRightClick = useRef(false);

  //add event for polygon
  const polygonEvent = (
    overlay: google.maps.Polygon,
    type: "CHECK_IN" | "CHECK_OUT"
  ) => {
    overlay.addListener("mousedown", function (event: any) {
      if (event.vertex !== undefined || event.edge !== undefined) {
        isRightClick.current = true;

        if (type === "CHECK_IN" && polygonRef.current.hasConfirmCheckIn) {
          const lastCheckInPolygon = createNewPolygon(
            overlay.getPath().getArray(),
            "CHECK_IN"
          );

          lastCheckInPolygon.setEditable(true);

          lastCheckInPolygon.set("suppressUndo", true);

          console.log("mousedown -> lastCheckInPolygon1");

          setPolygonInfoFn(
            {
              ...polygonRef.current,
              lastCheckInPolygon: lastCheckInPolygon,
            },
            false
          );
        }
        if (type === "CHECK_OUT" && polygonRef.current.hasConfirmCheckOut) {
          const lastCheckOutPolygon = createNewPolygon(
            overlay.getPath().getArray(),
            "CHECK_OUT"
          );

          lastCheckOutPolygon.setEditable(true);

          lastCheckOutPolygon.set("suppressUndo", true);

          console.log("mousedown -> lastCheckInPolygon2");

          setPolygonInfoFn(
            {
              ...polygonRef.current,
              lastCheckOutPolygon: lastCheckOutPolygon,
            },
            false
          );
        }
      } else {
        isRightClick.current = false;
      }
    });

    overlay.addListener("mouseup", function (event: any) {
      if (isRightClick.current) {
        if (type === "CHECK_IN") {
          setCheckInMarkerPosition({
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
          });
          console.log("Mouse up -> CHECK_IN");

          setPolygonInfoFn(
            {
              ...polygonRef.current,
              hasConfirmCheckIn: false,
            },
            false
          );
        }

        if (type === "CHECK_OUT") {
          setCheckOutMarkerPosition({
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
          });
          console.log("Mouse up -> CHECK_IN");

          setPolygonInfoFn(
            {
              ...polygonRef.current,
              hasConfirmCheckOut: false,
            },
            false
          );
        }
      }
    });
  };

  //click map will has __gm_internal__noClick
  const drawingClick = (event: any) => {
    const drawingManagerMode = drawingManagerRef.current?.getDrawingMode();
    if (
      event.__gm_internal__noClick &&
      drawingManagerMode === google.maps.drawing.OverlayType.POLYGON
    ) {
      setDrawing(true);
      setPromptText(
        "Click to draw the next point, double-click to end drawing"
      );
    }
  };

  // open drawing
  const openDrawing = () => {
    drawingManagerRef.current?.setDrawingMode(
      google.maps.drawing.OverlayType.POLYGON
    );
    document.addEventListener("click", drawingClick);
    setIsShowPrompt(true);
    setPromptText("Click to confirm start point");
  };

  // close drawing
  const closeDrawing = () => {
    drawingManagerRef.current?.setDrawingMode(null);
    document.removeEventListener("click", drawingClick);
    setDrawing(false);
    setIsShowPrompt(false);
  };

  const confirmDrawing = (
    confirmType: boolean,
    type: "CHECK_IN" | "CHECK_OUT"
  ) => {
    if (type === "CHECK_IN") {
      if (!confirmType) {
        polygonRef.current?.checkInPolygon?.setMap(null);
        if (polygonRef.current.lastCheckInPolygon) {
          polygonRef.current.lastCheckInPolygon.setMap(map);
          polygonEvent(polygonRef.current.lastCheckInPolygon, "CHECK_IN");
        } else {
          openDrawing();
        }
      }

      const nowPolygon = confirmType
        ? polygonRef.current.checkInPolygon
        : polygonRef.current.lastCheckInPolygon;

      console.log("confirmDrawing -> nowPolygon");

      setPolygonInfoFn(
        {
          ...polygonRef.current,
          lastCheckInPolygon: null,
          hasConfirmCheckIn: true,
          checkInPolygon: nowPolygon,
        },
        true
      );
    } else {
      if (!confirmType) {
        polygonRef.current?.checkOutPolygon?.setMap(null);
        if (polygonRef.current.lastCheckOutPolygon) {
          polygonEvent(polygonRef.current.lastCheckOutPolygon, "CHECK_OUT");
          polygonRef.current.lastCheckOutPolygon.setMap(map);
          closeDrawing();
        } else {
          openDrawing();
        }
      }

      const nowPolygon = confirmType
        ? polygonRef.current.checkOutPolygon
        : polygonRef.current.lastCheckOutPolygon;

      console.log("confirmDrawing -> nowPolygon");
      setPolygonInfoFn(
        {
          ...polygonRef.current,
          lastCheckOutPolygon: null,
          hasConfirmCheckOut: true,
          checkOutPolygon: nowPolygon,
        },
        true
      );
    }
  };

  const deletePolygon = (type: "CHECK_IN" | "CHECK_OUT") => {
    if (type === "CHECK_IN") {
      if (polygonRef.current.checkInPolygon) {
        openDrawing();
        polygonRef.current.checkInPolygon.setMap(null);
        console.log("delete -> nowPolygon");
        setPolygonInfoFn(
          {
            ...polygonRef.current,
            checkInPolygon: null,
            lastCheckInPolygon: null,
            hasConfirmCheckIn: true,
          },
          true
        );
      }
    } else {
      if (polygonRef.current.checkOutPolygon) {
        openDrawing();
        polygonRef.current.checkOutPolygon.setMap(null);
        console.log("delete -> nowPolygon");

        setPolygonInfoFn(
          {
            ...polygonRef.current,
            checkOutPolygon: null,
            lastCheckOutPolygon: null,
            hasConfirmCheckOut: true,
          },
          true
        );
      }
    }
  };

  useEffect(() => {
    return () => {
      closeDrawing();
    };
  }, []);

  const contentRef = useRef<HTMLDivElement | null>(null);

  const [mouseInfo, setMouseInfo] = useState<{
    top: number;
    left: number;
  }>({
    top: 0,
    left: 0,
  });

  const [promptText, setPromptText] = useState<string>(
    "Click to confirm start point"
  );

  const [isShowPrompt, setIsShowPrompt] = useState<boolean>(false);

  const [bottomPrompt, setBottomPrompt] = useState<boolean>(false);

  const contentHoverEvent = (e: MouseEvent) => {
    const { clientX, clientY } = e;

    const contentInfo = (
      contentRef.current as HTMLDivElement
    ).getBoundingClientRect();

    const x = clientX - contentInfo.left;
    const y = clientY - contentInfo.top;

    setMouseInfo({
      top: y + 10,
      left: x + 10,
    });
  };

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.addEventListener("mousemove", contentHoverEvent);
    }
    return () => {
      if (contentRef.current) {
        contentRef.current.removeEventListener("mousemove", contentHoverEvent);
      }
    };
  }, [contentRef]);

  const [checkOutMarkerPosition, setCheckOutMarkerPosition] = useState<{
    lat: number;
    lng: number;
  }>({
    lat: 0,
    lng: 0,
  });

  const [checkInMarkerPosition, setCheckInMarkerPosition] = useState<{
    lat: number;
    lng: number;
  }>({
    lat: 0,
    lng: 0,
  });

  return (
    <div ref={contentRef} className="relative h-full w-full">
      <div id="map" key={"googleMap"} className="h-full" />
      {map && (
        <>
          {!disabled && (
            <MapControl
              map={map}
              position={google.maps.ControlPosition.TOP_LEFT}
            >
              <ControlInner
                drawing={drawing}
                polygonRefItem={polygonState}
                typeChange={changeCheckType}
                deletePolygon={deletePolygon}
                type={drawType}
                setType={setDrawType}
              ></ControlInner>
            </MapControl>
          )}

          <MapControl
            map={map}
            position={google.maps.ControlPosition.BOTTOM_CENTER}
          >
            <PromptBox
              open={bottomPrompt}
              isAutoClose={true}
              isShowCloseIcon={true}
              className="relative translate-x-[-50%] flex items-center gap-2 min-h-6 px-2 border-[2px] border-[#FFA39E] bg-[#FFF1F0] text-[#F5222D] text-[12px] leading-5 text-wrap"
              content={"The area must be greater than 0 square meters!"}
              onClose={() => {
                setBottomPrompt(false);
              }}
            ></PromptBox>
          </MapControl>
          {!polygonState.hasConfirmCheckIn && (
            <>
              <MapMaker
                map={map}
                loader={loader}
                position={checkInMarkerPosition}
              >
                <div className="relative translate-x-[50%] flex items-center gap-3 h-9 mb-3">
                  <div
                    className={cn(
                      "flex items-center justify-center w-10 h-full",
                      "border-r-[1px] border-r-[#E7EDF1] bg-[#fff]",
                      "cursor-pointer"
                    )}
                    onClick={() => {
                      confirmDrawing(true, "CHECK_IN");
                    }}
                  >
                    <RightIcon></RightIcon>
                  </div>
                  <div
                    className={cn(
                      "flex items-center justify-center w-10 h-full",
                      "border-r-[1px] border-r-[#E7EDF1] bg-[#fff]",
                      "cursor-pointer"
                    )}
                    onClick={() => {
                      confirmDrawing(false, "CHECK_IN");
                    }}
                  >
                    <ErrorIcon
                      width="16"
                      height="16"
                      color="#F5894E"
                    ></ErrorIcon>
                  </div>
                </div>
              </MapMaker>
            </>
          )}
          {!polygonState.hasConfirmCheckOut && (
            <>
              <MapMaker
                map={map}
                loader={loader}
                position={checkOutMarkerPosition}
              >
                <div className="relative translate-x-[50%] flex items-center gap-3 h-9 mb-3">
                  <div
                    className={cn(
                      "flex items-center justify-center w-10 h-full",
                      "border-r-[1px] border-r-[#E7EDF1] bg-[#fff]",
                      "cursor-pointer"
                    )}
                    onClick={() => {
                      confirmDrawing(true, "CHECK_OUT");
                    }}
                  >
                    <RightIcon></RightIcon>
                  </div>
                  <div
                    className={cn(
                      "flex items-center justify-center w-10 h-full",
                      "border-r-[1px] border-r-[#E7EDF1] bg-[#fff]",
                      "cursor-pointer"
                    )}
                    onClick={() => {
                      confirmDrawing(false, "CHECK_OUT");
                    }}
                  >
                    <ErrorIcon
                      width="16"
                      height="16"
                      color="#F5894E"
                    ></ErrorIcon>
                  </div>
                </div>
              </MapMaker>
            </>
          )}
        </>
      )}
      <PromptBox
        open={isShowPrompt}
        className="absolute min-h-6 px-2 border-[2px] border-[#D3ADF7] bg-[#F9F0FF] text-[#722ED1] text-[12px] leading-5 text-wrap"
        style={{
          top: mouseInfo.top,
          left: mouseInfo.left,
        }}
        content={promptText}
      ></PromptBox>
    </div>
  );
}
