# Demo Course Content Creation Guide

This guide provides step-by-step instructions for creating demo courses in Sanity Studio.

## Access Sanity Studio

1. Start your development server: `npm run dev`
2. Navigate to: `http://localhost:3000/studio`
3. Sign in with your Sanity credentials

---

## Course 1: Web Development Fundamentals

### Step 1: Create Instructor (if not exists)

Go to **Content** → **Instructors** → **Create New**

```
Name: Sarah Johnson
Bio: Full-stack developer with 10+ years of experience. Passionate about teaching web development and creating accessible, user-friendly applications.
Email: sarah@kitchenoftech.com
Avatar: [Upload a professional photo or use placeholder]
Social Links:
  - LinkedIn: https://linkedin.com/in/sarahjohnson
  - Twitter: https://twitter.com/sarahcodes
  - Website: https://sarahjohnson.dev
Expertise: ["JavaScript", "React", "Node.js", "HTML/CSS", "Web Development"]
```

### Step 2: Create Lessons

Go to **Content** → **Lessons** → **Create New**

#### Module 1: Introduction to Web Development

**Lesson 1.1: Welcome to Web Development**
```
Title: Welcome to Web Development
Slug: welcome-to-web-development
Description: Introduction to the course and what you'll learn
YouTube Video URL: https://www.youtube.com/watch?v=UB1O30fR-EE
Video ID: UB1O30fR-EE
Duration: 5 (minutes)
Order: 1
Free Preview: true
Notes: "In this lesson, we'll cover the roadmap for the entire course and set expectations for what you'll build by the end."
```

**Lesson 1.2: Setting Up Your Development Environment**
```
Title: Setting Up Your Development Environment
Slug: setup-development-environment
Description: Install VS Code, Node.js, and essential tools
YouTube Video URL: https://www.youtube.com/watch?v=fnpmR6Q5lEc
Video ID: fnpmR6Q5lEc
Duration: 15
Order: 2
Free Preview: true
Notes: "We'll install VS Code, Node.js, Git, and configure essential extensions."
```

**Lesson 1.3: HTML Basics**
```
Title: HTML Basics
Slug: html-basics
Description: Learn HTML structure, tags, and semantic markup
YouTube Video URL: https://www.youtube.com/watch?v=ok-plXXHlWw
Video ID: ok-plXXHlWw
Duration: 20
Order: 3
Free Preview: false
```

**Lesson 1.4: CSS Fundamentals**
```
Title: CSS Fundamentals
Slug: css-fundamentals
Description: Styling with CSS, selectors, and box model
YouTube Video URL: https://www.youtube.com/watch?v=1PnVor36_40
Video ID: 1PnVor36_40
Duration: 25
Order: 4
Free Preview: false
```

#### Module 2: JavaScript Essentials

**Lesson 2.1: JavaScript Variables and Data Types**
```
Title: JavaScript Variables and Data Types
Slug: javascript-variables
Description: Understanding variables, const, let, and data types
YouTube Video URL: https://www.youtube.com/watch?v=edlFjlzxkSI
Video ID: edlFjlzxkSI
Duration: 18
Order: 5
Free Preview: false
```

**Lesson 2.2: Functions and Scope**
```
Title: Functions and Scope
Slug: functions-and-scope
Description: Learn about functions, arrow functions, and scope
YouTube Video URL: https://www.youtube.com/watch?v=iLWTnMzWtj4
Video ID: iLWTnMzWtj4
Duration: 22
Order: 6
Free Preview: false
```

**Lesson 2.3: DOM Manipulation**
```
Title: DOM Manipulation
Slug: dom-manipulation
Description: Interact with web pages using JavaScript
YouTube Video URL: https://www.youtube.com/watch?v=y17RuWkWdn8
Video ID: y17RuWkWdn8
Duration: 30
Order: 7
Free Preview: false
```

#### Module 3: Building Your First Project

**Lesson 3.1: Project Planning**
```
Title: Project Planning
Slug: project-planning
Description: Plan and structure your first web project
YouTube Video URL: https://www.youtube.com/watch?v=gQojMIhELvM
Video ID: gQojMIhELvM
Duration: 12
Order: 8
Free Preview: false
```

