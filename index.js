import { fixtures, settings } from "./fixtures.js";
import {
  optimizeSwimlane,
  parseToChartViewSeries,
  toChartModel,
  zoomIn,
} from "./services.js";
import {
  formatNumber,
  getPxScale,
  getStepsUnit,
  positionXToTime,
  timeToPositionX,
} from "./utils.js";

const canvas = document.querySelector("#board");
const context = canvas.getContext("2d");
const interaction = document.querySelector("#interaction");
const interactionContext = interaction.getContext("2d");
const container = document.querySelector(".container");
const btnReset = document
  .querySelector("#btnZoom")
  .addEventListener("click", () => {
    resetTime();
  });

let zoomed,
  chartModel = {},
  legendViewModel = {},
  chartViewModel = {},
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
  dragStart = { x: $event.layerX, y: $event.layerY };
});
interaction.addEventListener("mouseup", ($event) => {
  if (!!dragStart && !!dragEnd) {
    zoomIn(dragStart.x, dragEnd.x, chartViewModel);
    updateChartViewModel(canvas, legendViewModel, chartViewModel);
    zoomed = true;
  }
  dragStart = undefined;
  dragEnd = undefined;
});
interaction.addEventListener("mousemove", ($event) => {
  dragEnd = { x: $event.layerX, y: $event.layerY };
  if (chartViewModel.startingTime && chartViewModel.endingTime) {
    currentMouseTime = positionXToTime($event.layerX, chartViewModel, settings);
  }
});
interaction.addEventListener("mouseleave", ($event) => {
  dragStart = undefined;
  dragEnd = undefined;
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
  }
};

const updateChartViewModel = (canvas, legendViewModel, chartModel) => {
  if (!zoomed) {
    resetTime();
  }
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
  chartViewModel.scale = getStepsUnit(chartViewModel.pxPerMinute, settings);
  chartViewModel.pxScale = getPxScale(chartViewModel);
  chartViewModel.series = parseToChartViewSeries(
    chartModel,
    chartViewModel,
    settings
  );
};

const drawLegend = (ctx, canvas, legendViewModel, settings) => {
  if (legendViewModel.show) {
    ctx.lineWidth = 0.25;
    // ctx.strokeRect(0, 0, legendViewModel.width, legendViewModel.height, 1);
    ctx.strokeRect(
      settings.legend.padding,
      settings.legend.padding,
      legendViewModel.width - settings.legend.padding * 2,
      legendViewModel.height - settings.legend.padding * 2
    );
  }
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
  ctx.lineWidth = 0.25;
  ctx.translate(settings.legend.padding, settings.legend.padding);
  chartViewModel.series?.forEach((series) => {
    ctx.beginPath();
    ctx.moveTo(0, series.y + series.height);
    ctx.lineTo(canvas.width, series.y + series.height);
    ctx.stroke();
    const width = ctx.measureText(series.label).width;
    ctx.fillText(
      series.label,
      legendViewModel.width - settings.legend.padding * 2 - width,
      series.y + series.height / 2
    );
  });
  ctx.restore();
};

const drawEntry = (ctx, chartViewModel, settings) => {};

const drawBottom = (ctx, canvas, chartViewModel, settings) => {
  ctx.save();
  ctx.translate(
    chartViewModel.transformX,
    chartViewModel.height - settings.legend.bottom
  );
  ctx.strokeStyle = "#333333";

  let factor = 120;

  if (chartViewModel.pxPerMinute > 30) {
    factor = 1;
  } else if (chartViewModel.pxPerMinute > 6) {
    factor = 5;
  } else if (chartViewModel.pxPerMinute > 2) {
    factor = 15;
  } else if (chartViewModel.pxPerMinute > 1) {
    factor = 30;
  } else if (chartViewModel.pxPerMinute > 0.65) {
    factor = 60;
  } else if (chartViewModel.pxPerMinute > 0.35) {
    factor = 120;
  } else {
    factor = 240;
  }
  const minsPerUnit = factor * chartViewModel.pxPerMinute;

  const countLines = Math.floor(chartViewModel.width / minsPerUnit) + 1;
  ctx.lineWidth = 0.25;
  ctx.fillStyle = "#333333";
  for (let i = 0; i < countLines; i++) {
    const tmp = new Date(chartViewModel.startingTime);
    tmp.setMinutes(tmp.getMinutes() + i * factor);
    ctx.strokeRect(i * minsPerUnit, 24, 1, 8);
    ctx.fillText(
      `${formatNumber(tmp.getHours())}:${formatNumber(tmp.getMinutes())}`,
      i * minsPerUnit - chartViewModel.halfTextWidth,
      42
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

const resetTime = () => {
  const now = Date.now();
  const start = now - 1000 * 60 * 60 * 12;
  const end = now + 1000 * 60 * 60 * 12;
  chartViewModel.startingTime = new Date(start);
  chartViewModel.endingTime = new Date(end);
  zoomed = false;
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
