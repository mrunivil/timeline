import { fixtures, settings } from "./fixtures.js";
import {
  optimizeSwimlane,
  parseToChartViewSeries,
  toChartModel,
} from "./services.js";
import {
  formatNumber,
  getClosestTimeSlot,
  getTimeSpanInMinutes,
  positionXToTime,
  timeToPositionX,
} from "./utils.js";

const canvas = document.querySelector("#board");
const context = canvas.getContext("2d");
const interaction = document.querySelector("#interaction");
const interactionContext = interaction.getContext("2d");
const container = document.querySelector(".container");
const lblScale = document.querySelector("#scale");

document.querySelector("#btnReset").addEventListener("click", () => {
  resetTime();
});

document.querySelector("#btnZoomIn").addEventListener("click", () => {
  zoomIn(chartViewModel);
});

document.querySelector("#btnZoomOut").addEventListener("click", () => {
  zoomOut(chartViewModel);
});

let zoomed,
  chartModel = {},
  legendViewModel = {},
  chartViewModel = {
    scale: 120,
  },
  dragStart,
  dragEnd,
  currentMouseTime;

window.addEventListener("resize", () => {
  recalcCanvas(container, canvas);
  updateLegendViewModel(canvas, chartModel);
  updateChartViewModel(canvas, legendViewModel, chartModel);
  recalcInteractionZone(chartViewModel, interaction);
  canvas.height = legendViewModel.height;
  canvas.style.height = `${legendViewModel.height}px`;
});

interaction.addEventListener("mousedown", ($event) => {
  // dragStart = { x: $event.layerX, y: $event.layerY };
});
interaction.addEventListener("mouseup", ($event) => {
  // if (!!dragStart && !!dragEnd) {
  //   zoomIn(dragStart.x, dragEnd.x, chartViewModel);
  //   updateChartViewModel(canvas, legendViewModel, chartViewModel);
  //   zoomed = true;
  // }
  // dragStart = undefined;
  // dragEnd = undefined;
});
interaction.addEventListener("mousemove", ($event) => {
  // dragEnd = { x: $event.layerX, y: $event.layerY };
  if (chartViewModel.startingTime && chartViewModel.endingTime) {
    currentMouseTime = positionXToTime($event.layerX, chartViewModel, settings);
  }
});
interaction.addEventListener("mouseleave", ($event) => {
  // dragStart = undefined;
  // dragEnd = undefined;
});

const recalcCanvas = (container, canvas) => {
  let style = getComputedStyle(container);
  const width = Math.floor(parseInt(style.width) - parseInt(style.padding) * 2);
  const height = Math.floor(
    parseInt(style.height) - parseInt(style.padding) * 2
  );

  canvas.width = width;
  canvas.height = height;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
};

const recalcInteractionZone = (chartViewModel, interaction) => {
  const width = Math.floor(chartViewModel.contentWidth);
  const height = Math.floor(chartViewModel.height);

  interaction.width = width;
  interaction.height = height;
  interaction.style.width = `${width}px`;
  interaction.style.height = `${height}px`;
  interaction.style.left = `${
    chartViewModel.transformX + settings.chart.padding
  }px`;
};

const updateModel = () => {
  chartModel = toChartModel(fixtures);
  for (let key in chartModel) {
    optimizeSwimlane(key, chartModel);
  }
};

const updateLegendViewModel = (canvas, chartModel) => {
  if (canvas.clientWidth < 800) {
    legendViewModel.show = false;
    legendViewModel.width = 0;
  } else {
    legendViewModel.show = true;
    legendViewModel.width = Math.floor(
      Math.max(
        Math.min(canvas.clientWidth * 0.25, Math.max(200, 300)),
        Math.min(200, 300)
      )
    );
  }
  legendViewModel.entries = Object.keys(chartModel).map((swimlane) => {
    return {
      label: swimlane,
      height: Math.floor(
        2 * settings.board.gap +
          settings.board.gap * chartModel[swimlane].length +
          settings.chart.itemHeight * chartModel[swimlane].length
      ),
    };
  });
  legendViewModel.height = Math.floor(
    settings.legend.bottom +
      legendViewModel.entries.reduce((prev, curr) => {
        return prev + curr.height;
      }, 0)
  );
};

