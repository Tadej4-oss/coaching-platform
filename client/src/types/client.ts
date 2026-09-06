export type Client = {
    email: string,
    username: string,
    id: number,
    role: string,
    profile_image_url: string,
    bio: string
}

export type Coach = {
    email: string,
    id: number,
    role: string,
    photo_url: string,
    username: string
}

export type AccountInfo = {
    bio: string,
    username: string,
    display_name: string
}

export type passwordForm = {
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
}

export type programForm = {
    name: string,
    description: string,
    goal: string,
    difficulty: string,
    duration: number,
    daysPerWeek: number
}

export type Exercise = {
    name: string,
    description: string,
    primaryMuscles: String,
    equipment: string,
    videos: {
        url: string
    }[],
    video_url: string,
    overview: string
}

export type Message = {
    content: string,
    sender_id: number,
    username: string,
    email: string
}

export type Program = {
    coach_id: string,
    days_per_week: number,
    description: string,
    difficulty: string,
    duration_weeks: number,
    goal: string,
    id: number,
    name: string,
}

export type ProgramWeeks = {
    id: number,
    name: string,
    program_id: number,
    week_number: number
}

export type WorkoutDay = {
    day_number: number,
    description: string,
    id: number,
    name: string,
    program_week_id: number,
}