**Lesson 3.2: Building a Todo App**
```
Title: Building a Todo App
Slug: building-todo-app
Description: Create a functional todo application
YouTube Video URL: https://www.youtube.com/watch?v=Ttf3CEsEwMQ
Video ID: Ttf3CEsEwMQ
Duration: 35
Order: 9
Free Preview: false
```

**Lesson 3.3: Deployment and Next Steps**
```
Title: Deployment and Next Steps
Slug: deployment-next-steps
Description: Deploy your project and continue your learning journey
YouTube Video URL: https://www.youtube.com/watch?v=BoN0mSatGxI
Video ID: BoN0mSatGxI
Duration: 15
Order: 10
Free Preview: false
```

### Step 3: Create Modules

Go to **Content** → **Modules** → **Create New**

**Module 1:**
```
Title: Introduction to Web Development
Slug: introduction-to-web-development
Description: Get started with web development fundamentals
Order: 1
Lessons: [Select Lesson 1.1, 1.2, 1.3, 1.4]
```

**Module 2:**
```
Title: JavaScript Essentials
Slug: javascript-essentials
Description: Master JavaScript programming basics
Order: 2
Lessons: [Select Lesson 2.1, 2.2, 2.3]
```

**Module 3:**
```
Title: Building Your First Project
Slug: building-first-project
Description: Apply your skills to build a real project
Order: 3
Lessons: [Select Lesson 3.1, 3.2, 3.3]
```

### Step 4: Create Quizzes

Go to **Content** → **Quizzes** → **Create New**

**Quiz 1: HTML & CSS Fundamentals**
```
Title: HTML & CSS Fundamentals Quiz
Description: Test your knowledge of HTML and CSS basics
Passing Score: 70
Time Limit: 15
Max Attempts: 3
Show Correct Answers: true
Randomize Questions: false

Questions:
1. What does HTML stand for?
   Type: Single Choice
   Options: 
     - HyperText Markup Language ✓
     - High Tech Modern Language
     - HyperText Modern Link
     - Home Tool Markup Language
   Correct Answer: HyperText Markup Language
   Explanation: HTML stands for HyperText Markup Language, the standard markup language for web pages.

2. Which CSS property is used to change text color?
   Type: Single Choice
   Options:
     - font-color
     - text-color
     - color ✓
     - foreground-color
   Correct Answer: color
   Explanation: The 'color' property is used to set the text color in CSS.

3. What is the correct HTML for creating a hyperlink?
   Type: Single Choice
   Options:
     - <a href="url">link text</a> ✓
     - <link>url</link>
     - <a url="url">link text</a>
     - <hyperlink>url</hyperlink>
   Correct Answer: <a href="url">link text</a>
   Explanation: The <a> tag with href attribute creates hyperlinks.

4. The CSS Box Model consists of margins, borders, padding, and content?
   Type: True/False
   Correct Answer: true
   Explanation: The CSS Box Model includes all four components: content, padding, border, and margin.

5. Which HTML tag is used for the largest heading?
   Type: Single Choice
   Options:
     - <h1> ✓
     - <h6>
     - <heading>
     - <head>
   Correct Answer: <h1>
   Explanation: <h1> is the largest heading, while <h6> is the smallest.
```

**Quiz 2: JavaScript Fundamentals**
```
Title: JavaScript Fundamentals Quiz
Description: Test your JavaScript knowledge
Passing Score: 70
Time Limit: 20
Max Attempts: 3
Show Correct Answers: true
Randomize Questions: false

Questions:
1. Which keyword is used to declare a block-scoped variable?
   Type: Single Choice
   Options:
     - var
     - let ✓
     - const
     - define
   Correct Answer: let
   Explanation: 'let' declares block-scoped variables that can be reassigned.

2. What will 'typeof []' return?
   Type: Single Choice
   Options:
     - array
     - object ✓
     - list
     - collection
   Correct Answer: object
   Explanation: In JavaScript, arrays are a special type of object.

3. Arrow functions were introduced in ES6?
   Type: True/False
   Correct Answer: true
   Explanation: Arrow functions (=>) were introduced in ECMAScript 6 (ES6).

4. Which method adds an element to the end of an array?
   Type: Single Choice
   Options:
     - push() ✓
     - pop()
     - shift()
     - unshift()
   Correct Answer: push()
   Explanation: push() adds elements to the end of an array.

5. What does DOM stand for?
   Type: Single Choice
   Options:
     - Document Object Model ✓
     - Data Object Model
     - Digital Object Management
     - Document Operation Method
   Correct Answer: Document Object Model
   Explanation: DOM stands for Document Object Model, representing the page structure.
```

