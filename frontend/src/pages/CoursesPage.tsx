import { useEffect, useMemo, useState } from 'react'
import { BookOpen, Filter, Plus, Search, Trash2, Pencil } from 'lucide-react'
import { createCourse, deleteCourse, getCourses, updateCourse } from '../api'
import { useAuth } from '../auth'
import { Course } from '../types'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'

type FormState = { title: string; description: string; level: string }

export default function CoursesPage() {
  const { token, user } = useAuth()
  const isTeacher = user?.role === 'teacher'
  const [items, setItems] = useState<Course[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Course | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null)
  const [form, setForm] = useState<FormState>({ title: '', description: '', level: '' })

  const load = async () => {
    if (!token) return
    setLoading(true)
    const data = await getCourses(token)
    setItems(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [token])

  const filtered = useMemo(
    () => items.filter((c) => [c.title, c.description ?? '', c.level ?? ''].join(' ').toLowerCase().includes(query.toLowerCase())),
    [items, query]
  )

  const openCreate = () => {
    setEditing(null)
    setForm({ title: '', description: '', level: '' })
    setOpen(true)
  }

  const openEdit = (course: Course) => {
    setEditing(course)
    setForm({ title: course.title, description: course.description ?? '', level: course.level ?? '' })
    setOpen(true)
  }

  const save = async () => {
    if (!token) return
    if (!form.title.trim()) return
    if (editing) {
      await updateCourse(token, editing.id, {
        title: form.title,
        description: form.description,
        level: form.level,
      })
    } else {
      await createCourse(token, {
        title: form.title,
        description: form.description,
        level: form.level,
      })
    }
    setOpen(false)
    await load()
  }

  const remove = async () => {
    if (!token || !deleteTarget) return
    await deleteCourse(token, deleteTarget.id)
    setDeleteTarget(null)
    await load()
  }

  return (
    <div className="page-stack">
      <section className="panel-card">
        <div className="panel-head">
          <div>
            <h3>Courses</h3>
            <p className="muted">Academic programs and learning tracks.</p>
          </div>
          {isTeacher ? <button className="primary-btn" onClick={openCreate}><Plus size={16} /> Add course</button> : null}
        </div>

        <div className="toolbar">
          <div className="search-box"><Search size={16} /><input placeholder="Search courses..." value={query} onChange={(e) => setQuery(e.target.value)} /></div>
          <button className="secondary-btn"><Filter size={16} /> Filter</button>
        </div>

        {loading ? <div className="skeleton-grid compact"><div className="skeleton-card" /><div className="skeleton-card" /></div> : (
          <div className="cards-grid">
            {filtered.map((c) => (
              <article className="course-card" key={c.id}>
                <div className="course-head">
                  <div className="course-icon"><BookOpen size={18} /></div>
                  <span className="chip">{c.level ?? 'General'}</span>
                </div>
                <h4>{c.title}</h4>
                <p>{c.description ?? 'No description provided.'}</p>
                <div className="card-foot">
                  <small>{new Date(c.created_at).toLocaleDateString()}</small>
                  {isTeacher ? (
                    <div className="row-actions">
                      <button className="icon-btn" onClick={() => openEdit(c)}><Pencil size={16} /></button>
                      <button className="icon-btn danger" onClick={() => setDeleteTarget(c)}><Trash2 size={16} /></button>
                    </div>
                  ) : <span className="chip">Read only</span>}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <Modal
        open={open}
        title={editing ? 'Edit course' : 'Add course'}
        onClose={() => setOpen(false)}
        footer={<button className="primary-btn" onClick={save}>{editing ? 'Save changes' : 'Create course'}</button>}
      >
        <div className="form-grid">
          <label>Title<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
          <label>Level<input value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} /></label>
          <label className="full">Description<textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete course?"
        message={`This will remove ${deleteTarget?.title ?? 'the selected course'} and its related data.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={remove}
      />
    </div>
  )
}
