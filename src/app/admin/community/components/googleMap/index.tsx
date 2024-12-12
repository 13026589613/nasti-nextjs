import { Loader } from "@googlemaps/js-api-loader";
import { usePathname } from "next/navigation";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import { GOOGLE_KEY } from "@/constant/googlekey";
interface GoogleMapProps {
  address: AddressInfoType | undefined;
  disabled: boolean;
  markerDragEnd: (lat: number, lng: number) => void;
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
    const { address, disabled, markerDragEnd } = props;

    const pathname = usePathname();

    const loader = new Loader({
      apiKey: GOOGLE_KEY,
      version: "weekly",
      libraries: ["places"],
      language: "en",
      region: "",
    });

    const map = useRef<google.maps.Map | null>(null);
    const [marker, setMarker] =
      useState<google.maps.marker.AdvancedMarkerElement | null>(null);

    const initMap = () => {
      const markerLocationLat = address ? address.lat : defaultLocation.lat;
      const markerLocationLng = address ? address.lng : defaultLocation.lng;

      loader.importLibrary("maps").then(({ Map }) => {
        const newMap = new Map(document.getElementById("map") as HTMLElement, {
          center: { lat: markerLocationLat, lng: markerLocationLng },
          zoom: 17,
          mapId: GOOGLE_KEY,
          disableDefaultUI: true,
          fullscreenControl: true,
          draggable: !disabled,
          keyboardShortcuts: false,
          gestureHandling: "cooperative",
        });

        map.current = newMap;

        // Locate the user's current location
        if (pathname === "/community/create") {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              function (position) {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                if (!lat && !lng) {
                  geolocationFailed(newMap);
                  loaderMarker({
                    map: newMap,
                    markerLocationLat,
                    markerLocationLng,
                  });
                } else {
                  const pos = {
                    lat,
                    lng,
                  };
                  newMap.setCenter(pos);
                  loaderMarker({
                    map: newMap,
                    markerLocationLat: lat,
                    markerLocationLng: lng,
                  });
                }
              },
              function () {
                geolocationFailed(newMap);
                loaderMarker({
                  map: newMap,
                  markerLocationLat,
                  markerLocationLng,
                });
              }
            );
          } else {
            // Browser doesn't support Geolocation
            geolocationFailed(newMap);
            loaderMarker({
              map: newMap,
              markerLocationLat,
              markerLocationLng,
            });
          }
        } else {
          loaderMarker({
            map: newMap,
            markerLocationLat,
            markerLocationLng,
          });
        }
      });
    };

    const geolocationFailed = (map: google.maps.Map) => {
      map.setCenter(defaultLocation);
    };

    const loaderMarker = ({
      map,
      markerLocationLat,
      markerLocationLng,
    }: {
      map: google.maps.Map;
      markerLocationLat: number;
      markerLocationLng: number;
    }) => {
      loader
        .importLibrary("marker")
        .then(({ AdvancedMarkerElement, PinElement }) => {
          const marker = new AdvancedMarkerElement({
            map: map,
            position: { lat: markerLocationLat, lng: markerLocationLng },
            content: new PinElement({
              background: "var(--primary-color)",
              glyphColor: "var(--primary-color)",
            }).element,
            gmpDraggable: !disabled,
          });

          marker.addListener("dragend", async (event: any) => {
            const lat = event.latLng.lat();
            const lng = event.latLng.lng();
            markerDragEnd(lat, lng);
          });

          setMarker(marker);
        });
    };

    const resetMap = () => {
      const markerLocationLat = address ? address.lat : defaultLocation.lat;
      const markerLocationLng = address ? address.lng : defaultLocation.lng;
      if (map.current) {
        map.current.setCenter({
          lat: markerLocationLat,
          lng: markerLocationLng,
        });
        if (marker) {
          marker.position = { lat: markerLocationLat, lng: markerLocationLng };
        } else {
          loaderMarker({
            map: map.current,
            markerLocationLat,
            markerLocationLng,
          });
        }
      } else {
        initMap();
      }
    };

    useEffect(() => {
      if (map.current) {
        resetMap();
      } else {
        initMap();
      }
    }, [address]);

    useEffect(() => {
      initMap();
    }, [disabled]);

    const getAddressByLatLng = (lat: number, lng: number) => {
      return loader.importLibrary("geocoding").then(({ Geocoder }) => {
        const geocoder = new Geocoder();
        return geocoder
          .geocode({ location: { lat: lat, lng: lng } })
          .then((res) => {
            const results = res.results;
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

              return adreessInfo;
            }
          });
      });
    };

    const getAddressByAddress = (address: string) => {
      return loader.importLibrary("geocoding").then(({ Geocoder }) => {
        const geocoder = new Geocoder();
        return geocoder.geocode({ address: address }).then((res) => {
          const results = res.results;
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
            const location = results[0].geometry.location;

            adreessInfo.lat = location.lat();
            adreessInfo.lng = location.lng();
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
            return adreessInfo;
          }
        });
      });
    };

    const setMapZoom = (number: number) => {
      if (map.current) {
        map.current.setZoom(number);
      }
    };

    useImperativeHandle(
      ref,
      () => ({
        getAddressByAddress: getAddressByAddress,
        getAddressByLatLng: getAddressByLatLng,
        setMapZoom: setMapZoom,
      }),
      []
    );

    return <div id="map" className="h-full" />;
  }
);
GoogleMap.displayName = "GoogleMap";

export default GoogleMap;