### Step 5: Create Assignment

Go to **Content** → **Assignments** → **Create New**

```
Title: Build Your Personal Portfolio Website
Description: Create a personal portfolio website using HTML, CSS, and JavaScript. Include sections for About, Projects, and Contact.

Requirements:
- Use semantic HTML5 tags
- Responsive design with CSS Flexbox or Grid
- At least one interactive JavaScript feature
- Clean, professional design
- Mobile-friendly layout

Submission Type: URL
Instructions: Deploy your portfolio website and submit the live URL. Also share your project on Facebook and submit the post URL.

Due Date: [Leave empty for flexible submission]
Points: 100
Passing Score: 70
```

### Step 6: Create the Course

Go to **Content** → **Courses** → **Create New**

#### Basic Info Tab:
```
Title: Web Development Fundamentals
Slug: web-development-fundamentals
Subtitle: Master HTML, CSS, and JavaScript from Scratch
Description: Learn the foundations of web development and build your first interactive websites. Perfect for complete beginners!
Full Description: [Rich text editor]
  "This comprehensive course covers everything you need to start your web development journey. You'll learn HTML for structure, CSS for styling, and JavaScript for interactivity. By the end, you'll have built multiple projects and deployed your own portfolio website."

Thumbnail: [Upload an attractive course thumbnail - 1280x720px recommended]
Promo Video URL: https://www.youtube.com/watch?v=UB1O30fR-EE
Category: Web Development
Level: Beginner
Language: English
Instructor: [Select Sarah Johnson]
```

#### Content Tab:
```
Modules: [Select all 3 modules created above]
What You'll Learn:
  - Build responsive websites with HTML and CSS
  - Write JavaScript code to add interactivity
  - Understand the DOM and manipulate web pages
  - Create and deploy real web projects
  - Use modern web development tools
  - Structure code using best practices

Requirements:
  - A computer with internet connection
  - Basic computer skills
  - No prior programming experience needed

Who This Course Is For:
  - Complete beginners to web development
  - Career changers looking to enter tech
  - Anyone wanting to build websites
  - Students exploring programming

Skills You'll Gain:
  - HTML5
  - CSS3
  - JavaScript
  - Web Development
  - Frontend Development
```

#### Pricing Tab:
```
Price: 49.99
Original Price: 99.99
Currency: USD
Discount Percentage: 50
Is Free: false
Has Certificate: true
Certificate Type: Completion
```

#### SEO Tab:
```
Meta Title: Web Development Fundamentals - Complete Beginner Course
Meta Description: Learn HTML, CSS, and JavaScript from scratch. Build real projects and start your web development career. Perfect for beginners!
Keywords: web development, HTML, CSS, JavaScript, frontend, beginner course
```

#### Additional Settings:
```
Status: Published
Featured: true
Enrollment Status: Open
Start Date: [Current date]
Estimated Duration: 200 (minutes - total of all lessons)
```

---

## Course 2: Digital Marketing Basics

### Step 1: Create Instructor

Go to **Content** → **Instructors** → **Create New**

```
Name: Michael Chen
Bio: Digital marketing strategist with 8+ years helping businesses grow online. Specialized in social media marketing, content strategy, and analytics.
Email: michael@kitchenoftech.com
Avatar: [Upload photo]
Social Links:
  - LinkedIn: https://linkedin.com/in/michaelchen
  - Twitter: https://twitter.com/michaelmarketing
Expertise: ["Digital Marketing", "Social Media", "Content Strategy", "SEO", "Analytics"]
```

