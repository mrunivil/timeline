import { fixtures, settings } from "./fixtures.js";
import { optimizeSwimlane, toChartModel } from "./services.js";
import { calcPxPerMinute, getPxScale, getStepsUnit } from "./utils.js";

const canvas = document.querySelector("#board");
const context = canvas.getContext("2d");
const interaction = document.querySelector("#interaction");
const interactionContext = interaction.getContext("2d");
const container = document.querySelector(".container");

let chartModel,
  legendViewModel = {},
  chartViewModel = {};

window.addEventListener("resize", () => {
  recalcCanvas(container, canvas);
  updateLegendViewModel(canvas, chartModel);
  updateChartViewModel(canvas, legendViewModel, chartModel);
  recalcInteractionZone(chartViewModel, interaction);
  canvas.height = legendViewModel.height;
  canvas.style.height = `${legendViewModel.height}px`;
});

let dragStart, dragEnd;
let currentMouseTime;

interaction.addEventListener("mousedown", ($event) => {
  dragStart = { x: $event.layerX, y: $event.layerY };
});
interaction.addEventListener("mouseup", ($event) => {
  dragStart = undefined;
  dragEnd = undefined;
});
interaction.addEventListener("mousemove", ($event) => {
  dragEnd = { x: $event.layerX, y: $event.layerY };
  if (chartViewModel.startingTime && chartViewModel.endingTime) {
    currentMouseTime = new Date(chartViewModel.startingTime);
    const minutes = $event.layerX / chartViewModel.pxPerMinute;
    currentMouseTime.setMinutes(currentMouseTime.getMinutes() + minutes);
  }
});
interaction.addEventListener("mouseleave", ($event) => {
  console.log(dragStart, dragEnd);
  dragStart = undefined;
  dragEnd = undefined;
});

const recalcCanvas = (container, canvas) => {
  const width = Math.floor(container.clientWidth);
  const height = Math.floor(container.clientHeight);

  canvas.width = width;
  canvas.height = height;
};
const recalcInteractionZone = (chartViewModel, interaction) => {
  const width = Math.floor(chartViewModel.width);
  const height = Math.floor(chartViewModel.height);

  interaction.width = width;
  interaction.height = height;
  interaction.style.width = width;
  interaction.style.height = height;
  interaction.style.left = `${chartViewModel.transformX}px`;
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
  chartViewModel.width = Math.floor(canvas.clientWidth - legendViewModel.width);
  chartViewModel.height = legendViewModel.height;
  chartViewModel.transformX = legendViewModel.width;
  chartViewModel.startingTime = new Date(
    new Date().setHours(new Date().getHours() - 1, 0, 0, 0)
  );
  chartViewModel.endingTime = new Date(
    new Date().setHours(new Date().getHours() + 1, 0, 0, 0)
  );
  chartViewModel.pxPerMinute = calcPxPerMinute(
    chartViewModel.startingTime,
    chartViewModel.endingTime,
    chartViewModel.width
  );
  chartViewModel.scale = getStepsUnit(chartViewModel.pxPerMinute, settings);
  chartViewModel.pxScale = getPxScale(chartViewModel);
};

const drawLegend = (ctx, canvas, legendViewModel, settings) => {
  if (legendViewModel.show) {
    ctx.fillStyle = "cyan";
    ctx.fillRect(0, 0, legendViewModel.width, legendViewModel.height);
  }
};

const drawChart = (ctx, canvas, chartViewModel, settings) => {
  ctx.save();
  ctx.translate(chartViewModel.transformX, 0);
  ctx.fillStyle = "orange";
  ctx.fillRect(0, 0, chartViewModel.width, chartViewModel.height);
  ctx.fillStyle = "#333333";
  ctx.lineWidth = 0.05;
  const countLines = Math.floor(
    chartViewModel.width / chartViewModel.pxPerMinute
  );
  for (let i = 0; i < countLines; i++) {
    ctx.strokeRect(i * chartViewModel.pxPerMinute, 0, 1, chartViewModel.height);
  }
  ctx.restore();
};

const drawBottom = (ctx, canvas, chartViewModel, settings) => {
  ctx.save();
  ctx.translate(0, chartViewModel.height - settings.legend.bottom);
  ctx.fillStyle = "red";
  ctx.fillRect(0, 0, canvas.width, settings.legend.bottom);
  ctx.translate(chartViewModel.transformX, 0);
  ctx.fillStyle = "violet";
  ctx.fillRect(0, 0, chartViewModel.width, settings.legend.bottom);

  ctx.strokeStyle = "#333333";
  const countLines = Math.floor(
    chartViewModel.width / chartViewModel.pxPerMinute
  );
  for (let i = 0; i < countLines; i++) {
    ctx.strokeRect(
      i * chartViewModel.pxPerMinute,
      settings.legend.bottom / 2 - 8,
      1,
      16
    );
  }
  ctx.restore();
};

const drawInteraction = (ctx, interaction, dragStart, dragEnd) => {
  ctx.clearRect(0, 0, interaction.width, interaction.height);
  ctx.strokeStyle = "green";
  if (!!dragStart && !!dragEnd) {
    ctx.strokeRect(dragStart.x, 0, dragEnd.x - dragStart.x, interaction.height);
  }
  if (!!dragEnd && !!currentMouseTime) {
    ctx.fillText(`${currentMouseTime.toLocaleString()}`, dragEnd.x, dragEnd.y);
  }
};

/**
 * this stuff must be triggerd on new entries and on resize
 */
recalcCanvas(container, canvas);
updateModel();
updateLegendViewModel(canvas, chartModel);
updateChartViewModel(canvas, legendViewModel, chartModel);
recalcInteractionZone(chartViewModel, interaction);
canvas.height = legendViewModel.height;
canvas.style.height = `${legendViewModel.height}px`;

console.debug(chartViewModel);

const loop = () => {
  window.requestAnimationFrame(() => {
    updateChartViewModel(canvas, legendViewModel, chartModel);
    drawLegend(context, canvas, legendViewModel);
    drawChart(context, canvas, chartViewModel);
    drawBottom(context, canvas, chartViewModel, settings);
    drawInteraction(interactionContext, interaction, dragStart, dragEnd);
    loop();
  });
};

loop();
