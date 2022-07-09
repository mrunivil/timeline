import { groupBySwimlane, positionXToTime, timeToPositionX } from "./utils.js";

export const toChartModel = (model) => {
  return groupBySwimlane(model);
};

export const optimizeSwimlane = (swimlane, model) => {
  const entries = model[swimlane];
  const ret = [];
  let earliestRowIndex = 0;
  entries.forEach((appointment) => {
    for (let x = 0; x < ret.length; x++) {
      const apps = ret[x];
      if (
        apps[apps.length - 1].endingTime.getTime() <
        appointment.startingTime.getTime()
      ) {
        earliestRowIndex = x;
        break;
      }
      if (x === ret.length - 1) {
        earliestRowIndex = ret.length;
      }
    }
    ret[earliestRowIndex] = [...(ret[earliestRowIndex] ?? []), appointment];
  });
  model[swimlane] = ret;
};

export const parseToChartViewSeries = (data, chartViewModel, settings) => {
  var yStart = 0;
  return Object.keys(data).map((lane, index) => {
    const ret = {
      y: yStart + settings.board.gap,
      height:
        settings.chart.itemHeight * data[lane].length +
        (data[lane].length / 2) * settings.board.gap +
        settings.board.gap,
      label: lane,
      entries: data[lane].map((e) =>
        parseChartViewEntries(e, chartViewModel, settings)
      ),
    };
    yStart = ret.y + ret.height;
    return ret;
  });
};

// calc start point and width of entry
export const parseChartViewEntries = (row, chartViewModel, settings) => {
  return row.map((e) => {
    return {
      x: timeToPositionX(e.startingTime, chartViewModel, settings),
      y: 0,
      width:
        timeToPositionX(e.endingTime, chartViewModel, settings) -
        timeToPositionX(e.startingTime, chartViewModel, settings),
      height: settings.chart.itemHeight,
    };
  });
};

export const zoomIn = (xStart, xEnd, chartViewModel) => {
  const dragStartX = Math.min(xStart, xEnd);
  const dragEndX = Math.max(xStart, xEnd);

  if (dragEndX - dragStartX < 10) return;

  // calc mins of dragged are
  const timeStart = positionXToTime(dragStartX, chartViewModel);
  const timeEnd = positionXToTime(dragEndX, chartViewModel);
  const diff = (timeEnd.getTime() - timeStart.getTime()) / 60000;

  chartViewModel.startingTime = timeStart;
  if (diff < 10) {
    chartViewModel.endingTime = new Date(timeStart.getTime() + 600000);
  } else {
    chartViewModel.endingTime = timeEnd;
  }
};