### Step 2: Create Lessons

#### Module 1: Introduction to Digital Marketing

**Lesson 1.1: What is Digital Marketing?**
```
Title: What is Digital Marketing?
Slug: what-is-digital-marketing
Description: Overview of digital marketing and its importance
YouTube Video URL: https://www.youtube.com/watch?v=nU-IIXBWlS4
Video ID: nU-IIXBWlS4
Duration: 10
Order: 1
Free Preview: true
```

**Lesson 1.2: Understanding Your Target Audience**
```
Title: Understanding Your Target Audience
Slug: target-audience
Description: Identify and research your ideal customers
YouTube Video URL: https://www.youtube.com/watch?v=8z6SljJJXw4
Video ID: 8z6SljJJXw4
Duration: 15
Order: 2
Free Preview: true
```

**Lesson 1.3: Digital Marketing Channels Overview**
```
Title: Digital Marketing Channels Overview
Slug: marketing-channels
Description: Explore different digital marketing channels
YouTube Video URL: https://www.youtube.com/watch?v=bixR-KIJKYM
Video ID: bixR-KIJKYM
Duration: 20
Order: 3
Free Preview: false
```

#### Module 2: Social Media Marketing

**Lesson 2.1: Social Media Strategy**
```
Title: Social Media Strategy
Slug: social-media-strategy
Description: Create an effective social media marketing plan
YouTube Video URL: https://www.youtube.com/watch?v=Uv3iRYVB1_M
Video ID: Uv3iRYVB1_M
Duration: 18
Order: 4
Free Preview: false
```

**Lesson 2.2: Content Creation for Social Media**
```
Title: Content Creation for Social Media
Slug: content-creation
Description: Create engaging content that drives engagement
YouTube Video URL: https://www.youtube.com/watch?v=mFEzGUCDzIQ
Video ID: mFEzGUCDzIQ
Duration: 22
Order: 5
Free Preview: false
```

**Lesson 2.3: Facebook and Instagram Marketing**
```
Title: Facebook and Instagram Marketing
Slug: facebook-instagram-marketing
Description: Master Facebook and Instagram for business
YouTube Video URL: https://www.youtube.com/watch?v=Qky62nwHlCE
Video ID: Qky62nwHlCE
Duration: 25
Order: 6
Free Preview: false
```

**Lesson 2.4: Analytics and Performance Tracking**
```
Title: Analytics and Performance Tracking
Slug: analytics-tracking
Description: Measure and optimize your social media performance
YouTube Video URL: https://www.youtube.com/watch?v=8nHVSQ5pq0w
Video ID: 8nHVSQ5pq0w
Duration: 20
Order: 7
Free Preview: false
```

**Lesson 2.5: Running Your First Campaign**
```
Title: Running Your First Campaign
Slug: first-campaign
Description: Plan and execute a complete marketing campaign
YouTube Video URL: https://www.youtube.com/watch?v=JAXH-fh6_bQ
Video ID: JAXH-fh6_bQ
Duration: 30
Order: 8
Free Preview: false
```

### Step 3: Create Modules

**Module 1:**
```
Title: Introduction to Digital Marketing
Slug: intro-digital-marketing
Description: Learn the fundamentals of digital marketing
Order: 1
Lessons: [Select Lessons 1.1, 1.2, 1.3]
```

**Module 2:**
```
Title: Social Media Marketing
Slug: social-media-marketing
Description: Master social media marketing strategies
Order: 2
Lessons: [Select Lessons 2.1, 2.2, 2.3, 2.4, 2.5]
```

### Step 4: Create Quiz