const updateChartViewModel = (canvas, legendViewModel, chartModel) => {
  chartViewModel.width = Math.floor(canvas.clientWidth - legendViewModel.width);
  chartViewModel.contentWidth =
    chartViewModel.width - settings.chart.padding * 2;
  chartViewModel.height = legendViewModel.height;
  chartViewModel.transformX = legendViewModel.width + settings.chart.padding;
  chartViewModel.duration =
    (chartViewModel.endingTime.getTime() -
      chartViewModel.startingTime.getTime()) /
    60000;
  chartViewModel.pxPerMinute =
    chartViewModel.contentWidth / chartViewModel.duration;
  chartViewModel.series = parseToChartViewSeries(
    chartModel,
    chartViewModel,
    settings
  );
};

const drawLegend = (ctx, canvas, legendViewModel, settings) => {
  ctx.save();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#333333A0";
  ctx.fillStyle = "#333333CC";
  ctx.font = "1rem Noto Sans";
  ctx.translate(settings.legend.padding, settings.legend.padding);
  ctx.beginPath();
  ctx.moveTo(legendViewModel.width, 0);
  ctx.lineTo(
    legendViewModel.width,
    legendViewModel.height - settings.legend.padding * 2
  );
  ctx.stroke();
  chartViewModel.series?.forEach((series, index) => {
    if (index === 0) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(canvas.width, 0);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(0, series.y + series.height);
    ctx.lineTo(canvas.width, series.y + series.height);
    ctx.stroke();
    if (legendViewModel.show) {
      ctx.fillText(
        series.label,
        settings.legend.padding,
        series.y + series.height / 2
      );
    }
  });
  ctx.restore();
};

const drawChart = (ctx, canvas, chartViewModel, settings) => {
  ctx.save();
  ctx.translate(chartViewModel.transformX, 0);
  // ctx.strokeRect(
  //   -settings.chart.padding,
  //   0,
  //   chartViewModel.width,
  //   chartViewModel.height
  // );
  // ctx.strokeRect(0, 0, chartViewModel.contentWidth, chartViewModel.height);
  // ctx.lineWidth = 0.05;
  // const countLines = Math.floor(
  //   chartViewModel.contentWidth / chartViewModel.pxPerMinute
  // );
  // for (let i = 0; i < countLines; i++) {
  //   ctx.strokeRect(i * chartViewModel.pxPerMinute, 0, 1, chartViewModel.height);
  // }
  ctx.restore();
  drawGroup(ctx, chartViewModel, settings);
};

let debugged = false;

const drawGroup = (ctx, chartViewModel, settings) => {
  if (!debugged) {
    console.dir(chartViewModel.series);
    debugged = true;
  }
  ctx.save();
  ctx.lineWidth = 1;
  ctx.translate(settings.legend.padding, settings.legend.padding);
  chartViewModel.series?.forEach((series) => {
    drawEntries(ctx, chartViewModel, settings);
  });
  ctx.restore();
};

const drawEntries = (ctx, chartViewModel, settings) => {};

const drawBottom = (ctx, canvas, chartViewModel, settings) => {
  const minsPerUnit = chartViewModel.factor * chartViewModel.pxPerMinute;
  const countLines = Math.floor(chartViewModel.width / minsPerUnit) + 1;

  ctx.save();
  ctx.translate(
    chartViewModel.transformX,
    chartViewModel.height + settings.board.gap * 2 - settings.legend.bottom
  );
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#33333320";
  ctx.fillStyle = "#333333";
  for (let i = 0; i < countLines; i++) {
    let tmp = new Date(chartViewModel.startingTime);
    tmp.setMinutes(tmp.getMinutes() + i * chartViewModel.factor);
    tmp = getClosestTimeSlot(chartViewModel.factor, tmp);

    const pos = timeToPositionX(tmp, chartViewModel);

    ctx.strokeRect(pos, 0, 1, 12);
    ctx.fillText(
      `${formatNumber(tmp.getHours())}:${formatNumber(tmp.getMinutes())}`,
      pos - chartViewModel.halfTextWidth,
      24
    );
    ctx.strokeRect(
      pos,
      0,
      1,
      +settings.legend.bottom - chartViewModel.height + settings.board.gap * 2
    );
  }
  ctx.restore();
};

