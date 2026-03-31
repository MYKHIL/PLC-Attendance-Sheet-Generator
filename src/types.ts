export interface MeetingWeek {
  weekNum: number;
  date: string;
  topic: string;
  shuffledTeachers: string[];
}

export interface PLCState {
  header: string;
  subheader: string;
  term: string;
  venue: string;
  reopeningDate: string;
  teachers: string[];
  weeksData: MeetingWeek[];
  signatures: Record<string, string>; // name -> base64
  sheetsPerPage: 1 | 2 | 4;
  teachersRaw: string;
  weekCount: string;
}

export type Step = 'identity' | 'schedule' | 'preview';
