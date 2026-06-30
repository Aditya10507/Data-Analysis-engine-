import { AlertCircle } from "lucide-react";
import { buildAcceptedFormatsMessage } from "../utils/uploadErrors";

type UploadErrorMessageProps = {
  errorMessage: string;
};

/** Show and return an upload error message with accepted file guidance. */
export function ShowUploadErrorMessage({ errorMessage }: UploadErrorMessageProps) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
      <div className="flex gap-3">
        <AlertCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-300" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold text-red-700 dark:text-red-200">{errorMessage}</p>
          <p className="mt-1 text-sm text-red-700 dark:text-red-300">
            {buildAcceptedFormatsMessage()}
          </p>
        </div>
      </div>
    </div>
  );
}
