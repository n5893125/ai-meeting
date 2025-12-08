export enum PracticeLevel {
  Beginner = "<1000字 (台灣小學生程度)",
  Elementary = "1000字級別",
  Intermediate = "2000字級別",
  UpperIntermediate = "3000字級別",
  Advanced = "4000字級別",
}

export enum PracticeTheme {
  Life = "生活",
  Business = "商業",
  Travel = "旅遊",
  Culture = "文化與社會",
  Academic = "學術",
}

export enum PracticeDuration {
  Short = "15分鐘",
  Medium = "25分鐘",
  Long = "30分鐘",
}

export interface PracticeSettings {
  level: PracticeLevel;
  theme: PracticeTheme;
  duration: PracticeDuration;
}

export interface DialogueLine {
  speaker: 'A' | 'B';
  english: string;
  chinese?: string;
  feedback?: string; // For speaker 'B', this will hold feedback from the AI
}