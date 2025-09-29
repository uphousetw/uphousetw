import { Project, AboutUs } from '../types';

export const defaultProject: Project = {
  slug: "default-project",
  title: "範例建案",
  category: "透天",
  year: 2025,
  location: "台北市中正區",
  summary: "這是一個範例專案，用來測試專案新增與展示功能。",
  coverUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
  facts: {
    地點: "台北市中正區",
    類別: "透天",
    年份: "2025",
    完工日: "2025-12-31"
  },
  body: "這裡是專案內文範例，描述建案特色與亮點。"
};

export const defaultAboutUs: AboutUs = {
  title: "關於我們",
  intro: "美感空間，建設城市願景",
  brandPrinciplesSubtitle: "美感中築夢，品質中紮根",
  principles: ["品質與安全", "準時交付", "透明溝通"],
  milestones: [
    { year: 2019, event: "公司成立" }
  ]
};