**Quiz: Digital Marketing Fundamentals**
```
Title: Digital Marketing Fundamentals Quiz
Description: Test your digital marketing knowledge
Passing Score: 70
Time Limit: 20
Max Attempts: 3
Show Correct Answers: true

Questions:
1. What is the primary goal of digital marketing?
   Type: Single Choice
   Options:
     - Increase brand awareness
     - Drive sales and leads
     - Engage with customers
     - All of the above ✓
   Correct Answer: All of the above
   Explanation: Digital marketing aims to achieve multiple goals including awareness, sales, and engagement.

2. Which metric measures the cost of acquiring a new customer?
   Type: Single Choice
   Options:
     - ROI
     - CAC ✓
     - CTR
     - CPC
   Correct Answer: CAC
   Explanation: CAC (Customer Acquisition Cost) measures the cost to acquire a new customer.

3. Content marketing is only about blog posts?
   Type: True/False
   Correct Answer: false
   Explanation: Content marketing includes blogs, videos, social media, podcasts, and more.

4. What does CTR stand for?
   Type: Single Choice
   Options:
     - Click-Through Rate ✓
     - Cost Transaction Rate
     - Customer Target Range
     - Click Transfer Ratio
   Correct Answer: Click-Through Rate
   Explanation: CTR measures the percentage of people who click on your link or ad.

5. Which social media platform is best for B2B marketing?
   Type: Single Choice
   Options:
     - LinkedIn ✓
     - TikTok
     - Snapchat
     - Pinterest
   Correct Answer: LinkedIn
   Explanation: LinkedIn is the top platform for B2B marketing and professional networking.

6. A/B testing involves comparing two versions of marketing content?
   Type: True/False
   Correct Answer: true
   Explanation: A/B testing compares two versions to determine which performs better.

7. What is SEO?
   Type: Single Choice
   Options:
     - Social Engagement Optimization
     - Search Engine Optimization ✓
     - Sales Enhancement Operation
     - Systematic Email Outreach
   Correct Answer: Search Engine Optimization
   Explanation: SEO is the practice of optimizing content to rank higher in search engines.

8. Which metric measures engagement on social media posts?
   Type: Multiple Choice
   Options:
     - Likes ✓
     - Comments ✓
     - Shares ✓
     - All of the above
   Correct Answer: [Likes, Comments, Shares]
   Explanation: All of these metrics indicate engagement with social media content.

9. Email marketing is no longer effective in 2026?
   Type: True/False
   Correct Answer: false
   Explanation: Email marketing remains one of the most effective digital marketing channels with high ROI.

10. What is a conversion in digital marketing?
    Type: Single Choice
    Options:
      - A completed desired action ✓
      - Website traffic
      - Social media followers
      - Email subscribers
    Correct Answer: A completed desired action
    Explanation: A conversion is when a user completes a desired action like purchase or sign-up.
```

### Step 5: Create Assignment

```
Title: Social Media Marketing Campaign
Description: Create and execute a complete social media marketing campaign for a business (real or fictional).

Requirements:
- Define target audience and goals
- Create content calendar (1 week)
- Design at least 3 social media posts
- Write compelling copy
- Include hashtag strategy
- Provide analytics plan

Submission Type: URL
Instructions: Share your campaign on Facebook or LinkedIn. Submit the post URL showing your campaign materials.

Points: 100
Passing Score: 70
```

### Step 6: Create the Course

#### Basic Info:
```
Title: Digital Marketing Basics
Slug: digital-marketing-basics
Subtitle: Master Social Media Marketing and Content Strategy
Description: Learn essential digital marketing skills including social media strategy, content creation, and analytics. Perfect for entrepreneurs and marketers!
Full Description: 
  "Build a strong foundation in digital marketing. This course covers social media marketing, content strategy, audience targeting, and analytics. You'll learn to create effective campaigns and measure their success."

Thumbnail: [Upload thumbnail]
Promo Video URL: https://www.youtube.com/watch?v=nU-IIXBWlS4
Category: Digital Marketing
Level: Beginner
Language: English
Instructor: [Select Michael Chen]
```

#### Content Tab:
```
Modules: [Select both modules]
What You'll Learn:
  - Create effective digital marketing strategies
  - Master social media marketing
  - Develop engaging content
  - Analyze campaign performance
  - Understand your target audience
  - Run successful marketing campaigns

Requirements:
  - Basic internet and social media knowledge
  - Willingness to learn and practice
  - No marketing experience required

Who This Course Is For:
  - Small business owners
  - Aspiring digital marketers
  - Entrepreneurs
  - Marketing professionals wanting to upskill
  - Anyone interested in social media marketing

Skills You'll Gain:
  - Digital Marketing
  - Social Media Marketing
  - Content Strategy
  - Marketing Analytics
  - Facebook Marketing
  - Instagram Marketing
```

