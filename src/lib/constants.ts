export const ENGINEER = {
  fullName: "Md. Tanbir Hasan",
  shortName: "Tanbir Hasan",
  brandName: "TANBIR HASAN",
  title: "Mechanical Design & CAE Engineer",
  brandSubtitle: "Mechanical Design & CAE",
  email: "tanbirhasan.mail@gmail.com",
  linkedin: "https://www.linkedin.com/in/tanbir-hasan",
  academicBackground: "Industrial & Production Engineering",
} as const;

export const PUBLIC_NAV = [
  { href: "/work", label: "Work" },
  { href: "/work?category=cfd", label: "Simulation" },
  { href: "/research", label: "Research" },
  { href: "/credentials", label: "Credentials" },
  { href: "/about", label: "About" },
] as const;

export const PUBLIC_ACTIONS = [
  { href: "/cv", label: "Download CV" },
  { href: "/contact", label: "Quick Contact" },
] as const;

export const ADMIN_NAV = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/research", label: "Research" },
  { href: "/admin/credentials", label: "Credentials" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/files", label: "Files" },
  { href: "/admin/profile", label: "Profile" },
  { href: "/admin/settings", label: "Settings" },
] as const;

export const WORK_FILTERS = [
  { value: "all", label: "All" },
  { value: "cad", label: "CAD" },
  { value: "cfd", label: "CFD" },
  { value: "fea", label: "FEA" },
  { value: "robotics", label: "Robotics & Projects" },
  { value: "computational", label: "Computational Engineering" },
] as const;

export const CATEGORY_LABELS: Record<string, string> = {
  cad: "CAD",
  cfd: "CFD",
  fea: "FEA",
  robotics: "Robotics & Projects",
  computational: "Computational Engineering",
};

export const STATUS_LABELS: Record<string, string> = {
  idea: "Idea",
  design: "Design",
  simulation: "Simulation",
  prototype: "Prototype",
  testing: "Testing",
  ongoing: "Ongoing",
  completed: "Completed",
};

export const SOFTWARE_FILTERS = [
  "SolidWorks",
  "ANSYS Fluent",
  "ANSYS Mechanical",
  "Python",
  "Arduino",
] as const;
