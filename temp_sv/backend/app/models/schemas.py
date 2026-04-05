from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# User & Auth Models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    university_id: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# Student Profile Models
class StudentProfileBase(BaseModel):
    display_name: Optional[str] = None
    learner_type: Optional[str] = "visual"  # visual, text, example
    theme: Optional[str] = "dark"
    accent_color: Optional[str] = "#6366f1"
    font_preference: Optional[str] = "inter"
    dashboard_layout: Optional[dict] = {}


class StudentProfileCreate(StudentProfileBase):
    user_id: str


class StudentProfileResponse(StudentProfileBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime


# Study Session Models
class StudySessionCreate(BaseModel):
    topic: str
    subject: str
    duration_minutes: int
    retention_score: Optional[float] = None
    anxiety_level: Optional[int] = 5  # 1-10
    notes: Optional[str] = None
    encrypted_data: str  # AES-256 encrypted blob


class StudySessionResponse(BaseModel):
    id: str
    user_id: str
    topic: str
    subject: str
    duration_minutes: int
    retention_score: Optional[float]
    anxiety_level: Optional[int]
    created_at: datetime
    completed_at: Optional[datetime]


# Deep Work Session Models
class DeepWorkSessionCreate(BaseModel):
    topic: str
    duration_minutes: int
    intensity_level: int  # 1-5
    comprehension_score: Optional[int] = None
    cognitive_fatigue: Optional[int] = 5  # 1-10
    encrypted_data: Optional[str] = None


class DeepWorkSessionResponse(BaseModel):
    id: str
    user_id: str
    topic: str
    duration_minutes: int
    intensity_level: int
    comprehension_score: Optional[int]
    cognitive_fatigue: Optional[int]
    started_at: datetime
    completed_at: Optional[datetime]


# Academic Event Models
class AcademicEventCreate(BaseModel):
    title: str
    event_type: str  # exam, assignment, lecture, deadline
    due_date: datetime
    course_code: Optional[str] = None
    encrypted_metadata: str  # Encrypted additional data


class AcademicEventResponse(BaseModel):
    id: str
    user_id: str
    title: str
    event_type: str
    due_date: datetime
    course_code: Optional[str]
    created_at: datetime


# Study Plan Models
class StudyPlanCreate(BaseModel):
    name: str
    target_exam_date: Optional[datetime] = None
    focus_subjects: List[str]
    daily_study_hours: float = 4.0


class StudyPlanResponse(BaseModel):
    id: str
    user_id: str
    name: str
    target_exam_date: Optional[datetime]
    focus_subjects: List[str]
    daily_study_hours: float
    generated_schedule: dict  # JSON schedule
    created_at: datetime
    updated_at: datetime


# University Models
class UniversityCreate(BaseModel):
    name: str
    domain: str
    auth_type: str  # saml, oauth_microsoft, oauth_google, cas, oidc
    lms_type: Optional[str] = None  # canvas, moodle, blackboard
    config: Optional[dict] = {}


class UniversityResponse(BaseModel):
    id: str
    name: str
    domain: str
    auth_type: str
    lms_type: Optional[str]
    created_at: datetime


# Device Pairing Models
class DevicePairingCreate(BaseModel):
    device_name: str
    pairing_code: str  # 6-digit code


class DevicePairingResponse(BaseModel):
    id: str
    user_id: str
    device_name: str
    authorized_at: datetime
    last_sync: Optional[datetime]


# Encrypted Data Models
class EncryptedDataCreate(BaseModel):
    data_type: str  # study_session, deep_work, reflection, event
    encrypted_blob: str
    device_id: str


class EncryptedDataResponse(BaseModel):
    id: str
    user_id: str
    data_type: str
    encrypted_blob: str
    device_id: str
    synced_at: datetime


# Reflection Models
class ReflectionCreate(BaseModel):
    session_id: str
    mood_score: int  # 1-10
    notes: Optional[str] = None
    encrypted_data: Optional[str] = None


class ReflectionResponse(BaseModel):
    id: str
    user_id: str
    session_id: str
    mood_score: int
    notes: Optional[str]
    created_at: datetime


# Admin Models
class RLAgentStats(BaseModel):
    sessions_processed: int
    average_reward: float
    agent_version: str
    last_trained: datetime


class SyncStatus(BaseModel):
    students_synced_today: int
    pending_syncs: int
    failed_syncs: int


class EncryptionHealth(BaseModel):
    vault_connected: bool
    key_rotation_status: str
    keys_in_escrow: int
