export const ELIGIBILITY_FLAGS = [
  { key: "notNonprofit", label: "The organization is not a nonprofit" },
  { key: "paid", label: "I was paid, or gave up pay, for this work" },
  {
    key: "internship",
    label: "It was part of an internship, clinical, practicum, field experience, or class",
  },
  {
    key: "rsoInternal",
    label: "It mainly served an RSO I belong to, like meetings, recruiting, tabling, or e-board work",
  },
  {
    key: "politicalReligious",
    label: "It involved political campaigning, religious worship, or proselytizing",
  },
  { key: "donation", label: "I donated items or money instead of volunteering my time" },
  {
    key: "participant",
    label: "I participated in an event, like running a 5K, instead of serving at it",
  },
  {
    key: "development",
    label: "It was mainly personal or professional development, like attending a conference",
  },
] as const;

export type FlagKey = (typeof ELIGIBILITY_FLAGS)[number]["key"];

export function flagLabel(key: FlagKey) {
  return ELIGIBILITY_FLAGS.find((flag) => flag.key === key)?.label ?? key;
}