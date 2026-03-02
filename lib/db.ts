import { db } from './firebase';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { Question } from '@/types';

// Generate a random share code
function generateShareCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Database quiz type (snake_case as stored in Firestore)
interface DbQuiz {
  id: string;
  user_id: string;
  title: string;
  subject: string;
  source_type: 'text' | 'pdf' | 'youtube';
  source_content: string;
  questions: Question[];
  difficulty?: 'easy' | 'medium' | 'hard';
  timer_mode?: 'none' | 'quiz' | 'question';
  time_limit?: number;
  created_at: string;
  share_code?: string;
  is_public?: boolean;
}

// Database attempt type (snake_case as stored in Firestore)
interface DbAttempt {
  id: string;
  quiz_id: string;
  user_id: string;
  score: number;
  total_questions: number;
  answers: Record<string, string>;
  completed_at: string;
}

// Collection references
const quizzesCollection = collection(db, 'quizzes');
const attemptsCollection = collection(db, 'attempts');

// Quiz operations
export async function createQuiz(data: {
  userId: string;
  title: string;
  subject: string;
  sourceType: 'text' | 'pdf' | 'youtube';
  sourceContent: string;
  questions: Question[];
  difficulty?: 'easy' | 'medium' | 'hard';
  timerMode?: 'none' | 'quiz' | 'question';
  timeLimit?: number;
}) {
  try {
    const docRef = await addDoc(quizzesCollection, {
      user_id: data.userId,
      title: data.title,
      subject: data.subject,
      source_type: data.sourceType,
      source_content: data.sourceContent,
      questions: data.questions,
      difficulty: data.difficulty || 'medium',
      timer_mode: data.timerMode || 'none',
      time_limit: data.timeLimit ?? 10,
      created_at: Timestamp.now(),
    });

    // Return the created quiz with its ID
    return {
      id: docRef.id,
      user_id: data.userId,
      title: data.title,
      subject: data.subject,
      source_type: data.sourceType,
      source_content: data.sourceContent,
      questions: data.questions,
      difficulty: data.difficulty || 'medium',
      timer_mode: data.timerMode || 'none',
      time_limit: data.timeLimit ?? 10,
      created_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error in createQuiz:", error);
    throw error;
  }
}

export async function getQuizzesByUser(userId: string): Promise<DbQuiz[]> {
  try {
    // Try with orderBy first (requires composite index)
    const q = query(
      quizzesCollection,
      where('user_id', '==', userId),
      orderBy('created_at', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        user_id: data.user_id,
        title: data.title,
        subject: data.subject,
        source_type: data.source_type,
        source_content: data.source_content,
        questions: data.questions,
        difficulty: data.difficulty,
        timer_mode: data.timer_mode,
        time_limit: data.time_limit,
        created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at,
      };
    });
  } catch (error: unknown) {
    // If composite index is missing, fall back to simple query and sort client-side
    console.warn('Composite index may be missing, falling back to client-side sorting:', error);
    
    const q = query(
      quizzesCollection,
      where('user_id', '==', userId)
    );

    const snapshot = await getDocs(q);
    const quizzes = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        user_id: data.user_id,
        title: data.title,
        subject: data.subject,
        source_type: data.source_type,
        source_content: data.source_content,
        questions: data.questions,
        difficulty: data.difficulty,
        timer_mode: data.timer_mode,
        time_limit: data.time_limit,
        created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at,
      };
    });
    
    // Sort client-side by created_at descending
    return quizzes.sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });
  }
}

export async function getQuizById(quizId: string): Promise<DbQuiz | null> {
  const docRef = doc(db, 'quizzes', quizId);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();
  return {
    id: snapshot.id,
    user_id: data.user_id,
    title: data.title,
    subject: data.subject,
    source_type: data.source_type,
    source_content: data.source_content,
    questions: data.questions,
    difficulty: data.difficulty,
    timer_mode: data.timer_mode,
    time_limit: data.time_limit,
    created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at,
  };
}

export async function deleteQuiz(quizId: string) {
  const docRef = doc(db, 'quizzes', quizId);
  await deleteDoc(docRef);
}

// Attempt operations
export async function createAttempt(data: {
  quizId: string;
  userId: string;
  score: number;
  totalQuestions: number;
  answers: Record<string, string>;
}) {
  const docRef = await addDoc(attemptsCollection, {
    quiz_id: data.quizId,
    user_id: data.userId,
    score: data.score,
    total_questions: data.totalQuestions,
    answers: data.answers,
    completed_at: Timestamp.now(),
  });

  return {
    id: docRef.id,
    quiz_id: data.quizId,
    user_id: data.userId,
    score: data.score,
    total_questions: data.totalQuestions,
    answers: data.answers,
    completed_at: new Date().toISOString(),
  };
}