const drawInteraction = (ctx, interaction, dragStart, dragEnd) => {
  ctx.clearRect(0, 0, interaction.width, interaction.height);
  ctx.fillStyle = "#eadf78A0";
  if (!!dragStart && !!dragEnd) {
    ctx.fillRect(dragStart.x, 0, dragEnd.x - dragStart.x, interaction.height);
  }
  if (!!dragEnd && !!currentMouseTime) {
    ctx.fillStyle = "#333333";
    ctx.fillText(
      `x:${dragEnd.x} -  ${currentMouseTime.toLocaleString()} - duration:${
        chartViewModel.duration
      } - width:${chartViewModel.contentWidth}\n- pxPerMin:${
        chartViewModel.pxPerMinute
      }`,
      dragEnd.x - 200,
      dragEnd.y
    );
  }
};

const drawNowLine = (ctx, chartViewModel) => {
  ctx.save();
  const x = timeToPositionX(new Date(), chartViewModel);
  if (x) {
    ctx.strokeStyle = "red";
    ctx.translate(chartViewModel.transformX, 0);
    ctx.strokeRect(x, 0, 1, chartViewModel.height);
  }
  ctx.restore();
};

const updateControls = (chartViewModel) => {
  lblScale.textContent = `${chartViewModel.factor}`;
};

const resetTime = () => {
  chartViewModel.factor = 120;
  recalcTimeSlot(chartViewModel);
  updateControls(chartViewModel);
};

const zoomIn = (chartViewModel) => {
  switch (chartViewModel.factor) {
    case 120:
      chartViewModel.factor = 60;
      break;
    case 60:
      chartViewModel.factor = 30;
      break;
    case 30:
      chartViewModel.factor = 15;
      break;
    case 15:
      chartViewModel.factor = 5;
      break;
    case 5:
      chartViewModel.factor = 1;
      break;
  }
  recalcTimeSlot(chartViewModel);
  updateControls(chartViewModel);
};
const zoomOut = (chartViewModel) => {
  switch (chartViewModel.factor) {
    case 1:
      chartViewModel.factor = 5;
      break;
    case 5:
      chartViewModel.factor = 15;
      break;
    case 15:
      chartViewModel.factor = 30;
      break;
    case 30:
      chartViewModel.factor = 60;
      break;
    case 60:
      chartViewModel.factor = 120;
      break;
  }
  recalcTimeSlot(chartViewModel);
  updateControls(chartViewModel);
};

const recalcTimeSlot = (chartViewModel) => {
  const oneMinute = 600000;
  const now = Date.now();
  const min = new Date(now);
  const timeSpan = getTimeSpanInMinutes(chartViewModel.factor);
  min.setMinutes(min.getMinutes() - Math.round(timeSpan / 6));
  const max = new Date(now);
  max.setMinutes(max.getMinutes() + Math.round((timeSpan * 5) / 6));
  chartViewModel.startingTime = new Date(min);
  chartViewModel.endingTime = new Date(max);
};

/**
 * this stuff must be triggerd on new entries and on resize
 */
recalcCanvas(container, canvas);
updateModel();
resetTime();
updateLegendViewModel(canvas, chartModel);
updateChartViewModel(canvas, legendViewModel, chartModel);
recalcInteractionZone(chartViewModel, interaction);
canvas.height = legendViewModel.height;
canvas.style.height = `${legendViewModel.height}px`;

chartViewModel.halfTextWidth = context.measureText("00:00").width / 2;

console.dir(chartModel);

const loop = () => {
  window.requestAnimationFrame(() => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    recalcTimeSlot(chartViewModel);
    updateChartViewModel(canvas, legendViewModel, chartModel);
    drawLegend(context, canvas, legendViewModel, settings);
    drawChart(context, canvas, chartViewModel, settings);
    drawBottom(context, canvas, chartViewModel, settings);
    drawInteraction(interactionContext, interaction, dragStart, dragEnd);
    drawNowLine(context, chartViewModel);
    loop();
  });
};

loop();
