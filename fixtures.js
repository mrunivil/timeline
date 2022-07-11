export const settings = {
  board: {
    lines: true,
    gap: 8,
    padding: 32,
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
    itemHeight: 32,
    showMinutesWhenPxPerMinuteLessThen: Infinity,
    showFifteenMinutesWhenPxPerMinuteLessThen: 100,
    showThirtyMinutesWhenPxPerMinuteLessThen: 50,
    showSixtyMinutesWhenPxPerMinuteLessThen: 25,
    showHundredTwentyMinutesWhenPxPerMinuteLessThen: 10,
  },
};

export const fixtures = [
  {
    startingTime: new Date(
      new Date().setHours(new Date().getHours() - 1, 0, 0, 0)
    ),
    endingTime: new Date(new Date().setHours(new Date().getHours(), 0, 0, 0)),
    title: "some title",
    swimlane: "group 1",
  },
  {
    startingTime: new Date(),
    endingTime: new Date(
      new Date().setHours(new Date().getHours() + 1, 0, 0, 0)
    ),
    title: "some title 2",
    swimlane: "group 1",
  },
  {
    startingTime: new Date(),
    endingTime: new Date(
      new Date().setHours(new Date().getHours() + 1, 0, 0, 0)
    ),
    title: "some title 2",
    swimlane: "group 1",
  },
  {
    startingTime: new Date(),
    endingTime: new Date(
      new Date().setHours(new Date().getHours() + 1, 0, 0, 0)
    ),
    title: "some title 3",
    swimlane: "group 2",
  },
  {
    startingTime: new Date(
      new Date().setHours(new Date().getHours() - 1, 0, 0, 0)
    ),
    endingTime: new Date(
      new Date().setHours(new Date().getHours() + 1, 0, 0, 0)
    ),
    title: "some title 4",
    swimlane: "no group",
  },
];
