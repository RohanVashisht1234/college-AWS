import { useEffect, useMemo, useState } from 'react'
import { Plus, Search, Filter } from 'lucide-react'
import { createAssignment, getAssignments, getCourses } from '../api'
import { useAuth } from '../auth'
import { Assignment, Course } from '../types'
import Modal from '../components/Modal'

type FormState = { course_id: number | ''; title: string; instructions: string; due_date: string }

export default function AssignmentsPage() {
  const { token, user } = useAuth()
  const isTeacher = user?.role === 'teacher'
  const [items, setItems] = useState<Assignment[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<FormState>({ course_id: '', title: '', instructions: '', due_date: '' })

  const load = async () => {
    if (!token) return
    setLoading(true)
    const [a, c] = await Promise.all([getAssignments(token), getCourses(token)])
    setItems(a)
    setCourses(c)
    setLoading(false)
  }

  useEffect(() => { load() }, [token])

  const filtered = useMemo(
    () => items.filter((a) => [a.title, a.instructions ?? '', a.due_date ?? ''].join(' ').toLowerCase().includes(query.toLowerCase())),
    [items, query]
  )

  const save = async () => {
    if (!token || !form.course_id || !form.title.trim()) return
    await createAssignment(token, {
      course_id: Number(form.course_id),
      title: form.title,
      instructions: form.instructions,
      due_date: form.due_date,
    })
    setOpen(false)
    setForm({ course_id: '', title: '', instructions: '', due_date: '' })
    await load()
  }

  return (
    <div className="page-stack">
      <section className="panel-card">
        <div className="panel-head">
          <div>
            <h3>Assignments</h3>
            <p className="muted">Task tracking for learners and teachers.</p>
          </div>
          {isTeacher ? <button className="primary-btn" onClick={() => setOpen(true)}><Plus size={16} /> Add assignment</button> : null}
        </div>

        <div className="toolbar">
          <div className="search-box"><Search size={16} /><input placeholder="Search assignments..." value={query} onChange={(e) => setQuery(e.target.value)} /></div>
          <button className="secondary-btn"><Filter size={16} /> Filter</button>
        </div>

        {loading ? <div className="skeleton-grid compact"><div className="skeleton-card" /><div className="skeleton-card" /></div> : (
          <div className="cards-grid">
            {filtered.map((a) => {
              const course = courses.find((c) => c.id === a.course_id)
              return (
                <article className="assignment-card" key={a.id}>
                  <div className="chip">Due {a.due_date ?? 'TBD'}</div>
                  <h4>{a.title}</h4>
                  <p>{a.instructions ?? 'No instructions provided.'}</p>
                  <div className="card-foot">
                    <small>{course?.title ?? `Course #${a.course_id}`}</small>
                    <span className="chip">{isTeacher ? 'Manageable' : 'Read only'}</span>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      <Modal
        open={open}
        title="Add assignment"
        onClose={() => setOpen(false)}
        footer={<button className="primary-btn" onClick={save}>Create assignment</button>}
      >
        <div className="form-grid">
          <label>
            Course
            <select value={form.course_id} onChange={(e) => setForm({ ...form, course_id: e.target.value ? Number(e.target.value) : '' })}>
              <option value="">Select a course</option>
              {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
            </select>
          </label>
          <label>Title<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
          <label>Due date<input value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} placeholder="2026-06-30" /></label>
          <label className="full">Instructions<textarea rows={4} value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} /></label>
        </div>
      </Modal>
    </div>
  )
}
