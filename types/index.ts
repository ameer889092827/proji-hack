export interface Volunteer {
  id: string;
  name: string;
  skills: string[];
  schedule: string[];
  interests: string[];
  rating: number;
}

export interface Task {
  title: string;
  description: string;
  required_skills: string[];
  required_schedule: string[];
  category: string;
  assignedVolunteerId?: string | null;
}

export interface MatchResult {
  volunteerId: string;
  match_score: number;
  reason: string;
}
