export type QuestionType = 'mcq' | 'fill_blank' | 'true_false';

export interface Question {
  id: string;
  question: string;
  type: QuestionType;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  orderNumber: number;
}

export interface Quiz {
  id: string;
  userId: string;
  title: string;
  subject: string;
  sourceType: 'text' | 'pdf' | 'youtube';
  sourceContent: string;
  questions: Question[];
  difficulty?: 'easy' | 'medium' | 'hard';
  timerMode?: 'none' | 'quiz' | 'question';
  timeLimit?: number;
  createdAt: string;
}

export interface Attempt {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  totalQuestions: number;
  answers: Record<string, string>;
  completedAt: string;
}

export interface QuizFormData {
  title: string;
  subject: string;
  inputType: 'text' | 'pdf' | 'youtube';
  content: string;
  questionCount: number;
  questionTypes: QuestionType[];
}
