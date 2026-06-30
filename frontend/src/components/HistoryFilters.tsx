import { Search } from "lucide-react";
import { FormEvent, useState } from "react";
import type { JobHistoryFilters } from "../types/history";

type HistoryFiltersProps = {
  filters: JobHistoryFilters;
  onApply: (filters: JobHistoryFilters) => void;
};

type HistoryInputProps = {
  draftFilters: JobHistoryFilters;
  fieldName: keyof JobHistoryFilters;
  label: string;
  onChange: (filters: JobHistoryFilters) => void;
  type?: string;
};

/** Show and return job history search and date filters. */
export function ShowHistoryFilters({ filters, onApply }: HistoryFiltersProps) {
  const [draftFilters, setDraftFilters] = useState(filters);

  /** Submit filters and return no content. */
  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    onApply(draftFilters);
  }

  return (
    <form className="grid gap-3 md:grid-cols-[1fr_160px_160px_auto]" onSubmit={handleSubmit}>
      <ShowHistoryInput draftFilters={draftFilters} fieldName="filename" label="Search filename" onChange={setDraftFilters} />
      <ShowHistoryInput draftFilters={draftFilters} fieldName="startDate" label="Start date" onChange={setDraftFilters} type="date" />
      <ShowHistoryInput draftFilters={draftFilters} fieldName="endDate" label="End date" onChange={setDraftFilters} type="date" />
      <button className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-950" type="submit">
        <Search className="h-4 w-4" aria-hidden="true" />
        Filter
      </button>
    </form>
  );
}

/** Show and return one history filter input. */
function ShowHistoryInput(props: HistoryInputProps) {
  return (
    <input
      className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
      onChange={(event) => props.onChange({ ...props.draftFilters, [props.fieldName]: event.target.value })}
      placeholder={props.label}
      type={props.type ?? "text"}
      value={props.draftFilters[props.fieldName]}
    />
  );
}