export async function getAttemptsByQuiz(quizId: string): Promise<DbAttempt[]> {
  try {
    const q = query(
      attemptsCollection,
      where('quiz_id', '==', quizId),
      orderBy('completed_at', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        quiz_id: data.quiz_id,
        user_id: data.user_id,
        score: data.score,
        total_questions: data.total_questions,
        answers: data.answers,
        completed_at: data.completed_at?.toDate?.()?.toISOString() || data.completed_at,
      };
    });
  } catch (error: unknown) {
    // Composite index may be missing — fall back to simple query + client-side sort
    console.warn('Composite index missing for attempts, falling back to client-side sort:', error);

    const q = query(
      attemptsCollection,
      where('quiz_id', '==', quizId)
    );

    const snapshot = await getDocs(q);
    const attempts = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        quiz_id: data.quiz_id,
        user_id: data.user_id,
        score: data.score,
        total_questions: data.total_questions,
        answers: data.answers,
        completed_at: data.completed_at?.toDate?.()?.toISOString() || data.completed_at,
      };
    });

    return attempts.sort((a, b) => {
      const dateA = new Date(a.completed_at || 0).getTime();
      const dateB = new Date(b.completed_at || 0).getTime();
      return dateB - dateA;
    });
  }
}

export async function getAttemptsByUser(userId: string): Promise<DbAttempt[]> {
  const q = query(
    attemptsCollection,
    where('user_id', '==', userId),
    orderBy('completed_at', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      quiz_id: data.quiz_id,
      user_id: data.user_id,
      score: data.score,
      total_questions: data.total_questions,
      answers: data.answers,
      completed_at: data.completed_at?.toDate?.()?.toISOString() || data.completed_at,
    };
  });
}

export async function getUserStats(userId: string) {
  // Get total quizzes
  const quizzesQuery = query(quizzesCollection, where('user_id', '==', userId));
  const quizzesSnapshot = await getDocs(quizzesQuery);
  const totalQuizzes = quizzesSnapshot.size;

  // Get attempts and calculate stats
  const attemptsQuery = query(attemptsCollection, where('user_id', '==', userId));
  const attemptsSnapshot = await getDocs(attemptsQuery);
  const totalAttempts = attemptsSnapshot.size;

  let bestScore = 0;
  attemptsSnapshot.docs.forEach((doc) => {
    const data = doc.data();
    const percentage = (data.score / data.total_questions) * 100;
    if (percentage > bestScore) {
      bestScore = percentage;
    }
  });

  return {
    totalQuizzes,
    totalAttempts,
    bestScore: Math.round(bestScore),
  };
}

// Share operations
export async function getOrCreateShareCode(quizId: string): Promise<string> {
  const docRef = doc(db, 'quizzes', quizId);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    throw new Error('Quiz not found');
  }

  const data = snapshot.data();
  
  // If share code already exists, return it
  if (data.share_code) {
    return data.share_code;
  }

  // Generate new share code
  const shareCode = generateShareCode();
  
  // Update the quiz with the share code
  await updateDoc(docRef, {
    share_code: shareCode,
    is_public: true,
  });

  return shareCode;
}

export async function getQuizByShareCode(shareCode: string): Promise<DbQuiz | null> {
  const q = query(
    quizzesCollection,
    where('share_code', '==', shareCode)
  );

  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  const data = doc.data();
  
  return {
    id: doc.id,
    user_id: data.user_id,
    title: data.title,
    subject: data.subject,
    source_type: data.source_type,
    source_content: data.source_content,
    questions: data.questions,
    difficulty: data.difficulty,
    timer_mode: data.timer_mode,
    time_limit: data.time_limit,
    created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at,
    share_code: data.share_code,
    is_public: data.is_public,
  };
}

// Create attempt for guest users (shared quizzes)
export async function createGuestAttempt(data: {
  quizId: string;
  guestId: string;
  guestName?: string;
  score: number;
  totalQuestions: number;
  answers: Record<string, string>;
}) {
  const docRef = await addDoc(attemptsCollection, {
    quiz_id: data.quizId,
    user_id: `guest_${data.guestId}`,
    guest_name: data.guestName || 'Anonymous',
    score: data.score,
    total_questions: data.totalQuestions,
    answers: data.answers,
    completed_at: Timestamp.now(),
    is_guest: true,
  });

  return {
    id: docRef.id,
    quiz_id: data.quizId,
    user_id: `guest_${data.guestId}`,
    guest_name: data.guestName || 'Anonymous',
    score: data.score,
    total_questions: data.totalQuestions,
    answers: data.answers,
    completed_at: new Date().toISOString(),
    is_guest: true,
  };
}
