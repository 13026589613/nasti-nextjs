import useTimeStore from "@/store/useTimeStore";

const useGlobalTime = () => {
  const {
    UTCMoment,
    localMoment,
    toGlobalTime,
    globalTimeZone,
    zoneAbbr,
    receivedTimeZone,
  } = useTimeStore((state) => ({
    ...state,
  }));
  return {
    localMoment,
    UTCMoment,
    toGlobalTime,
    globalTimeZone,
    zoneAbbr,
    receivedTimeZone,
  };
};

export default useGlobalTime;
