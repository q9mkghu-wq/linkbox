'use client'
import { useState, useEffect, useRef } from 'react'
import {
  Category, LinkItem,
  subscribeCategories, subscribeLinks,
  addCategory, deleteCategory, updateCategory,
  addLink, deleteLink, updateLink,
  getYoutubeId, getThumbnail,
} from '@/lib/firebase'
import styles from './page.module.css'

// ── Category colors ────────────────────────────────────────────────────────
const PRESET_COLORS = [
  '#ef4444','#f97316','#eab308','#22c55e',
  '#06b6d4','#6366f1','#ec4899','#8b5cf6',
]

// ── Main Page ──────────────────────────────────────────────────────────────
export default function Home() {
  const [cats, setCats] = useState<Category[]>([])
  const [links, setLinks] = useState<LinkItem[]>([])
  const [activeId, setActiveId] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<null | 'addCat' | 'addLink' | 'editLink' | 'editCat'>(null)
  const [editTarget, setEditTarget] = useState<LinkItem | Category | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const u1 = subscribeCategories(c => { setCats(c); setLoading(false) })
    const u2 = subscribeLinks(setLinks)
    return () => { u1(); u2() }
  }, [])

  const filtered = links.filter(l => {
    const matchCat = activeId === 'all' || l.categoryId === activeId
    const matchSearch = !search || l.title.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>▶</span>
          <span className={styles.logoText}>LinkBox</span>
        </div>

        <nav className={styles.nav}>
          <button
            className={`${styles.catBtn} ${activeId === 'all' ? styles.catBtnActive : ''}`}
            onClick={() => setActiveId('all')}
          >
            <span className={styles.catDot} style={{ background: '#888' }} />
            <span className={styles.catName}>전체</span>
            <span className={styles.catCount}>{links.length}</span>
          </button>

          {cats.map(c => (
            <div key={c.id} className={styles.catItem}>
              <button
                className={`${styles.catBtn} ${activeId === c.id ? styles.catBtnActive : ''}`}
                onClick={() => setActiveId(c.id)}
              >
                <span className={styles.catDot} style={{ background: c.color }} />
                <span className={styles.catName}>{c.name}</span>
                <span className={styles.catCount}>{links.filter(l => l.categoryId === c.id).length}</span>
              </button>
              <button className={styles.catEditBtn} onClick={() => { setEditTarget(c); setModal('editCat') }} title="편집">⋯</button>
            </div>
          ))}
        </nav>

        <button className={styles.addCatBtn} onClick={() => setModal('addCat')}>
          + 분류 추가
        </button>
      </aside>

      {/* Main */}
      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.pageTitle}>
              {activeId === 'all' ? '전체' : cats.find(c => c.id === activeId)?.name || ''}
            </h1>
            <span className={styles.linkCount}>{filtered.length}개</span>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.searchWrap}>
              <span className={styles.searchIcon}>🔍</span>
              <input
                className={styles.searchInput}
                placeholder="검색..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button className={styles.addBtn} onClick={() => setModal('addLink')}>
              + 링크 추가
            </button>
          </div>
        </header>

        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <p>Firebase 연결 중...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📭</div>
            <p>{search ? '검색 결과가 없어요' : '저장된 링크가 없어요'}</p>
            <button className={styles.addBtn} onClick={() => setModal('addLink')}>첫 링크 추가하기</button>
          </div>
        ) : (
          <div className={styles.grid}>
            {filtered.map(link => (
              <LinkCard
                key={link.id}
                link={link}
                catColor={cats.find(c => c.id === link.categoryId)?.color || '#888'}
                onEdit={() => { setEditTarget(link); setModal('editLink') }}
                onDelete={() => { if (confirm('삭제할까요?')) deleteLink(link.id) }}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      {modal === 'addCat' && (
        <Modal title="분류 추가" onClose={() => setModal(null)}>
          <AddCategoryForm onDone={() => setModal(null)} />
        </Modal>
      )}
      {modal === 'editCat' && editTarget && 'color' in editTarget && (
        <Modal title="분류 편집" onClose={() => setModal(null)}>
          <EditCategoryForm cat={editTarget as Category} onDone={() => setModal(null)} />
        </Modal>
      )}
      {modal === 'addLink' && (
        <Modal title="링크 추가" onClose={() => setModal(null)}>
          <LinkForm cats={cats} defaultCatId={activeId !== 'all' ? activeId : undefined} onDone={() => setModal(null)} />
        </Modal>
      )}
      {modal === 'editLink' && editTarget && 'url' in editTarget && (
        <Modal title="링크 편집" onClose={() => setModal(null)}>
          <LinkForm cats={cats} editTarget={editTarget as LinkItem} onDone={() => setModal(null)} />
        </Modal>
      )}
    </div>
  )
}

// ── Link Card ──────────────────────────────────────────────────────────────
function LinkCard({ link, catColor, onEdit, onDelete }: {
  link: LinkItem
  catColor: string
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className={styles.card}>
      <a href={link.url} target="_blank" rel="noopener noreferrer" className={styles.cardThumbLink}>
        <div className={styles.cardThumb}>
          {link.thumbnail ? (
            <img src={link.thumbnail} alt={link.title} className={styles.thumbImg} />
          ) : (
            <div className={styles.thumbFallback}>
              <span className={styles.playIcon}>▶</span>
            </div>
          )}
          <div className={styles.thumbOverlay}>
            <span className={styles.playBadge}>▶ 열기</span>
          </div>
        </div>
      </a>
      <div className={styles.cardBody}>
        <p className={styles.cardTitle}>{link.title}</p>
        <div className={styles.cardMeta}>
          <span className={styles.cardCat} style={{ borderColor: catColor, color: catColor }}>
            {link.categoryName}
          </span>
          <div className={styles.cardActions}>
            <button className={styles.iconBtn} onClick={onEdit} title="편집">✏</button>
            <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={onDelete} title="삭제">✕</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Modal ──────────────────────────────────────────────────────────────────
function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className={styles.overlay} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{title}</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div className={styles.modalBody}>{children}</div>
      </div>
    </div>
  )
}

// ── Add Category Form ──────────────────────────────────────────────────────
function AddCategoryForm({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(PRESET_COLORS[0])
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    if (!name.trim()) return
    setSaving(true)
    await addCategory(name.trim(), color)
    onDone()
  }

  return (
    <div className={styles.form}>
      <label className={styles.label}>분류 이름</label>
      <input className={styles.input} placeholder="예: 요리, 여행, IT..." value={name} onChange={e => setName(e.target.value)} autoFocus />
      <label className={styles.label} style={{ marginTop: 12 }}>색상</label>
      <div className={styles.colorPicker}>
        {PRESET_COLORS.map(c => (
          <button key={c} className={`${styles.colorSwatch} ${color === c ? styles.colorSwatchActive : ''}`}
            style={{ background: c }} onClick={() => setColor(c)} />
        ))}
      </div>
      <div className={styles.formFooter}>
        <button className={styles.cancelBtn} onClick={onDone}>취소</button>
        <button className={styles.saveBtn} onClick={submit} disabled={saving || !name.trim()}>
          {saving ? '추가 중...' : '추가'}
        </button>
      </div>
    </div>
  )
}

// ── Edit Category Form ─────────────────────────────────────────────────────
function EditCategoryForm({ cat, onDone }: { cat: Category; onDone: () => void }) {
  const [name, setName] = useState(cat.name)
  const [color, setColor] = useState(cat.color)
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    setSaving(true)
    await updateCategory(cat.id, { name: name.trim(), color })
    onDone()
  }

  const handleDelete = async () => {
    if (!confirm(`"${cat.name}" 분류와 이 분류의 모든 링크를 삭제할까요?`)) return
    await deleteCategory(cat.id)
    onDone()
  }

  return (
    <div className={styles.form}>
      <label className={styles.label}>분류 이름</label>
      <input className={styles.input} value={name} onChange={e => setName(e.target.value)} autoFocus />
      <label className={styles.label} style={{ marginTop: 12 }}>색상</label>
      <div className={styles.colorPicker}>
        {PRESET_COLORS.map(c => (
          <button key={c} className={`${styles.colorSwatch} ${color === c ? styles.colorSwatchActive : ''}`}
            style={{ background: c }} onClick={() => setColor(c)} />
        ))}
      </div>
      <div className={styles.formFooter}>
        <button className={`${styles.cancelBtn} ${styles.dangerBtn}`} onClick={handleDelete}>삭제</button>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className={styles.cancelBtn} onClick={onDone}>취소</button>
          <button className={styles.saveBtn} onClick={submit} disabled={saving}>저장</button>
        </div>
      </div>
    </div>
  )
}

// ── Link Form ──────────────────────────────────────────────────────────────
function LinkForm({ cats, editTarget, defaultCatId, onDone }: {
  cats: Category[]
  editTarget?: LinkItem
  defaultCatId?: string
  onDone: () => void
}) {
  const [url, setUrl] = useState(editTarget?.url || '')
  const [title, setTitle] = useState(editTarget?.title || '')
  const [catId, setCatId] = useState(editTarget?.categoryId || defaultCatId || cats[0]?.id || '')
  const [thumb, setThumb] = useState<string | null>(editTarget?.thumbnail || null)
  const [saving, setSaving] = useState(false)

  const handleUrlChange = (val: string) => {
    setUrl(val)
    const t = getThumbnail(val)
    setThumb(t)
    if (!title && t) {
      const id = getYoutubeId(val)
      if (id) setTitle(`유튜브 동영상`)
    }
  }

  const submit = async () => {
    if (!url.trim() || !title.trim() || !catId) return
    setSaving(true)
    const cat = cats.find(c => c.id === catId)
    const payload = {
      url: url.trim(),
      title: title.trim(),
      categoryId: catId,
      categoryName: cat?.name || '',
      thumbnail: getThumbnail(url.trim()),
      videoId: getYoutubeId(url.trim()),
    }
    if (editTarget) {
      await updateLink(editTarget.id, payload)
    } else {
      await addLink(payload)
    }
    onDone()
  }

  return (
    <div className={styles.form}>
      <label className={styles.label}>유튜브 URL</label>
      <input
        className={styles.input}
        placeholder="https://youtube.com/watch?v=..."
        value={url}
        onChange={e => handleUrlChange(e.target.value)}
        autoFocus
      />
      {thumb && (
        <div className={styles.previewWrap}>
          <img src={thumb} alt="미리보기" className={styles.previewThumb} />
          <div className={styles.previewPlay}>▶</div>
        </div>
      )}
      <label className={styles.label} style={{ marginTop: 12 }}>제목</label>
      <input className={styles.input} placeholder="저장할 이름" value={title} onChange={e => setTitle(e.target.value)} />
      <label className={styles.label} style={{ marginTop: 12 }}>분류</label>
      {cats.length === 0 ? (
        <p className={styles.hint}>먼저 분류를 추가하세요</p>
      ) : (
        <select className={styles.select} value={catId} onChange={e => setCatId(e.target.value)}>
          {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      )}
      <div className={styles.formFooter}>
        <button className={styles.cancelBtn} onClick={onDone}>취소</button>
        <button className={styles.saveBtn} onClick={submit} disabled={saving || !url.trim() || !title.trim() || !catId}>
          {saving ? '저장 중...' : editTarget ? '저장' : '추가'}
        </button>
      </div>
    </div>
  )
}
