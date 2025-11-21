-- =====================================================
-- Seed Test Freelancers for Browse Page
-- =====================================================
--
-- INSTRUCTIONS:
-- 1. Create freelancer accounts through the signup page at /auth/signup
--    - Use emails: freelancer1@test.com, freelancer2@test.com, etc.
--    - Select "Freelancer" as role during signup
-- 2. Get the user IDs from the profiles table
-- 3. Run this script through Supabase SQL Editor to populate their profiles
--
-- QUICK COMMAND to get user IDs:
-- SELECT id, email, full_name FROM profiles WHERE role = 'freelancer' ORDER BY created_at DESC;
--
-- =====================================================

-- Template: Replace USER_ID_HERE with actual user ID from profiles table
-- Copy and modify this template for each freelancer

-- ========== FREELANCER 1: UI/UX Designer ==========
INSERT INTO freelancer_profiles (
  id, title, bio, hourly_rate, skills, availability, languages, location,
  years_of_experience, completed_projects, rating, total_reviews
) VALUES (
  'USER_ID_HERE', -- Replace with actual user ID
  'UI/UX Designer & Brand Specialist',
  'Creative UI/UX designer with a passion for minimalist design and user-centered experiences. Expert in Figma and Adobe Creative Suite. Worked with 60+ clients worldwide.',
  95.00,
  ARRAY['UI/UX', 'Figma', 'Adobe XD', 'Photoshop', 'Illustrator', 'Branding', 'Wireframing', 'Prototyping'],
  'busy',
  ARRAY['English', 'Arabic', 'French'],
  'Dubai, UAE',
  6,
  62,
  4.9,
  38
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  bio = EXCLUDED.bio,
  hourly_rate = EXCLUDED.hourly_rate,
  skills = EXCLUDED.skills,
  availability = EXCLUDED.availability,
  languages = EXCLUDED.languages,
  location = EXCLUDED.location,
  years_of_experience = EXCLUDED.years_of_experience,
  completed_projects = EXCLUDED.completed_projects,
  rating = EXCLUDED.rating,
  total_reviews = EXCLUDED.total_reviews;

-- ========== FREELANCER 2: React Native Developer ==========
INSERT INTO freelancer_profiles (
  id, title, bio, hourly_rate, skills, availability, languages, location,
  years_of_experience, completed_projects, rating, total_reviews
) VALUES (
  'USER_ID_HERE',
  'React Native Mobile Developer',
  'Mobile app developer focused on React Native. Created 40+ apps with 500K+ downloads. Specialize in cross-platform development with native performance.',
  85.00,
  ARRAY['React Native', 'JavaScript', 'TypeScript', 'Firebase', 'Mobile Development', 'iOS', 'Android', 'Redux'],
  'available',
  ARRAY['English', 'Spanish'],
  'Barcelona, Spain',
  5,
  45,
  4.7,
  29
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  bio = EXCLUDED.bio,
  hourly_rate = EXCLUDED.hourly_rate,
  skills = EXCLUDED.skills,
  availability = EXCLUDED.availability,
  languages = EXCLUDED.languages,
  location = EXCLUDED.location,
  years_of_experience = EXCLUDED.years_of_experience,
  completed_projects = EXCLUDED.completed_projects,
  rating = EXCLUDED.rating,
  total_reviews = EXCLUDED.total_reviews;

-- ========== FREELANCER 3: DevOps Engineer ==========
INSERT INTO freelancer_profiles (
  id, title, bio, hourly_rate, skills, availability, languages, location,
  years_of_experience, completed_projects, rating, total_reviews
) VALUES (
  'USER_ID_HERE',
  'DevOps Engineer & Cloud Architect',
  'DevOps specialist with AWS and Azure certifications. Automate everything, deploy anywhere. Expert in containerization, CI/CD, and infrastructure as code.',
  150.00,
  ARRAY['DevOps', 'AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform', 'Jenkins', 'Linux'],
  'available',
  ARRAY['English'],
  'San Francisco, USA',
  12,
  120,
  5.0,
  67
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  bio = EXCLUDED.bio,
  hourly_rate = EXCLUDED.hourly_rate,
  skills = EXCLUDED.skills,
  availability = EXCLUDED.availability,
  languages = EXCLUDED.languages,
  location = EXCLUDED.location,
  years_of_experience = EXCLUDED.years_of_experience,
  completed_projects = EXCLUDED.completed_projects,
  rating = EXCLUDED.rating,
  total_reviews = EXCLUDED.total_reviews;

-- ========== FREELANCER 4: Frontend Developer ==========
INSERT INTO freelancer_profiles (
  id, title, bio, hourly_rate, skills, availability, languages, location,
  years_of_experience, completed_projects, rating, total_reviews
) VALUES (
  'USER_ID_HERE',
  'Frontend Developer & UI Specialist',
  'Frontend developer with an eye for design. Love creating beautiful, responsive interfaces that users enjoy. Specialized in modern JavaScript frameworks.',
  65.00,
  ARRAY['React', 'Vue.js', 'JavaScript', 'CSS', 'HTML', 'Tailwind CSS', 'SASS', 'Responsive Design'],
  'available',
  ARRAY['English'],
  'Tokyo, Japan',
  4,
  34,
  4.6,
  22
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  bio = EXCLUDED.bio,
  hourly_rate = EXCLUDED.hourly_rate,
  skills = EXCLUDED.skills,
  availability = EXCLUDED.availability,
  languages = EXCLUDED.languages,
  location = EXCLUDED.location,
  years_of_experience = EXCLUDED.years_of_experience,
  completed_projects = EXCLUDED.completed_projects,
  rating = EXCLUDED.rating,
  total_reviews = EXCLUDED.total_reviews;

-- ========== FREELANCER 5: Python Backend Developer ==========
INSERT INTO freelancer_profiles (
  id, title, bio, hourly_rate, skills, availability, languages, location,
  years_of_experience, completed_projects, rating, total_reviews
) VALUES (
  'USER_ID_HERE',
  'Python Backend Developer',
  'Backend developer specializing in Python, Django, and FastAPI. Strong focus on API design, database optimization, and scalable architecture.',
  75.00,
  ARRAY['Python', 'Django', 'FastAPI', 'PostgreSQL', 'Redis', 'REST API', 'GraphQL', 'MongoDB'],
  'busy',
  ARRAY['English', 'Arabic'],
  'Cairo, Egypt',
  5,
  28,
  4.3,
  18
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  bio = EXCLUDED.bio,
  hourly_rate = EXCLUDED.hourly_rate,
  skills = EXCLUDED.skills,
  availability = EXCLUDED.availability,
  languages = EXCLUDED.languages,
  location = EXCLUDED.location,
  years_of_experience = EXCLUDED.years_of_experience,
  completed_projects = EXCLUDED.completed_projects,
  rating = EXCLUDED.rating,
  total_reviews = EXCLUDED.total_reviews;

-- ========== FREELANCER 6: Full-Stack JavaScript Developer ==========
INSERT INTO freelancer_profiles (
  id, title, bio, hourly_rate, skills, availability, languages, location,
  years_of_experience, completed_projects, rating, total_reviews
) VALUES (
  'USER_ID_HERE',
  'Full-Stack JavaScript Developer',
  'Full-stack JavaScript developer. MERN stack expert. Based in Paris, working with international clients on modern web applications.',
  90.00,
  ARRAY['JavaScript', 'Node.js', 'React', 'MongoDB', 'Express', 'TypeScript', 'Next.js', 'Vue.js'],
  'available',
  ARRAY['English', 'French'],
  'Paris, France',
  7,
  71,
  4.7,
  41
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  bio = EXCLUDED.bio,
  hourly_rate = EXCLUDED.hourly_rate,
  skills = EXCLUDED.skills,
  availability = EXCLUDED.availability,
  languages = EXCLUDED.languages,
  location = EXCLUDED.location,
  years_of_experience = EXCLUDED.years_of_experience,
  completed_projects = EXCLUDED.completed_projects,
  rating = EXCLUDED.rating,
  total_reviews = EXCLUDED.total_reviews;

-- ========== FREELANCER 7: Content Writer & SEO ==========
INSERT INTO freelancer_profiles (
  id, title, bio, hourly_rate, skills, availability, languages, location,
  years_of_experience, completed_projects, rating, total_reviews
) VALUES (
  'USER_ID_HERE',
  'Content Writer & SEO Specialist',
  'Professional content writer and SEO specialist. Helped 50+ businesses rank on Google. Native English speaker with expertise in technical and marketing content.',
  45.00,
  ARRAY['Content Writing', 'SEO', 'Copywriting', 'Blog Writing', 'Marketing', 'Technical Writing', 'WordPress'],
  'available',
  ARRAY['English'],
  'London, UK',
  3,
  18,
  4.2,
  12
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  bio = EXCLUDED.bio,
  hourly_rate = EXCLUDED.hourly_rate,
  skills = EXCLUDED.skills,
  availability = EXCLUDED.availability,
  languages = EXCLUDED.languages,
  location = EXCLUDED.location,
  years_of_experience = EXCLUDED.years_of_experience,
  completed_projects = EXCLUDED.completed_projects,
  rating = EXCLUDED.rating,
  total_reviews = EXCLUDED.total_reviews;

-- ========== FREELANCER 8: AI/ML Engineer ==========
INSERT INTO freelancer_profiles (
  id, title, bio, hourly_rate, skills, availability, languages, location,
  years_of_experience, completed_projects, rating, total_reviews
) VALUES (
  'USER_ID_HERE',
  'AI/ML Engineer',
  'AI/ML engineer with PhD in Computer Science. Specialized in NLP, computer vision, and deep learning. Built production ML systems for Fortune 500 companies.',
  180.00,
  ARRAY['AI/ML', 'Python', 'TensorFlow', 'PyTorch', 'NLP', 'Computer Vision', 'Deep Learning', 'Data Science'],
  'busy',
  ARRAY['English', 'Spanish'],
  'Mexico City, Mexico',
  10,
  52,
  4.9,
  34
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  bio = EXCLUDED.bio,
  hourly_rate = EXCLUDED.hourly_rate,
  skills = EXCLUDED.skills,
  availability = EXCLUDED.availability,
  languages = EXCLUDED.languages,
  location = EXCLUDED.location,
  years_of_experience = EXCLUDED.years_of_experience,
  completed_projects = EXCLUDED.completed_projects,
  rating = EXCLUDED.rating,
  total_reviews = EXCLUDED.total_reviews;

-- ========== FREELANCER 9: Graphic Designer ==========
INSERT INTO freelancer_profiles (
  id, title, bio, hourly_rate, skills, availability, languages, location,
  years_of_experience, completed_projects, rating, total_reviews
) VALUES (
  'USER_ID_HERE',
  'Graphic Designer & Illustrator',
  'Graphic designer creating stunning visuals for brands. Expert in Photoshop, Illustrator, and modern design trends. Specialized in logo design and brand identity.',
  55.00,
  ARRAY['Photoshop', 'Illustrator', 'Graphic Design', 'Logo Design', 'Branding', 'InDesign', 'Digital Art'],
  'available',
  ARRAY['English', 'German'],
  'Berlin, Germany',
  4,
  23,
  4.0,
  15
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  bio = EXCLUDED.bio,
  hourly_rate = EXCLUDED.hourly_rate,
  skills = EXCLUDED.skills,
  availability = EXCLUDED.availability,
  languages = EXCLUDED.languages,
  location = EXCLUDED.location,
  years_of_experience = EXCLUDED.years_of_experience,
  completed_projects = EXCLUDED.completed_projects,
  rating = EXCLUDED.rating,
  total_reviews = EXCLUDED.total_reviews;

-- ========== FREELANCER 10: WordPress Developer ==========
INSERT INTO freelancer_profiles (
  id, title, bio, hourly_rate, skills, availability, languages, location,
  years_of_experience, completed_projects, rating, total_reviews
) VALUES (
  'USER_ID_HERE',
  'WordPress & PHP Developer',
  'WordPress expert building custom themes and plugins. Over 100 successful website launches. Specialized in WooCommerce and custom WordPress solutions.',
  70.00,
  ARRAY['WordPress', 'PHP', 'MySQL', 'HTML', 'CSS', 'JavaScript', 'WooCommerce', 'Elementor'],
  'available',
  ARRAY['English'],
  'Tel Aviv, Israel',
  9,
  105,
  4.8,
  58
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  bio = EXCLUDED.bio,
  hourly_rate = EXCLUDED.hourly_rate,
  skills = EXCLUDED.skills,
  availability = EXCLUDED.availability,
  languages = EXCLUDED.languages,
  location = EXCLUDED.location,
  years_of_experience = EXCLUDED.years_of_experience,
  completed_projects = EXCLUDED.completed_projects,
  rating = EXCLUDED.rating,
  total_reviews = EXCLUDED.total_reviews;

-- ========== FREELANCER 11: Flutter Developer ==========
INSERT INTO freelancer_profiles (
  id, title, bio, hourly_rate, skills, availability, languages, location,
  years_of_experience, completed_projects, rating, total_reviews
) VALUES (
  'USER_ID_HERE',
  'Flutter Mobile Developer',
  'Flutter developer creating beautiful cross-platform mobile apps. Fast, efficient, and always on time. Specialized in complex UI and state management.',
  80.00,
  ARRAY['Flutter', 'Dart', 'Mobile Development', 'Firebase', 'iOS', 'Android', 'BLoC', 'Provider'],
  'busy',
  ARRAY['English', 'Arabic'],
  'Beirut, Lebanon',
  3,
  19,
  4.5,
  11
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  bio = EXCLUDED.bio,
  hourly_rate = EXCLUDED.hourly_rate,
  skills = EXCLUDED.skills,
  availability = EXCLUDED.availability,
  languages = EXCLUDED.languages,
  location = EXCLUDED.location,
  years_of_experience = EXCLUDED.years_of_experience,
  completed_projects = EXCLUDED.completed_projects,
  rating = EXCLUDED.rating,
  total_reviews = EXCLUDED.total_reviews;

-- ========== FREELANCER 12: Next.js Expert ==========
INSERT INTO freelancer_profiles (
  id, title, bio, hourly_rate, skills, availability, languages, location,
  years_of_experience, completed_projects, rating, total_reviews
) VALUES (
  'USER_ID_HERE',
  'Next.js & TypeScript Expert',
  'Next.js and TypeScript expert. Building high-performance, SEO-optimized web applications. Specialized in server-side rendering and static site generation.',
  110.00,
  ARRAY['Next.js', 'TypeScript', 'React', 'Node.js', 'Tailwind CSS', 'Vercel', 'PostgreSQL', 'Prisma'],
  'busy',
  ARRAY['English'],
  'Dublin, Ireland',
  8,
  68,
  4.9,
  39
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  bio = EXCLUDED.bio,
  hourly_rate = EXCLUDED.hourly_rate,
  skills = EXCLUDED.skills,
  availability = EXCLUDED.availability,
  languages = EXCLUDED.languages,
  location = EXCLUDED.location,
  years_of_experience = EXCLUDED.years_of_experience,
  completed_projects = EXCLUDED.completed_projects,
  rating = EXCLUDED.rating,
  total_reviews = EXCLUDED.total_reviews;

-- ========== FREELANCER 13: Junior Web Developer (Low Rating) ==========
INSERT INTO freelancer_profiles (
  id, title, bio, hourly_rate, skills, availability, languages, location,
  years_of_experience, completed_projects, rating, total_reviews
) VALUES (
  'USER_ID_HERE',
  'Junior Web Developer',
  'Junior web developer eager to learn and grow. Recent bootcamp graduate with strong HTML, CSS, and JavaScript skills. Looking to build portfolio.',
  25.00,
  ARRAY['HTML', 'CSS', 'JavaScript', 'React', 'Git', 'Bootstrap'],
  'available',
  ARRAY['English'],
  'Toronto, Canada',
  1,
  3,
  0.0,
  0
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  bio = EXCLUDED.bio,
  hourly_rate = EXCLUDED.hourly_rate,
  skills = EXCLUDED.skills,
  availability = EXCLUDED.availability,
  languages = EXCLUDED.languages,
  location = EXCLUDED.location,
  years_of_experience = EXCLUDED.years_of_experience,
  completed_projects = EXCLUDED.completed_projects,
  rating = EXCLUDED.rating,
  total_reviews = EXCLUDED.total_reviews;

-- ========== FREELANCER 14: Database Expert ==========
INSERT INTO freelancer_profiles (
  id, title, bio, hourly_rate, skills, availability, languages, location,
  years_of_experience, completed_projects, rating, total_reviews
) VALUES (
  'USER_ID_HERE',
  'Database Administrator & SQL Expert',
  'Database expert specializing in PostgreSQL, MySQL, and MongoDB. Optimization and data migration specialist. 11 years of enterprise experience.',
  100.00,
  ARRAY['PostgreSQL', 'MySQL', 'MongoDB', 'SQL', 'Database Design', 'Redis', 'Performance Tuning', 'Data Migration'],
  'available',
  ARRAY['English', 'Arabic', 'French'],
  'Riyadh, Saudi Arabia',
  11,
  93,
  4.7,
  52
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  bio = EXCLUDED.bio,
  hourly_rate = EXCLUDED.hourly_rate,
  skills = EXCLUDED.skills,
  availability = EXCLUDED.availability,
  languages = EXCLUDED.languages,
  location = EXCLUDED.location,
  years_of_experience = EXCLUDED.years_of_experience,
  completed_projects = EXCLUDED.completed_projects,
  rating = EXCLUDED.rating,
  total_reviews = EXCLUDED.total_reviews;

-- ========== FREELANCER 15: Product Designer ==========
INSERT INTO freelancer_profiles (
  id, title, bio, hourly_rate, skills, availability, languages, location,
  years_of_experience, completed_projects, rating, total_reviews
) VALUES (
  'USER_ID_HERE',
  'Product Designer & UX Researcher',
  'Product designer focused on user research and data-driven design decisions. 60+ successful product launches. Expert in design thinking and user testing.',
  115.00,
  ARRAY['UI/UX', 'Figma', 'User Research', 'Product Design', 'Prototyping', 'Design Systems', 'Usability Testing'],
  'busy',
  ARRAY['English', 'Spanish'],
  'Milan, Italy',
  7,
  58,
  4.6,
  35
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  bio = EXCLUDED.bio,
  hourly_rate = EXCLUDED.hourly_rate,
  skills = EXCLUDED.skills,
  availability = EXCLUDED.availability,
  languages = EXCLUDED.languages,
  location = EXCLUDED.location,
  years_of_experience = EXCLUDED.years_of_experience,
  completed_projects = EXCLUDED.completed_projects,
  rating = EXCLUDED.rating,
  total_reviews = EXCLUDED.total_reviews;

-- ========== FREELANCER 16: Vue.js Developer (Lower Rating) ==========
INSERT INTO freelancer_profiles (
  id, title, bio, hourly_rate, skills, availability, languages, location,
  years_of_experience, completed_projects, rating, total_reviews
) VALUES (
  'USER_ID_HERE',
  'Vue.js Frontend Developer',
  'Vue.js specialist with 5 years experience. Created interactive dashboards and SPAs for various industries. Comfortable with Nuxt.js and Vuex.',
  70.00,
  ARRAY['Vue.js', 'JavaScript', 'Nuxt.js', 'Vuex', 'CSS', 'HTML', 'TypeScript', 'Webpack'],
  'available',
  ARRAY['English'],
  'Mumbai, India',
  5,
  41,
  3.8,
  25
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  bio = EXCLUDED.bio,
  hourly_rate = EXCLUDED.hourly_rate,
  skills = EXCLUDED.skills,
  availability = EXCLUDED.availability,
  languages = EXCLUDED.languages,
  location = EXCLUDED.location,
  years_of_experience = EXCLUDED.years_of_experience,
  completed_projects = EXCLUDED.completed_projects,
  rating = EXCLUDED.rating,
  total_reviews = EXCLUDED.total_reviews;

-- ========== FREELANCER 17: Shopify Developer ==========
INSERT INTO freelancer_profiles (
  id, title, bio, hourly_rate, skills, availability, languages, location,
  years_of_experience, completed_projects, rating, total_reviews
) VALUES (
  'USER_ID_HERE',
  'E-commerce Shopify Developer',
  'E-commerce developer specializing in Shopify. Helped businesses generate $10M+ in online sales. Expert in Liquid, custom themes, and app integration.',
  65.00,
  ARRAY['Shopify', 'E-commerce', 'Liquid', 'JavaScript', 'CSS', 'Marketing', 'SEO', 'Analytics'],
  'busy',
  ARRAY['English', 'German'],
  'Moscow, Russia',
  6,
  55,
  4.4,
  31
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  bio = EXCLUDED.bio,
  hourly_rate = EXCLUDED.hourly_rate,
  skills = EXCLUDED.skills,
  availability = EXCLUDED.availability,
  languages = EXCLUDED.languages,
  location = EXCLUDED.location,
  years_of_experience = EXCLUDED.years_of_experience,
  completed_projects = EXCLUDED.completed_projects,
  rating = EXCLUDED.rating,
  total_reviews = EXCLUDED.total_reviews;

-- =====================================================
-- Verification Query
-- =====================================================
-- Run this to see all freelancers and their profiles
SELECT
  p.full_name,
  fp.title,
  fp.hourly_rate,
  fp.rating,
  fp.completed_projects,
  fp.availability,
  fp.location,
  array_length(fp.skills, 1) as skill_count
FROM profiles p
JOIN freelancer_profiles fp ON p.id = fp.id
WHERE p.role = 'freelancer'
ORDER BY fp.hourly_rate DESC;
