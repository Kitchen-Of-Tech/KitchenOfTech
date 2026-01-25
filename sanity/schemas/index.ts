import { branding } from "./branding";
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

export const schemaTypes = [
  branding,
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
  // Education
  instructor,
  course,
  module,
  lesson,
  quiz,
  assignment,
];
