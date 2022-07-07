(() => {
  const appDiv = document.querySelector("#canvas");
  const ctx = appDiv.getContext("2d");
  appDiv.width = appDiv.clientWidth;
  appDiv.height = appDiv.clientHeight;

  function drawXAxis() {
    const trans = ctx.getTransform();
    const txtWidth = ctx.measureText("00:00");
    const now = new Date();
    now.setSeconds(0);
    now.setMilliseconds(0);

    const slices = getTimeSlices(now, translateZoomToMinutes(model.zoom));
    const rect = (slices.length - 1) * 50;
    const minutesBetweenTotal =
      slices[slices.length - 1].getTime() - slices[0].getTime();
    const minutesBetween = now.getTime() - slices[0].getTime();
    ctx.translate(
      Math.floor(
        appDiv.width * 0.5 -
          ((minutesBetween * rect) / minutesBetweenTotal) * model.zoom
      ),
      0
    );
    ctx.strokeStyle = "#333333";
    ctx.beginPath();
    for (let i = 0; i < slices.length; i++) {
      ctx.moveTo(i * 50 * model.zoom, appDiv.height - 75);
      ctx.lineTo(i * 50 * model.zoom, appDiv.height - 70);
      ctx.stroke();
      ctx.fillText(
        transformDateToTimeString(slices[i]),
        i * 50 * model.zoom - txtWidth.width / 2,
        appDiv.height - 55
      );
    }
    ctx.setTransform(trans);
  }

  function drawNowLine() {
    ctx.strokeStyle = "#FF0000";
    ctx.beginPath();
    ctx.moveTo(appDiv.width * 0.5, 60);
    ctx.lineTo(appDiv.width * 0.5, appDiv.height - 60);
    ctx.stroke();

    const txt = transformDateToTimeString(new Date());
    const meta = ctx.measureText(txt);

    ctx.fillText(txt, appDiv.width * 0.5 - meta.width / 2, appDiv.height - 40);
  }

  function draw() {
    ctx.clearRect(0, 0, 9999999, 9999999);
    drawNowLine();
    drawXAxis();
  }

  draw();
  setInterval(() => {
    draw();
  }, 1000);

  // HTML controls
  const btnIncreaseZoom = document.querySelector("#btn_increaseZoom");
  btnIncreaseZoom.addEventListener("click", () => {
    model.zoom = Math.min(model.zoom + 1, 5);
    lbl_zoomLevel.innerHTML = model.zoom;
    draw();
  });
  const btnDecreaseZoom = document.querySelector("#btn_decreaseZoom");
  btnDecreaseZoom.addEventListener("click", () => {
    model.zoom = Math.max(model.zoom - 1, 1);
    lbl_zoomLevel.innerHTML = model.zoom;
    draw();
  });
  const lbl_zoomLevel = document.querySelector("#lbl_zoomLevel");
  lbl_zoomLevel.innerHTML = model.zoom;
})();
