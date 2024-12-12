import { Loader } from "@googlemaps/js-api-loader";
import { usePathname } from "next/navigation";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";

import { GOOGLE_KEY } from "@/constant/googlekey";
interface GoogleMapProps {
  apiKey?: string;
  address: string;
  locationLat: number;
  locationLng: number;
  setLocationLng: (locationLng: number) => void;
  setLocationLat: (locationLat: number) => void;
  checkAddress: (address: AddressInfoType, isShowConfirm: boolean) => void;
}

type AddressInfoType = {
  physicalAddress: string;
  physicalCity: string;
  physicalState: string;
  physicalZip: string;
  info: string;
  lat: number;
  lng: number;
};

export interface MapRef {
  getAddressByLatLng: (lat: number, lng: number) => void;
}
// US
const defaultLocation = { lat: 38, lng: -94 };
const GoogleMap = forwardRef<any, GoogleMapProps>(
  (props: GoogleMapProps, ref: any) => {
    const [hasMap, setHasMap] = useState<Boolean>(false);
    const [mapInfo, setMapInfo] = useState<google.maps.Map>();
    const [draggableMarker, setDraggableMarker] = useState<any>();
    const pathname = usePathname();
    const {
      apiKey,
      address,
      locationLat,
      locationLng,
      setLocationLng,
      setLocationLat,
      checkAddress,
    } = props;

    const loader = new Loader({
      apiKey: apiKey || GOOGLE_KEY,
      version: "weekly",
      libraries: ["places"],
      language: "en",
      region: "",
    });

    useEffect(() => {
      initMap();
    }, [address]);

    const [mapInstance, setMapInstance] = useState<google.maps.Map>();

    useEffect(() => {}, [address, mapInstance, locationLat, locationLng]);

    function handleLocateFailed(map: google.maps.Map) {
      map.setCenter(defaultLocation);
    }

    function initMap() {
      if (hasMap == false) {
        loader
          .importLibrary("maps")
          .then(({ Map }) => {
            const markerLocationLat =
              locationLat === 0 || !locationLat
                ? defaultLocation.lat
                : locationLat;
            const markerLocationLng =
              locationLng === 0 || !locationLng
                ? defaultLocation.lng
                : locationLng;

            const map = new Map(document.getElementById("map") as HTMLElement, {
              center: { lat: markerLocationLat, lng: markerLocationLng },
              zoom: 15,
              mapId: apiKey || GOOGLE_KEY,
              disableDefaultUI: true,
              fullscreenControl: true,
              draggable: true,
              keyboardShortcuts: false,
              gestureHandling: "cooperative",
            }) as google.maps.Map;

            setMapInstance(map);
            // Locate the user's current location
            if (pathname === "/community/create") {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  function (position) {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    if (!lat && !lng) {
                      handleLocateFailed(map);
                    } else {
                      const pos = {
                        lat,
                        lng,
                      };
                      getAddressByLatLng(lat, lng, true);
                      map.setCenter(pos);
                    }
                  },
                  function () {
                    handleLocateFailed(map);
                  }
                );
              } else {
                // Browser doesn't support Geolocation
                handleLocateFailed(map);
              }
            }

            setMapInfo(map);

            loader
              .importLibrary("marker")
              .then(({ AdvancedMarkerElement, PinElement }) => {
                if (markerLocationLat && markerLocationLng) {
                } else {
                  if (
                    address == null ||
                    address == "" ||
                    address == "undefined"
                  ) {
                    return;
                  }

                  const geocoder = new google.maps.Geocoder();
                  geocoder.geocode(
                    { address: address },
                    function (results, status) {
                      if (status == google.maps.GeocoderStatus.OK) {
                        const location: any =
                          results && results[0].geometry.location;
                        setLocationLng(location.lng());
                        setLocationLat(location.lat());
                        if (location) {
                          getAddressByLatLng(
                            location.lat(),
                            location.lng(),
                            false
                          );
                        }
                      } else {
                        setLocationLat(0);
                        setLocationLng(0);
                      }
                    }
                  );
                }

                const marker = new AdvancedMarkerElement({
                  map: map,
                  position: { lat: markerLocationLat, lng: markerLocationLng },
                  content: new PinElement({
                    background: "var(--primary-color)",
                    glyphColor: "var(--primary-color)",
                  }).element,
                  gmpDraggable: true,
                });
                map.setCenter({
                  lat: markerLocationLat,
                  lng: markerLocationLng,
                });

                marker.addListener("dragend", (event: Event) => {
                  const position = marker.position;
                  if (position && position?.lng && position?.lat) {
                    getAddressByLatLng(
                      Number(`${position.lat}`),
                      Number(`${position.lng}`),
                      true
                    );
                    // setLocationLng(Number(`${position.lng}`));
                    // setLocationLat(Number(`${position.lat}`));

                    map.setCenter(position);
                  }
                });

                setDraggableMarker(marker);

                // set map
                setTimeout(() => {
                  getLatlong();
                  setHasMap(true);
                }, 100);
              });
          })
          .catch((e: any) => {});
      } else {
        getLatlong();
      }
    }

    async function drawMarker(lat: number, lng: number) {
      if (lat && lng && hasMap && draggableMarker) {
        draggableMarker.position = { lat: lat, lng: lng };
        setDraggableMarker(draggableMarker);
      }
    }

    function getLatlong() {
      if (address == null || address == "" || address == "undefined") {
        return;
      }

      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: address }, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          const location: any = results && results[0].geometry.location;
          // setLocationLng(location.lng());
          // setLocationLat(location.lat());
          // if (location) {
          //   getAddressByLatLng(location.lat(), location.lng(), false);
          // }

          drawMarker(location.lat(), location.lng());
          setTimeout(() => {
            mapInfo
              ? mapInfo.setCenter({ lat: location.lat(), lng: location.lng() })
              : null;
          }, 500);
        } else {
          // setLocationLat(0);
          // setLocationLng(0);
        }
      });
    }

    // load address postion by lng&lat
    function getAddressByLatLng(
      lat: number,
      lng: number,
      isShowConfirm: boolean
    ) {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode(
        { location: { lat: lat, lng: lng } },
        (results, status) => {
          if (status == google.maps.GeocoderStatus.OK) {
            if (
              results &&
              results.length > 0 &&
              results[0].address_components &&
              results[0].address_components.length > 0
            ) {
              let adreessInfo: AddressInfoType = {
                physicalAddress: "",
                physicalCity: "",
                physicalState: "",
                physicalZip: "",
                info: "",
                lat: 0,
                lng: 0,
              };
              adreessInfo.lat = lat;
              adreessInfo.lng = lng;
              adreessInfo.info = results[0].formatted_address;
              results[0].address_components.map((item) => {
                // street-address
                if (item.types.includes("street_number")) {
                  adreessInfo.physicalAddress += item.long_name + " ";
                }
                if (item.types.includes("route")) {
                  adreessInfo.physicalAddress += item.long_name + " ";
                }

                // city
                if (item.types.includes("locality")) {
                  adreessInfo.physicalCity += item.long_name + " ";
                }
                // if (item.types.includes("administrative_area_level_2")) {
                //   adreessInfo.physicalCity += item.long_name + " ";
                // }
                // state
                if (item.types.includes("administrative_area_level_1")) {
                  adreessInfo.physicalState = item.long_name;
                }
                // zip code
                if (item.types.includes("postal_code")) {
                  adreessInfo.physicalZip = item.long_name;
                }
              });
              checkAddress(adreessInfo, isShowConfirm);
            }
          }
        }
      );
    }

    useImperativeHandle(
      ref,
      () => ({
        getAddressByLatLng: getAddressByLatLng,
      }),
      []
    );

    return <div id="map" className="h-full" />;
  }
);

GoogleMap.displayName = "GoogleMap_old";

export default GoogleMap;
