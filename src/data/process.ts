import { projectDossiers } from "./dossiers";

export const processProject = { title: "机甲狂澜", id: "mech" };
export const processSteps = projectDossiers.mech.records.map((record) => ({
  ...record,
  image: record.media[0].src.split("/").pop()!.replace(".webp", ""),
  description: record.summary,
}));
