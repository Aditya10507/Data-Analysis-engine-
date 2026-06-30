import { ShowDataPreviewTable } from "../components/DataPreviewTable";
import { ShowFileUploadDropzone } from "../components/FileUploadDropzone";
import { useAppStore } from "../store/appStore";

/** Display and return the upload page shell. */
export function DisplayUploadPage() {
  const parsedPreview = useAppStore((state) => state.parsedPreview);

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-lg font-semibold text-slate-950 dark:text-white">
          Upload dataset
        </h3>
        <div className="mt-6">
          <ShowFileUploadDropzone />
        </div>
      </div>
      {parsedPreview ? <ShowDataPreviewTable preview={parsedPreview} /> : null}
    </section>
  );
}
