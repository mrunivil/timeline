export const settings = {
  board: {
    lines: true,
    gap: 8,
  },
  legend: {
    padding: 32,
    show: true,
    width: 0,
    height: 0,
    bottom: 48,
  },
  chart: {
    padding: 32,
    itemHeight: 64,
    showMinutesWhenPxPerMinuteLessThen: Infinity,
    showFifteenMinutesWhenPxPerMinuteLessThen: 16,
    showThirtyMinutesWhenPxPerMinuteLessThen: 8,
    showSixtyMinutesWhenPxPerMinuteLessThen: 2,
    showHundredTwentyMinutesWhenPxPerMinuteLessThen: 1,
  },
};

export const fixtures = [
  {
    startingDate: new Date(
      new Date().setHours(new Date().getHours() - 1, 0, 0, 0)
    ),
    endingDate: new Date(new Date().setHours(new Date().getHours(), 0, 0, 0)),
    title: "some title",
    swimlane: "group 1",
  },
  {
    startingDate: new Date(),
    endingDate: new Date(
      new Date().setHours(new Date().getHours() + 1, 0, 0, 0)
    ),
    title: "some title 2",
    swimlane: "group 1",
  },
  {
    startingDate: new Date(),
    endingDate: new Date(
      new Date().setHours(new Date().getHours() + 1, 0, 0, 0)
    ),
    title: "some title 2",
    swimlane: "group 1",
  },
  {
    startingDate: new Date(),
    endingDate: new Date(
      new Date().setHours(new Date().getHours() + 1, 0, 0, 0)
    ),
    title: "some title 3",
    swimlane: "group 2",
  },
  {
    startingDate: new Date(
      new Date().setHours(new Date().getHours() - 1, 0, 0, 0)
    ),
    endingDate: new Date(
      new Date().setHours(new Date().getHours() + 1, 0, 0, 0)
    ),
    title: "some title 4",
    swimlane: "no group",
  },
];