#### Pricing Tab:
```
Price: 39.99
Original Price: 79.99
Currency: USD
Discount Percentage: 50
Is Free: false
Has Certificate: true
Certificate Type: Completion
```

#### SEO Tab:
```
Meta Title: Digital Marketing Basics - Social Media & Content Strategy Course
Meta Description: Learn digital marketing from scratch. Master social media, content creation, and analytics. Start growing your business online today!
Keywords: digital marketing, social media marketing, content strategy, marketing analytics, online marketing
```

#### Additional Settings:
```
Status: Published
Featured: true
Enrollment Status: Open
Start Date: [Current date]
Estimated Duration: 160 (minutes)
```

---

## Post-Creation Checklist

After creating both courses:

### 1. Verify Course Data
- [ ] All lessons have valid YouTube URLs
- [ ] Video IDs are correctly extracted
- [ ] Lesson durations are set
- [ ] Module orders are correct
- [ ] Course thumbnails uploaded

### 2. Test Quiz Questions
- [ ] All questions have correct answers marked
- [ ] Answer options are properly formatted
- [ ] Explanations provided
- [ ] Passing scores set to 70%

### 3. Check Course Details
- [ ] Pricing is correct
- [ ] Categories assigned
- [ ] Difficulty levels set
- [ ] Learning outcomes listed
- [ ] Requirements specified

### 4. Publish and Test
- [ ] Both courses published
- [ ] Featured courses enabled
- [ ] Enrollment status is "Open"
- [ ] Test enrollment on frontend
- [ ] Verify course appears in listing

---

## Quick Test After Creation

1. **Go to Course Listing Page**: `http://localhost:3000/education`
2. **Verify**: Both courses appear with thumbnails
3. **Click Course**: Opens course details page
4. **Test Enrollment**: Enroll in course (use free or test payment)
5. **Access Course Player**: Navigate to learn page
6. **Watch Video**: Verify YouTube player loads
7. **Complete Lesson**: Watch to 80%+ for auto-completion
8. **Take Quiz**: Submit quiz with 70%+ score
9. **Submit Assignment**: Submit Facebook URL
10. **Check Progress**: View dashboard for progress

---

## YouTube Video IDs Used

### Web Development Fundamentals:
- Welcome: UB1O30fR-EE (HTML Crash Course)
- Setup: fnpmR6Q5lEc (VS Code Setup)
- HTML: ok-plXXHlWw (HTML Tutorial)
- CSS: 1PnVor36_40 (CSS Tutorial)
- Variables: edlFjlzxkSI (JavaScript Variables)
- Functions: iLWTnMzWtj4 (JS Functions)
- DOM: y17RuWkWdn8 (DOM Manipulation)
- Planning: gQojMIhELvM (Project Planning)
- Todo App: Ttf3CEsEwMQ (Todo App Tutorial)
- Deployment: BoN0mSatGxI (Deploy to Netlify)

### Digital Marketing Basics:
- What is Digital Marketing: nU-IIXBWlS4
- Target Audience: 8z6SljJJXw4
- Channels: bixR-KIJKYM
- Strategy: Uv3iRYVB1_M
- Content Creation: mFEzGUCDzIQ
- FB/IG Marketing: Qky62nwHlCE
- Analytics: 8nHVSQ5pq0w
- First Campaign: JAXH-fh6_bQ

*Note: These are real educational YouTube videos. Replace with your own videos or ensure proper licensing for production use.*

---

## Need Help?

If you encounter issues:
1. Check Sanity Studio console for errors
2. Verify all required fields are filled
3. Ensure relationships (instructor, modules, lessons) are properly connected
4. Save documents before referencing them
5. Check that slugs are unique

**Estimated Time to Complete: 2-3 hours for both courses**
