/**
 * Campus location (used for the rain forecast) and the exam calendar.
 * Holy Name University, Janssen Heights, Tagbilaran City, Bohol.
 */
export const campus = {
  latitude: 9.6504,
  longitude: 123.8679,
  timezone: "Asia/Manila",

  /**
   * EDIT THIS: put your real exam dates here (YYYY-MM-DD, both ends inclusive).
   * When rain is forecast on one of these days, the reminder mentions the exam.
   */
  examPeriods: [{ label: "Midterm exam week", from: "2026-10-19", to: "2026-10-24" }],
};
