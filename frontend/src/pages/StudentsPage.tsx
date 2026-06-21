import { useEffect, useMemo, useState } from 'react'
import { Filter, Plus, Search, Trash2, Pencil } from 'lucide-react'
import { createStudent, deleteStudent, getStudents, updateStudent } from '../api'
import { useAuth } from '../auth'
import { Student } from '../types'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'

type FormState = { name: string; email: string; grade: string }

export default function StudentsPage() {
  const { token, user } = useAuth()
  const isTeacher = user?.role === 'teacher'
  const [items, setItems] = useState<Student[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Student | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null)
  const [form, setForm] = useState<FormState>({ name: '', email: '', grade: '' })

  const load = async () => {
    if (!token) return
    setLoading(true)
    const data = await getStudents(token)
    setItems(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [token])

  const filtered = useMemo(
    () => items.filter((s) => [s.name, s.email, s.grade ?? ''].join(' ').toLowerCase().includes(query.toLowerCase())),
    [items, query]
  )

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', email: '', grade: '' })
    setOpen(true)
  }

  const openEdit = (student: Student) => {
    setEditing(student)
    setForm({ name: student.name, email: student.email, grade: student.grade ?? '' })
    setOpen(true)
  }

  const save = async () => {
    if (!token) return
    if (!form.name.trim() || !form.email.trim()) return
    if (editing) {
      await updateStudent(token, editing.id, {
        name: form.name,
        email: form.email,
        grade: form.grade || null,
      })
    } else {
      await createStudent(token, {
        name: form.name,
        email: form.email,
        grade: form.grade || null,
      })
    }
    setOpen(false)
    await load()
  }

  const remove = async () => {
    if (!token || !deleteTarget) return
    await deleteStudent(token, deleteTarget.id)
    setDeleteTarget(null)
    await load()
  }

  return (
    <div className="page-stack">
      <section className="panel-card">
        <div className="panel-head">
          <div>
            <h3>Students</h3>
            <p className="muted">Manage student records stored in MySQL.</p>
          </div>
          {isTeacher ? <button className="primary-btn" onClick={openCreate}><Plus size={16} /> Add student</button> : null}
        </div>

        <div className="toolbar">
          <div className="search-box"><Search size={16} /><input placeholder="Search students..." value={query} onChange={(e) => setQuery(e.target.value)} /></div>
          <button className="secondary-btn"><Filter size={16} /> Filter</button>
        </div>

        {loading ? <div className="skeleton-grid compact"><div className="skeleton-card" /><div className="skeleton-card" /></div> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Name</th><th>Email</th><th>Grade</th><th>Created</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td>{s.email}</td>
                    <td>{s.grade ?? '—'}</td>
                    <td>{new Date(s.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="row-actions">
                        {isTeacher ? <>
                          <button className="icon-btn" onClick={() => openEdit(s)}><Pencil size={16} /></button>
                          <button className="icon-btn danger" onClick={() => setDeleteTarget(s)}><Trash2 size={16} /></button>
                        </> : <span className="chip">Read only</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Modal
        open={open}
        title={editing ? 'Edit student' : 'Add student'}
        onClose={() => setOpen(false)}
        footer={<button className="primary-btn" onClick={save}>{editing ? 'Save changes' : 'Create student'}</button>}
      >
        <div className="form-grid">
          <label>Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label>Email<input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
          <label>Grade<input value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} /></label>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete student?"
        message={`This will remove ${deleteTarget?.name ?? 'the selected student'} from the system.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={remove}
      />
    </div>
  )
}
