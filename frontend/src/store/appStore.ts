import { create } from "zustand";

import type { AnalysisResult, AnalysisStatus, AppView } from "../types/app";
import type { DownloadRecord } from "../types/downloads";
import type { JobResult, ParsedFilePreview } from "../types/files";

const MAX_DOWNLOAD_HISTORY_ITEMS = 5;

type AppState = {
  activeView: AppView;
  analysisResult: AnalysisResult | null;
  hasApiConnection: boolean;
  isDarkMode: boolean;
  downloadHistory: DownloadRecord[];
  jobErrorMessage: string | null;
  jobId: string | null;
  jobResult: JobResult | null;
  parsedPreview: ParsedFilePreview | null;
  status: AnalysisStatus;
  uploadedFile: File | null;
  addDownloadRecord: (downloadRecord: DownloadRecord) => void;
  setApiConnection: (hasApiConnection: boolean) => void;
  setActiveView: (activeView: AppView) => void;
  setAnalysisResult: (analysisResult: AnalysisResult | null) => void;
  setJobId: (jobId: string | null) => void;
  setJobErrorMessage: (jobErrorMessage: string | null) => void;
  setParsedPreview: (parsedPreview: ParsedFilePreview | null) => void;
  setJobResult: (jobResult: JobResult | null) => void;
  setStatus: (status: AnalysisStatus) => void;
  setUploadedFile: (uploadedFile: File | null) => void;
  toggleDarkMode: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  activeView: "upload",
  analysisResult: null,
  hasApiConnection: false,
  isDarkMode: false,
  downloadHistory: [],
  jobErrorMessage: null,
  jobId: null,
  jobResult: null,
  parsedPreview: null,
  status: "idle",
  uploadedFile: null,
  addDownloadRecord: (downloadRecord) => set((state) => ({
    downloadHistory: [downloadRecord, ...state.downloadHistory].slice(0, MAX_DOWNLOAD_HISTORY_ITEMS),
  })),
  setApiConnection: (hasApiConnection) => set({ hasApiConnection }),
  setActiveView: (activeView) => set({ activeView }),
  setAnalysisResult: (analysisResult) => set({ analysisResult }),
  setJobId: (jobId) => set({ jobId }),
  setJobErrorMessage: (jobErrorMessage) => set({ jobErrorMessage }),
  setParsedPreview: (parsedPreview) => set({ parsedPreview }),
  setJobResult: (jobResult) => set({ jobResult }),
  setStatus: (status) => set({ status }),
  setUploadedFile: (uploadedFile) => set({ uploadedFile }),
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
}));
