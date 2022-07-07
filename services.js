import { groupBySwimlane } from "./utils.js";

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
        apps[apps.length - 1].endingDate.getTime() <
        appointment.startingDate.getTime()
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
