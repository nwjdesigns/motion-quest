interface ExperimentEntry {
  id: string;
  date: Date;
}

interface ExperimentNav {
  prev: string | null;
  next: string | null;
}

export function getExperimentNav(
  experiments: ExperimentEntry[],
  currentSlug: string,
): ExperimentNav {
  const sorted = [...experiments].sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  );

  const index = sorted.findIndex((e) => e.id === currentSlug);

  return {
    prev: index > 0 ? sorted[index - 1].id : null,
    next: index < sorted.length - 1 ? sorted[index + 1].id : null,
  };
}
