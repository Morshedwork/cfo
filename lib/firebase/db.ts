// Firebase Firestore Database Operations
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  limit,
  Timestamp,
  DocumentData,
  QueryConstraint
} from 'firebase/firestore';
import { db, auth } from './config';
import type { 
  Company, 
  Transaction, 
  Sale, 
  Forecast, 
  AIInsight, 
  DataImport,
  UserProfile 
} from './types';

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  COMPANIES: 'companies',
  TRANSACTIONS: 'transactions',
  SALES: 'sales',
  FORECASTS: 'forecasts',
  AI_INSIGHTS: 'aiInsights',
  DATA_IMPORTS: 'dataImports',
} as const;

// Helper function to get current user ID
export const getCurrentUserId = () => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  return user.uid;
};

// Helper to convert Firestore timestamp to Date
const convertTimestamp = (data: DocumentData) => {
  const converted: any = { ...data };
  Object.keys(converted).forEach(key => {
    if (converted[key] instanceof Timestamp) {
      converted[key] = converted[key].toDate();
    }
  });
  return converted;
};

// ==================== USER PROFILE ====================

export const createUserProfile = async (userId: string, data: Partial<UserProfile>) => {
  const userRef = doc(db, COLLECTIONS.USERS, userId);
  await updateDoc(userRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const userRef = doc(db, COLLECTIONS.USERS, userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return { id: userSnap.id, ...convertTimestamp(userSnap.data()) } as UserProfile;
  }
  return null;
};

export const updateUserProfile = async (userId: string, data: Partial<UserProfile>) => {
  const userRef = doc(db, COLLECTIONS.USERS, userId);
  await updateDoc(userRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
};

// ==================== COMPANIES ====================

export const createCompany = async (data: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => {
  const userId = getCurrentUserId();
  const companiesRef = collection(db, COLLECTIONS.COMPANIES);
  const docRef = await addDoc(companiesRef, {
    ...data,
    userId,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
};

export const getCompanyById = async (companyId: string): Promise<Company | null> => {
  const companyRef = doc(db, COLLECTIONS.COMPANIES, companyId);
  const companySnap = await getDoc(companyRef);
  if (companySnap.exists()) {
    return { id: companySnap.id, ...convertTimestamp(companySnap.data()) } as Company;
  }
  return null;
};

export const getUserCompanies = async (userId?: string): Promise<Company[]> => {
  const uid = userId || getCurrentUserId();
  const companiesRef = collection(db, COLLECTIONS.COMPANIES);
  const q = query(companiesRef, where('userId', '==', uid));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...convertTimestamp(doc.data())
  })) as Company[];
};

export const updateCompany = async (companyId: string, data: Partial<Company>) => {
  const companyRef = doc(db, COLLECTIONS.COMPANIES, companyId);
  await updateDoc(companyRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
};

export const deleteCompany = async (companyId: string) => {
  const companyRef = doc(db, COLLECTIONS.COMPANIES, companyId);
  await deleteDoc(companyRef);
};

// ==================== TRANSACTIONS ====================

export const createTransaction = async (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
  const transactionsRef = collection(db, COLLECTIONS.TRANSACTIONS);
  const docRef = await addDoc(transactionsRef, {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
};

export const getTransactionById = async (transactionId: string): Promise<Transaction | null> => {
  const transactionRef = doc(db, COLLECTIONS.TRANSACTIONS, transactionId);
  const transactionSnap = await getDoc(transactionRef);
  if (transactionSnap.exists()) {
    return { id: transactionSnap.id, ...convertTimestamp(transactionSnap.data()) } as Transaction;
  }
  return null;
};

export const getCompanyTransactions = async (companyId: string, limitCount?: number): Promise<Transaction[]> => {
  const transactionsRef = collection(db, COLLECTIONS.TRANSACTIONS);
  const constraints: QueryConstraint[] = [
    where('companyId', '==', companyId),
    orderBy('date', 'desc')
  ];
  if (limitCount) {
    constraints.push(limit(limitCount));
  }
  const q = query(transactionsRef, ...constraints);
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...convertTimestamp(doc.data())
  })) as Transaction[];
};

export const updateTransaction = async (transactionId: string, data: Partial<Transaction>) => {
  const transactionRef = doc(db, COLLECTIONS.TRANSACTIONS, transactionId);
  await updateDoc(transactionRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
};

export const deleteTransaction = async (transactionId: string) => {
  const transactionRef = doc(db, COLLECTIONS.TRANSACTIONS, transactionId);
  await deleteDoc(transactionRef);
};

// ==================== SALES ====================

export const createSale = async (data: Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>) => {
  const salesRef = collection(db, COLLECTIONS.SALES);
  const docRef = await addDoc(salesRef, {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
};

export const getCompanySales = async (companyId: string, limitCount?: number): Promise<Sale[]> => {
  const salesRef = collection(db, COLLECTIONS.SALES);
  const constraints: QueryConstraint[] = [
    where('companyId', '==', companyId),
    orderBy('date', 'desc')
  ];
  if (limitCount) {
    constraints.push(limit(limitCount));
  }
  const q = query(salesRef, ...constraints);
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...convertTimestamp(doc.data())
  })) as Sale[];
};

export const updateSale = async (saleId: string, data: Partial<Sale>) => {
  const saleRef = doc(db, COLLECTIONS.SALES, saleId);
  await updateDoc(saleRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
};

export const deleteSale = async (saleId: string) => {
  const saleRef = doc(db, COLLECTIONS.SALES, saleId);
  await deleteDoc(saleRef);
};

// ==================== FORECASTS ====================

export const createForecast = async (data: Omit<Forecast, 'id' | 'createdAt' | 'updatedAt'>) => {
  const forecastsRef = collection(db, COLLECTIONS.FORECASTS);
  const docRef = await addDoc(forecastsRef, {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
};

export const getCompanyForecasts = async (companyId: string): Promise<Forecast[]> => {
  const forecastsRef = collection(db, COLLECTIONS.FORECASTS);
  const q = query(forecastsRef, where('companyId', '==', companyId), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...convertTimestamp(doc.data())
  })) as Forecast[];
};

export const updateForecast = async (forecastId: string, data: Partial<Forecast>) => {
  const forecastRef = doc(db, COLLECTIONS.FORECASTS, forecastId);
  await updateDoc(forecastRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
};

export const deleteForecast = async (forecastId: string) => {
  const forecastRef = doc(db, COLLECTIONS.FORECASTS, forecastId);
  await deleteDoc(forecastRef);
};

// ==================== AI INSIGHTS ====================

export const createAIInsight = async (data: Omit<AIInsight, 'id' | 'createdAt'>) => {
  const insightsRef = collection(db, COLLECTIONS.AI_INSIGHTS);
  const docRef = await addDoc(insightsRef, {
    ...data,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

export const getCompanyInsights = async (companyId: string, limitCount?: number): Promise<AIInsight[]> => {
  const insightsRef = collection(db, COLLECTIONS.AI_INSIGHTS);
  const constraints: QueryConstraint[] = [
    where('companyId', '==', companyId),
    orderBy('createdAt', 'desc')
  ];
  if (limitCount) {
    constraints.push(limit(limitCount));
  }
  const q = query(insightsRef, ...constraints);
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...convertTimestamp(doc.data())
  })) as AIInsight[];
};

export const markInsightAsRead = async (insightId: string) => {
  const insightRef = doc(db, COLLECTIONS.AI_INSIGHTS, insightId);
  await updateDoc(insightRef, { isRead: true });
};

export const deleteAIInsight = async (insightId: string) => {
  const insightRef = doc(db, COLLECTIONS.AI_INSIGHTS, insightId);
  await deleteDoc(insightRef);
};

// ==================== DATA IMPORTS ====================

export const createDataImport = async (data: Omit<DataImport, 'id' | 'createdAt'>) => {
  const importsRef = collection(db, COLLECTIONS.DATA_IMPORTS);
  const docRef = await addDoc(importsRef, {
    ...data,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

export const getCompanyImports = async (companyId: string): Promise<DataImport[]> => {
  const importsRef = collection(db, COLLECTIONS.DATA_IMPORTS);
  const q = query(importsRef, where('companyId', '==', companyId), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...convertTimestamp(doc.data())
  })) as DataImport[];
};

