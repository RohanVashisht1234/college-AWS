import os
from datetime import datetime
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, Header, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    create_engine,
    text,
)
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session, declarative_base, relationship, sessionmaker
from sqlalchemy.pool import NullPool

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
APP_NAME = os.getenv("APP_NAME", "TutorBot AI Education Cloud")
ENVIRONMENT = os.getenv("ENVIRONMENT", "production")
SEED_DATA = os.getenv("SEED_DATA", "true").lower() == "true"

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set")

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,
    poolclass=NullPool if DATABASE_URL.startswith("sqlite") else None,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

app = FastAPI(
    title=APP_NAME,
    version="1.0.0",
    description="TutorBot AI Education Cloud backend with mock role login",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ALLOWED_ROLES = {"teacher", "student"}


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False)
    password = Column(String(100), nullable=False)
    role = Column(String(30), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(180), nullable=False, unique=True, index=True)
    grade = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    enrollments = relationship(
        "Enrollment", back_populates="student", cascade="all, delete-orphan"
    )


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(180), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    level = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    enrollments = relationship(
        "Enrollment", back_populates="course", cascade="all, delete-orphan"
    )
    assignments = relationship(
        "Assignment", back_populates="course", cascade="all, delete-orphan"
    )


class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    status = Column(String(30), default="active")
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")


class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    title = Column(String(180), nullable=False)
    instructions = Column(Text, nullable=True)
    due_date = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    course = relationship("Course", back_populates="assignments")


class LoginRequest(BaseModel):
    role: str = Field(..., examples=["teacher", "student"])
    username: str = Field(..., examples=["user"])
    password: str = Field(..., examples=["1234"])


class LoginResponse(BaseModel):
    success: bool
    message: str
    role: str
    username: str
    token: str


class StudentCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: str = Field(min_length=5, max_length=180)
    grade: Optional[str] = Field(default=None, max_length=50)


class StudentUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    grade: Optional[str] = None


class StudentOut(BaseModel):
    id: int
    name: str
    email: str
    grade: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class CourseCreate(BaseModel):
    title: str = Field(min_length=2, max_length=180)
    description: Optional[str] = None
    level: Optional[str] = Field(default=None, max_length=50)


class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    level: Optional[str] = None


class CourseOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    level: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class EnrollmentCreate(BaseModel):
    student_id: int
    course_id: int


class EnrollmentOut(BaseModel):
    id: int
    student_id: int
    course_id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class AssignmentCreate(BaseModel):
    course_id: int
    title: str = Field(min_length=2, max_length=180)
    instructions: Optional[str] = None
    due_date: Optional[str] = None


class AssignmentOut(BaseModel):
    id: int
    course_id: int
    title: str
    instructions: Optional[str] = None
    due_date: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class DashboardOut(BaseModel):
    total_students: int
    total_courses: int
    total_enrollments: int
    total_assignments: int
    active_students: int
    timestamp: datetime


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def require_role(*roles: str):
    def dependency(authorization: Optional[str] = Header(default=None)):
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing bearer token",
            )

        token = authorization.removeprefix("Bearer ").strip()
        parts = token.split(":", 2)

        if len(parts) != 3 or parts[0] != "mock" or parts[1] not in ALLOWED_ROLES:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
            )

        role = parts[1]
        username = parts[2]

        if role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied for this role",
            )

        return {"role": role, "username": username, "token": token}

    return dependency


