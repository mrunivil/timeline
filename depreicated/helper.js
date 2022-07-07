const transformDateToTimeString = (date) => {
  const hh = date.getHours();
  const mm = date.getMinutes();
  return `${hh > 9 ? hh : "0" + hh}:${mm > 9 ? mm : "0" + mm}`;
};

// hier is iwie n bug
const getTimeSlices = (date, minutesZoom = 30) => {
  const normalizedDate = new Date(date);
  normalizedDate.setMinutes(
    normalizedDate.getMinutes() + findNextHalfHour(date, minutesZoom)
  );
  normalizedDate.setSeconds(0);
  const ret = [];
  const slices = 30;
  for (let i = 0; i < slices; i++) {
    const d = new Date(normalizedDate);
    d.setMinutes(d.getMinutes() + (-Math.floor(slices / 2) + i) * minutesZoom);
    ret[i] = d;
  }
  return ret;
};

const findNextHalfHour = (date, minutesZoom = 30) => {
  const mm = date.getMinutes();
  const times = 60 / minutesZoom;
  let ret = 0;
  for (let i = 0; i <= times + 2; i++) {
    if (minutesZoom < (i * minutesZoom) / 2) {
      ret = i * minutesZoom - mm;
      break;
    }
  }
  return ret;
};

const translateZoomToMinutes = () => {
  let minutesZoom = 0;
  switch (model.zoom) {
    case 1:
      return 30;
    case 2:
      return 5;
    case 3:
      return 1;
    default:
      minutesZoom = 30;
      break;
  }
};
