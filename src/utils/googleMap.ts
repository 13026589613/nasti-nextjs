import { PolygonListItem } from "@/app/(system)/(service)/community/create/scheduleRules/components/timeAndAttendace";

export const getCenterPoint = (
  polygon: {
    lat: number;
    lng: number;
  }[]
) => {
  let lat = 0;
  let lng = 0;
  polygon.forEach((point) => {
    lat += point.lat;
    lng += point.lng;
  });
  return {
    lat: lat / polygon.length,
    lng: lng / polygon.length,
  };
};

export const getPolygonListCenter = (polygonList: PolygonListItem[]) => {
  let checkInPolygon = polygonList.find(
    (polygon) => polygon.type === "CHECK_IN"
  );
  if (checkInPolygon) {
    return getCenterPoint(
      checkInPolygon.data as { lat: number; lng: number }[]
    );
  }
  let checkOutPolygon = polygonList.find(
    (polygon) => polygon.type === "CHECK_OUT"
  );
  if (checkOutPolygon) {
    return getCenterPoint(
      checkOutPolygon.data as { lat: number; lng: number }[]
    );
  }
  return null;
};

export const createNewPolygon = (
  paths: any[] | google.maps.MVCArray<any>,
  type: "CHECK_IN" | "CHECK_OUT"
) => {
  if (type === "CHECK_IN") {
    return new google.maps.Polygon({
      paths: paths,
      editable: true,
      draggable: false,
      strokeColor: "#63E400",
      fillColor: "#69DD30",
      fillOpacity: 0.3,
      zIndex: 2,
    });
  } else {
    return new google.maps.Polygon({
      paths: paths,
      editable: true,
      draggable: false,
      strokeColor: "#FF8A0C",
      fillColor: "#FFD48E",
      fillOpacity: 0.5,
      zIndex: 1,
    });
  }
};

export const checkBigPolygon = (data: {
  checkInPolygon: google.maps.Polygon | null;
  checkOutPolygon: google.maps.Polygon | null;
}) => {
  const { checkInPolygon, checkOutPolygon } = data;
  let checkInArea = 0;
  if (checkInPolygon) {
    checkInArea = google.maps.geometry.spherical.computeArea(
      checkInPolygon.getPath()
    );
  }
  let checkOutArea = 0;
  if (checkOutPolygon) {
    checkOutArea = google.maps.geometry.spherical.computeArea(
      checkOutPolygon.getPath()
    );
  }

  if (!checkInPolygon && !checkOutPolygon) {
    return;
  }

  if (checkInPolygon && !checkOutPolygon) {
    checkInPolygon.setOptions({
      zIndex: 2,
    });
    return;
  }

  if (!checkInPolygon && checkOutPolygon) {
    checkOutPolygon.setOptions({
      zIndex: 1,
    });
    return;
  }

  if (checkInPolygon && checkOutPolygon) {
    if (checkInArea > checkOutArea) {
      checkInPolygon.setOptions({
        zIndex: 1,
      });
      checkOutPolygon.setOptions({
        zIndex: 2,
      });
    } else {
      checkOutPolygon.setOptions({
        zIndex: 1,
      });
      checkInPolygon.setOptions({
        zIndex: 2,
      });
    }
  }
};

export const getSquareCorners = (
  lat: number,
  lng: number,
  sideLength: number
) => {
  // The radius of the earth in meters
  const EARTH_RADIUS = 6378137;

  // Convert side length from feet to meters
  const sideLengthMeters = sideLength * 0.3048;

  // Calculate half the side length
  const halfSide = sideLengthMeters / 2;

  // Calculate the latitude and longitude offset
  const latOffset = (halfSide / EARTH_RADIUS) * (180 / Math.PI);
  const lngOffset =
    (halfSide / (EARTH_RADIUS * Math.cos((Math.PI * lat) / 180))) *
    (180 / Math.PI);

  // Calculate the latitude and longitude of the four corner points
  const topLeft = { lat: lat + latOffset, lng: lng - lngOffset };
  const topRight = { lat: lat + latOffset, lng: lng + lngOffset };
  const bottomLeft = { lat: lat - latOffset, lng: lng - lngOffset };
  const bottomRight = { lat: lat - latOffset, lng: lng + lngOffset };

  return [topLeft, topRight, bottomRight, bottomLeft];
};