@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        if SEED_DATA and db.query(User).count() == 0:
            db.add_all(
                [
                    User(username="user", password="1234", role="teacher"),
                    User(username="user", password="1234", role="student"),
                ]
            )

        if SEED_DATA and db.query(Student).count() == 0:
            students = [
                Student(name="Aarav Sharma", email="aarav@example.com", grade="10"),
                Student(name="Diya Patil", email="diya@example.com", grade="11"),
            ]
            courses = [
                Course(
                    title="Mathematics Basics",
                    description="Foundations of algebra and arithmetic",
                    level="Beginner",
                ),
                Course(
                    title="AI for Students",
                    description="Intro to AI tools and study support",
                    level="Intermediate",
                ),
            ]
            db.add_all(students + courses)
            db.commit()

            s1 = db.query(Student).filter_by(email="aarav@example.com").first()
            s2 = db.query(Student).filter_by(email="diya@example.com").first()
            c1 = db.query(Course).filter_by(title="Mathematics Basics").first()
            c2 = db.query(Course).filter_by(title="AI for Students").first()

            db.add_all(
                [
                    Enrollment(student_id=s1.id, course_id=c1.id, status="active"),
                    Enrollment(student_id=s2.id, course_id=c1.id, status="active"),
                    Enrollment(student_id=s2.id, course_id=c2.id, status="active"),
                    Assignment(
                        course_id=c1.id,
                        title="Algebra Worksheet",
                        instructions="Solve all questions",
                        due_date="2026-06-30",
                    ),
                    Assignment(
                        course_id=c2.id,
                        title="AI Reflection",
                        instructions="Write a short summary",
                        due_date="2026-06-30",
                    ),
                ]
            )
            db.commit()

        if SEED_DATA:
            db.commit()
    except SQLAlchemyError:
        db.rollback()
    finally:
        db.close()


@app.get("/")
def root():
    return {
        "service": APP_NAME,
        "status": "running",
        "environment": ENVIRONMENT,
    }


@app.post("/auth/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    role = payload.role.strip().lower()
    username = payload.username.strip()
    password = payload.password.strip()

    if role not in ALLOWED_ROLES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role must be teacher or student",
        )

    if username != "user" or password != "1234":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    user = (
        db.query(User)
        .filter(User.username == username, User.role == role)
        .first()
    )

    if not user:
        user = User(username=username, password=password, role=role)
        db.add(user)
        db.commit()
        db.refresh(user)

    token = f"mock:{role}:{username}"

    return LoginResponse(
        success=True,
        message="Login successful",
        role=role,
        username=username,
        token=token,
    )


@app.get("/auth/me")
def me(current=Depends(require_role("teacher", "student"))):
    return {
        "username": current["username"],
        "role": current["role"],
        "token": current["token"],
    }


