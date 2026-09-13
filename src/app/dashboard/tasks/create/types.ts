export interface AudienceFilter {
  gender: string[];
  employmentStatus: string[];
  educationLevel: string[];
  state: string[];
  minAge: string;
  maxAge: string;
}

export interface ImageEntry {
  file: File;
  preview: string;
}

export interface InstructionPdfEntry {
  fileName: string;
  dataUrl: string;
}
