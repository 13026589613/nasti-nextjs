import PropTypes from "prop-types";
import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const MapControl = ({
  map,
  position,
  children,
}: {
  map: google.maps.Map;
  position: google.maps.ControlPosition;
  children: React.ReactNode;
}) => {
  const controlDivRef = useRef(document.createElement("div"));

  useEffect(() => {
    const controlDiv = controlDivRef.current;
    map.controls[position].push(controlDiv);

    return () => {
      const controlIndex = map.controls[position]
        .getArray()
        .indexOf(controlDiv);
      if (controlIndex > -1) {
        map.controls[position].removeAt(controlIndex);
      }
    };
  }, [map, position]);

  return createPortal(children, controlDivRef.current);
};

MapControl.propTypes = {
  position: PropTypes.number.isRequired,
  children: PropTypes.node.isRequired,
};

export default MapControl;