@app.get("/health")
def health(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        db_ok = True
    except Exception:
        db_ok = False

    return {
        "status": "ok" if db_ok else "degraded",
        "database": "connected" if db_ok else "unreachable",
        "timestamp": datetime.utcnow(),
    }


@app.get("/ready")
def ready():
    return {"status": "ready"}


@app.get("/version")
def version():
    return {
        "application": APP_NAME,
        "version": "1.0.0",
        "environment": ENVIRONMENT,
    }


@app.get("/metrics")
def metrics(db: Session = Depends(get_db)):
    return {
        "cpu_ready": True,
        "active_users": db.query(Student).count(),
        "courses": db.query(Course).count(),
        "enrollments": db.query(Enrollment).count(),
        "assignments": db.query(Assignment).count(),
        "timestamp": datetime.utcnow(),
    }


@app.get("/dashboard", response_model=DashboardOut)
def dashboard(current=Depends(require_role("teacher")) , db: Session = Depends(get_db)):
    total_students = db.query(Student).count()
    total_courses = db.query(Course).count()
    total_enrollments = db.query(Enrollment).count()
    total_assignments = db.query(Assignment).count()
    active_students = db.query(Enrollment.student_id).distinct().count()

    return DashboardOut(
        total_students=total_students,
        total_courses=total_courses,
        total_enrollments=total_enrollments,
        total_assignments=total_assignments,
        active_students=active_students,
        timestamp=datetime.utcnow(),
    )


@app.get("/students", response_model=List[StudentOut])
def list_students(
    current=Depends(require_role("teacher", "student")),
    db: Session = Depends(get_db),
):
    return db.query(Student).order_by(Student.id.asc()).all()


@app.post("/students", response_model=StudentOut, status_code=status.HTTP_201_CREATED)
def create_student(
    payload: StudentCreate,
    current=Depends(require_role("teacher")),
    db: Session = Depends(get_db),
):
    exists = db.query(Student).filter(Student.email == payload.email).first()
    if exists:
        raise HTTPException(status_code=400, detail="Student email already exists")

    student = Student(name=payload.name, email=payload.email, grade=payload.grade)
    db.add(student)
    db.commit()
    db.refresh(student)
    return student


@app.get("/students/{student_id}", response_model=StudentOut)
def get_student(
    student_id: int,
    current=Depends(require_role("teacher", "student")),
    db: Session = Depends(get_db),
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


@app.put("/students/{student_id}", response_model=StudentOut)
def update_student(
    student_id: int,
    payload: StudentUpdate,
    current=Depends(require_role("teacher")),
    db: Session = Depends(get_db),
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    if payload.name is not None:
        student.name = payload.name
    if payload.email is not None:
        student.email = payload.email
    if payload.grade is not None:
        student.grade = payload.grade

    db.commit()
    db.refresh(student)
    return student


@app.delete("/students/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student(
    student_id: int,
    current=Depends(require_role("teacher")),
    db: Session = Depends(get_db),
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    db.delete(student)
    db.commit()
    return None


@app.get("/courses", response_model=List[CourseOut])
def list_courses(
    current=Depends(require_role("teacher", "student")),
    db: Session = Depends(get_db),
):
    return db.query(Course).order_by(Course.id.asc()).all()


@app.post("/courses", response_model=CourseOut, status_code=status.HTTP_201_CREATED)
def create_course(
    payload: CourseCreate,
    current=Depends(require_role("teacher")),
    db: Session = Depends(get_db),
):
    exists = db.query(Course).filter(Course.title == payload.title).first()
    if exists:
        raise HTTPException(status_code=400, detail="Course title already exists")

    course = Course(
        title=payload.title, description=payload.description, level=payload.level
    )
    db.add(course)
    db.commit()
    db.refresh(course)
    return course


@app.get("/courses/{course_id}", response_model=CourseOut)
def get_course(
    course_id: int,
    current=Depends(require_role("teacher", "student")),
    db: Session = Depends(get_db),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


@app.put("/courses/{course_id}", response_model=CourseOut)
def update_course(
    course_id: int,
    payload: CourseUpdate,
    current=Depends(require_role("teacher")),
    db: Session = Depends(get_db),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    if payload.title is not None:
        course.title = payload.title
    if payload.description is not None:
        course.description = payload.description
    if payload.level is not None:
        course.level = payload.level

    db.commit()
    db.refresh(course)
    return course


@app.delete("/courses/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_course(
    course_id: int,
    current=Depends(require_role("teacher")),
    db: Session = Depends(get_db),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    db.delete(course)
    db.commit()
    return None


@app.get("/assignments", response_model=List[AssignmentOut])
def list_assignments(
    current=Depends(require_role("teacher", "student")),
    db: Session = Depends(get_db),
):
    return db.query(Assignment).order_by(Assignment.id.asc()).all()


@app.post(
    "/assignments", response_model=AssignmentOut, status_code=status.HTTP_201_CREATED
)
def create_assignment(
    payload: AssignmentCreate,
    current=Depends(require_role("teacher")),
    db: Session = Depends(get_db),
):
    course = db.query(Course).filter(Course.id == payload.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    assignment = Assignment(
        course_id=payload.course_id,
        title=payload.title,
        instructions=payload.instructions,
        due_date=payload.due_date,
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return assignment


@app.post(
    "/enrollments", response_model=EnrollmentOut, status_code=status.HTTP_201_CREATED
)
def create_enrollment(
    payload: EnrollmentCreate,
    current=Depends(require_role("teacher")),
    db: Session = Depends(get_db),
):
    student = db.query(Student).filter(Student.id == payload.student_id).first()
    course = db.query(Course).filter(Course.id == payload.course_id).first()

    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    exists = (
        db.query(Enrollment)
        .filter(
            Enrollment.student_id == payload.student_id,
            Enrollment.course_id == payload.course_id,
        )
        .first()
    )
    if exists:
        raise HTTPException(status_code=400, detail="Enrollment already exists")

    enrollment = Enrollment(
        student_id=payload.student_id, course_id=payload.course_id, status="active"
    )
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    return enrollment


@app.get("/reports/summary")
def report_summary(
    current=Depends(require_role("teacher")),
    db: Session = Depends(get_db),
):
    return {
        "students": db.query(Student).count(),
        "courses": db.query(Course).count(),
        "enrollments": db.query(Enrollment).count(),
        "assignments": db.query(Assignment).count(),
        "generated_at": datetime.utcnow(),
    }


@app.exception_handler(SQLAlchemyError)
async def db_error_handler(_, exc):
    return {
        "detail": "Database error"
    }
