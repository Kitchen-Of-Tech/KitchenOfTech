import { branding } from "./branding";
import { siteSettings } from "./siteSettings";
import { footerSettings } from "./footerSettings";
import { contactPage } from "./contactPage";
import { service } from "./service";
import { serviceCategory } from "./serviceCategory";
import { serviceSubcategory } from "./serviceSubcategory";
import { portfolio } from "./portfolio";
import { testimonial } from "./testimonial";
import { clientLogo } from "./clientLogo";
import { blog } from "./blog";
import { team } from "./team";
import { certificate } from "./certificate";
// Education Platform Schemas
import { instructor } from "./instructor";
import { course } from "./course";
import { module } from "./module";
import { lesson } from "./lesson";
import { quiz } from "./quiz";
import { assignment } from "./assignment";
// Articles/Blog System
import { article } from "./article";
import { articleAuthor } from "./articleAuthor";
import { articleComment } from "./articleComment";
import { articleVote } from "./articleVote";

export const schemaTypes = [
  // Site Configuration
  branding,
  siteSettings,
  footerSettings,
  contactPage,
  // Services
  serviceCategory,
  serviceSubcategory,
  service,
  portfolio,
  // Other
  testimonial,
  clientLogo,
  blog,
  team,
  certificate,
  // Articles System
  article,
  articleAuthor,
  articleComment,
  articleVote,
  // Education
  instructor,
  course,
  module,
  lesson,
  quiz,
  assignment,
];
