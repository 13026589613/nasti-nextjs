import { Loader } from "@googlemaps/js-api-loader";
import PropTypes from "prop-types";
import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const MapMaker = ({
  map,
  position,
  loader,
  children,
}: {
  map: google.maps.Map;
  loader: Loader;
  position: {
    lat: number;
    lng: number;
  };
  children: React.ReactNode;
}) => {
  const controlDivRef = useRef(document.createElement("div"));

  const marker = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  useEffect(() => {
    const controlDiv = controlDivRef.current;

    loader.importLibrary("marker").then(({ AdvancedMarkerElement }) => {
      const nowMarker = new AdvancedMarkerElement({
        map: map,
        position: { lat: position.lat, lng: position.lng },
        content: controlDiv,
      });

      //it must have a click event or child component will not have click event
      nowMarker.addListener("click", (event: any) => {});

      marker.current = nowMarker;
    });

    return () => {
      if (marker.current) {
        marker.current.map = null;
        marker.current = null;
      }
    };
  }, [map, position]);

  return createPortal(children, controlDivRef.current);
};

MapMaker.propTypes = {
  position: PropTypes.number.isRequired,
  map: PropTypes.object.isRequired,
  loader: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired,
};

export default MapMaker;
