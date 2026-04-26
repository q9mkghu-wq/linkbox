import { initializeApp, getApps } from 'firebase/app'
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
export const db = getFirestore(app)

// ── Types ──────────────────────────────────────────────────────────────────
export interface Category {
  id: string
  name: string
  color: string
  createdAt: Timestamp
}

export interface LinkItem {
  id: string
  url: string
  title: string
  categoryId: string
  categoryName: string
  thumbnail: string | null
  videoId: string | null
  createdAt: Timestamp
}

// ── Helpers ────────────────────────────────────────────────────────────────
export function getYoutubeId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|[?&]v=|embed\/)([a-zA-Z0-9_-]{11})/)
  return m ? m[1] : null
}

export function getThumbnail(url: string): string | null {
  const id = getYoutubeId(url)
  return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null
}

// ── Category CRUD ──────────────────────────────────────────────────────────
const COLORS = ['#ef4444','#f97316','#eab308','#22c55e','#06b6d4','#6366f1','#ec4899','#8b5cf6']

export async function addCategory(name: string, color?: string) {
  return addDoc(collection(db, 'categories'), {
    name,
    color: color || COLORS[Math.floor(Math.random() * COLORS.length)],
    createdAt: Timestamp.now(),
  })
}

export async function deleteCategory(id: string) {
  return deleteDoc(doc(db, 'categories', id))
}

export async function updateCategory(id: string, data: Partial<Pick<Category, 'name' | 'color'>>) {
  return updateDoc(doc(db, 'categories', id), data)
}

// ── Link CRUD ──────────────────────────────────────────────────────────────
export async function addLink(data: Omit<LinkItem, 'id' | 'createdAt'>) {
  return addDoc(collection(db, 'links'), {
    ...data,
    createdAt: Timestamp.now(),
  })
}

export async function deleteLink(id: string) {
  return deleteDoc(doc(db, 'links', id))
}

export async function updateLink(id: string, data: Partial<Omit<LinkItem, 'id' | 'createdAt'>>) {
  return updateDoc(doc(db, 'links', id), data)
}

// ── Real-time listeners ────────────────────────────────────────────────────
export function subscribeCategories(cb: (cats: Category[]) => void) {
  const q = query(collection(db, 'categories'), orderBy('createdAt', 'asc'))
  return onSnapshot(q, snap =>
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as Category)))
  )
}

export function subscribeLinks(cb: (links: LinkItem[]) => void) {
  const q = query(collection(db, 'links'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, snap =>
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as LinkItem)))
  )
}
