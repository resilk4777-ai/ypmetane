export type SegmentState = 'unread' | 'current' | 'read' | 'retry';

export interface TextSegment {
  id: string;
  text: string;
  state: SegmentState;
}

export type ReadingSourceType = 'manual' | 'photo';

export interface ReadingText {
  id: string;
  title: string;
  subject: string;
  page: string;
  body: string;
  sourceType: ReadingSourceType;
  createdAt: string;
  updatedAt: string;
}

export interface ReadingSession {
  id: string;
  readingTextId: string;
  date: string;
  durationSeconds: number;
  completed: boolean;
  progressRate: number;
  readSegments: string[];
  stampIds: string[];
  parentComment: string;
  teacherComment: string;
}
