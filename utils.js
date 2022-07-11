export const groupBySwimlane = (model) => {
  return model.reduce((group, product) => {
    const { swimlane } = product;
    group[swimlane] = group[swimlane] ?? [];
    group[swimlane].push(product);
    return group;
  }, {});
};

export const calcPxPerMinute = (startingTime, endingTime, width) => {
  const msRange = endingTime.getTime() - startingTime.getTime();
  const minuteRange = msRange / 60000;
  return width / minuteRange;
};

export const formatNumber = (num) => `${num > 9 ? "" : "0"}${num}`;

export const positionXToTime = (x, chartViewModel, settings) => {
  const currentMouseTime = new Date(chartViewModel.startingTime);
  const minutes = x / chartViewModel.pxPerMinute;
  currentMouseTime.setMinutes(currentMouseTime.getMinutes() + minutes);
  return currentMouseTime;
};

export const timeToPositionX = (date, chartViewModel) => {
  const dateTime = date.getTime();
  const startTime = chartViewModel.startingTime.getTime();
  const endTime = chartViewModel.endingTime.getTime();
  if (dateTime >= startTime && endTime >= startTime) {
    const minsFromStart = (dateTime - startTime) / 60000;
    return Math.floor(minsFromStart * chartViewModel.pxPerMinute);
  }
  return undefined;
};

export const getTimeSpanInMinutes = (factor) => {
  switch (factor) {
    case 120:
      return 24 * 60;
    case 60:
      return 12 * 60;
    case 30:
      return 6 * 60;
    case 15:
      return 3 * 60;
    case 5:
      return 1 * 60;
    case 1:
      return 0.2 * 60;
    default:
      24 * 60;
  }
};

export const getClosestTimeSlot = (factor, time) => {
  return new Date(
    time.setMinutes(Math.floor(time.getMinutes() / factor) * factor)
  );
};
