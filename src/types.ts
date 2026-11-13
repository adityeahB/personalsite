export interface Project {
  id: string;
  title: string;
  meta: string;
  link: string;
  linkText: string;
  desc: string[];
  image?: string;
  imageAlt?: string;
  badges?: string[];
  highlights?: string[];
  role?: string;
}

export interface ListItem {
  id: string;
  when: string;
  title: string;
  where?: string;
  desc?: string;
  link?: string;
  category?: string;
  tags?: string[];
}

export interface SkillCategory {
  category: string;
  items: string;
}

export interface ThemeOption {
  id: string;
  name: string;
  color: string;
  onColor: string;
}

export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  year: string;
  description?: string;
  image?: string;
  link?: string;
}

export interface Artwork {
  id: string;
  title: string;
  medium?: string;
  year?: string;
  dimensions?: string;
  description?: string;
  image?: string;
}


