export const COURSES = [
  { id: 1, name: 'AI Fundamentals', fullName: 'Course 1: AI Fundamentals', duration: 3, icon: 'fa-brain' },
  { id: 2, name: 'AI for Brainstorming and Planning', fullName: 'Course 2: AI for Brainstorming and Planning', duration: 1, icon: 'fa-lightbulb' },
  { id: 3, name: 'AI for Research and Insights', fullName: 'Course 3: AI for Research and Insights', duration: 1, icon: 'fa-magnifying-glass-chart' },
  { id: 4, name: 'AI for Writing and Communicating', fullName: 'Course 4: AI for Writing and Communicating', duration: 1, icon: 'fa-pen-fancy' },
  { id: 5, name: 'AI for Content Creation', fullName: 'Course 5: AI for Content Creation', duration: 2, icon: 'fa-wand-magic-sparkles' },
  { id: 6, name: 'AI for Data Analysis', fullName: 'Course 6: AI for Data Analysis', duration: 1, icon: 'fa-chart-bar' },
  { id: 7, name: 'AI for App Building', fullName: 'Course 7: AI for App Building', duration: 2, icon: 'fa-code' },
] as const;

export const TOTAL_COURSES = COURSES.length;
export const TOTAL_HOURS = COURSES.reduce((s, c) => s + c.duration, 0);

export const DEPARTMENTS = [
  'ภาษาไทย',
  'คณิตศาสตร์',
  'วิทยาศาสตร์',
  'คอมพิวเตอร์',
  'สังคมศึกษา',
  'ภาษาต่างประเทศ(อังกฤษ)',
  'ภาษาต่างประเทศ(จีน)',
  'การงานอาชีพ',
  'ศิลปะ',
  'สุขศึกษาและพลศึกษา',
  'กิจกรรมพัฒนาผู้เรียน',
  'บุคลากรโรงเรียน',
] as const;

export const POSITIONS = ['ผู้บริหาร', 'ครู', 'บุคลากรทางการศึกษา'] as const;
export const ACADEMIC_LEVELS = ['ไม่มีวิทยฐานะ', 'ชำนาญการ', 'ชำนาญการพิเศษ'] as const;
