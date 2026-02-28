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
import { Quiz, Attempt, Question } from '@/types';

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
  source_type: 'text' | 'pdf';
  source_content: string;
  questions: Question[];
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
  sourceType: 'text' | 'pdf';
  sourceContent: string;
  questions: Question[];
}) {
  const docRef = await addDoc(quizzesCollection, {
    user_id: data.userId,
    title: data.title,
    subject: data.subject,
    source_type: data.sourceType,
    source_content: data.sourceContent,
    questions: data.questions,
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
    created_at: new Date().toISOString(),
  };
}

export async function getQuizzesByUser(userId: string): Promise<DbQuiz[]> {
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
      created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at,
    };
  });
}

export async function getQuizById(quizId: string): Promise<DbQuiz> {
  const docRef = doc(db, 'quizzes', quizId);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    throw new Error('Quiz not found');
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
