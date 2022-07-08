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

export const getStepsUnit = (pxPerMinute, settings) => {
  if (
    pxPerMinute < settings.chart.showHundredTwentyMinutesWhenPxPerMinuteLessThen
  )
    return 120;
  if (pxPerMinute < settings.chart.showSixtyMinutesWhenPxPerMinuteLessThen)
    return 60;
  if (pxPerMinute < settings.chart.showThirtyMinutesWhenPxPerMinuteLessThen)
    return 30;
  if (pxPerMinute < settings.chart.showFifteenMinutesWhenPxPerMinuteLessThen)
    return 15;
  if (pxPerMinute < settings.chart.showMinutesWhenPxPerMinuteLessThen) return 1;
  return 60;
};

export const getPxScale = (chartViewModel) => {
  return Math.floor(chartViewModel.pxPerMinute * chartViewModel.scale);
};

export const formatNumber = (num) => `${num > 9 ? "" : "0"}${num}`;
