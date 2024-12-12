"use client";
import { Loader } from "@googlemaps/js-api-loader";
import { useEffect } from "react";

import { CheckType } from "@/app/(system)/(service)/timeAndAttendance/types";
import CustomDialog from "@/components/custom/Dialog";
import { GOOGLE_KEY } from "@/constant/googlekey";
interface LocationDialogProps {
  open: boolean;
  checkType?: CheckType;
  location: { lat: number | null; lng: number | null };
  onClose: () => void;
}
const useReturnLocationDialog = ({
  open,
  location,
  checkType,
  onClose,
}: LocationDialogProps) => {
  const loader = new Loader({
    apiKey: GOOGLE_KEY,
    version: "weekly",
    libraries: ["places"],
    language: "en",
    region: "",
  });

  const initMap = (lat: number, lng: number) => {
    loader
      .importLibrary("maps")
      .then(({ Map }) => {
        const map = new Map(document.getElementById("map") as HTMLElement, {
          center: {
            lat: lat as number,
            lng: lng as number,
          },
          zoom: 15,
          mapId: GOOGLE_KEY,
          disableDefaultUI: true,
          fullscreenControl: true,
          draggable: true,
          keyboardShortcuts: false,
          gestureHandling: "cooperative",
        });

        loader
          .importLibrary("marker")
          .then(({ AdvancedMarkerElement, PinElement }) => {
            new AdvancedMarkerElement({
              map: map,
              position: { lat: lat as number, lng: lng as number },
              content: new PinElement({
                background: "var(--primary-color)",
                glyphColor: "var(--primary-color)",
              }).element,
              gmpDraggable: false,
            });
          });
      })
      .catch((e: any) => {});
  };

  useEffect(() => {
    if (location) {
      const { lat, lng } = location;
      initMap(lat || 0, lng || 0);
    }
  }, [location]);

  if (!location) {
    return;
  }

  return (
    <CustomDialog
      width={535}
      title={`Check ${checkType === "checkin" ? "In" : "Out"} Location`}
      open={open}
      onClose={onClose}
    >
      <div id="map" key={"googleMap"} className="w-[503px] h-[348px]"></div>
    </CustomDialog>
  );
};
export default useReturnLocationDialog;
