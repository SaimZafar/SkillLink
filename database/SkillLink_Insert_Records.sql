-- USERS 6 clients, 6 freelancers
insert into users values (seq_users.nextval, 'Ali Hassan', 'ali@email.com', 'pass123', '03001234567', sysdate);
insert into users values (seq_users.nextval, 'Sara Khan', 'sara@email.com', 'pass123', '03111234567', sysdate);
insert into users values (seq_users.nextval, 'Bilal Ahmed', 'bilal@email.com', 'pass123', '03211234567', sysdate);
insert into users values (seq_users.nextval, 'Ahmed Raza', 'ahmed@email.com', 'pass123', '03021234567', sysdate);
insert into users values (seq_users.nextval, 'Ayesha Tariq', 'ayesha@email.com', 'pass123', '03121234567', sysdate);
insert into users values (seq_users.nextval, 'Hamza Sheikh', 'hamza@email.com', 'pass123', '03221234567', sysdate);
insert into users values (seq_users.nextval, 'Fatima Zahra', 'fatima@email.com', 'pass123', '03301234567', sysdate);
insert into users values (seq_users.nextval, 'Usman Malik', 'usman@email.com', 'pass123', '03451234567', sysdate);
insert into users values (seq_users.nextval, 'Zara Noor', 'zara@email.com', 'pass123', '03501234567', sysdate);
insert into users values (seq_users.nextval, 'Sana Javed', 'sana@email.com', 'pass123', '03311234567', sysdate);
insert into users values (seq_users.nextval, 'Tariq Mehmood', 'tariq@email.com', 'pass123', '03461234567', sysdate);
insert into users values (seq_users.nextval, 'Nadia Hussain', 'nadia@email.com', 'pass123', '03511234567', sysdate);

-- CLIENT user_id 1 to 6
insert into client_profile values (1, 'TechCorp Lahore', 'Lahore');
insert into client_profile values (2, 'Creative Hub', 'Karachi');
insert into client_profile values (3, 'StartupPK', 'Islamabad');
insert into client_profile values (4, 'DigiSoft Rawalpindi', 'Rawalpindi');
insert into client_profile values (5, 'MediaPro Lahore', 'Lahore');
insert into client_profile values (6, 'BuildIt Peshawar', 'Peshawar');

-- FREELANCER user_id 7 to 12
insert into freelancer_profile values (7, 'Full stack web developer with 3 years experience', 2500, 0, 'expert', 'yes');
insert into freelancer_profile values (8, 'Graphic designer specializing in branding and logos', 1500, 0, 'intermediate', 'yes');
insert into freelancer_profile values (9, 'Data analyst and Python developer', 2000, 0, 'intermediate', 'no');
insert into freelancer_profile values (10, 'Mobile app developer with Flutter and React Native', 3000, 0, 'expert', 'yes');
insert into freelancer_profile values (11, 'Content writer and SEO specialist', 1000, 0, 'beginner', 'yes');
insert into freelancer_profile values (12, 'UI UX designer with Figma expertise', 1800, 0, 'intermediate', 'yes');

-- SKILLS
insert into skills values (seq_skills.nextval, 'Web Development', 'Tech');
insert into skills values (seq_skills.nextval, 'Graphic Design', 'Design');
insert into skills values (seq_skills.nextval, 'Python', 'Tech');
insert into skills values (seq_skills.nextval, 'Data Analysis', 'Tech');
insert into skills values (seq_skills.nextval, 'SEO', 'Marketing');
insert into skills values (seq_skills.nextval, 'Flutter', 'Tech');
insert into skills values (seq_skills.nextval, 'Content Writing', 'Writing');
insert into skills values (seq_skills.nextval, 'UI UX Design', 'Design');
insert into skills values (seq_skills.nextval, 'React Native', 'Tech');
insert into skills values (seq_skills.nextval, 'Digital Marketing', 'Marketing');

-- USER SKILLS
insert into user_skills values (7, 1);
insert into user_skills values (7, 3);
insert into user_skills values (7, 9);
insert into user_skills values (8, 2);
insert into user_skills values (8, 8);
insert into user_skills values (9, 3);
insert into user_skills values (9, 4);
insert into user_skills values (9, 5);
insert into user_skills values (10, 6);
insert into user_skills values (10, 9);
insert into user_skills values (11, 7);
insert into user_skills values (11, 5);
insert into user_skills values (11, 10);
insert into user_skills values (12, 8);
insert into user_skills values (12, 2);

-- CATEGORIES
insert into categories values (seq_categories.nextval, 'Web Development', 'Projects related to websites and web apps');
insert into categories values (seq_categories.nextval, 'Design', 'Graphic and UI UX design projects');
insert into categories values (seq_categories.nextval, 'Data Science', 'Data analysis and machine learning projects');
insert into categories values (seq_categories.nextval, 'Mobile Development', 'iOS and Android app projects');
insert into categories values (seq_categories.nextval, 'Writing', 'Content writing and copywriting projects');
insert into categories values (seq_categories.nextval, 'Marketing', 'Digital marketing and SEO projects');

-- PROJECTS
insert into projects values (seq_projects.nextval, 1, 'Company Portfolio Website', 'Need a modern portfolio website for our company', 50000, sysdate+30, 'in_progress');
insert into projects values (seq_projects.nextval, 2, 'Logo and Branding Package', 'Design a logo and brand identity for our startup', 15000, sysdate+14, 'completed');
insert into projects values (seq_projects.nextval, 3, 'Sales Data Dashboard', 'Build a dashboard to visualize monthly sales data', 35000, sysdate+21, 'in_progress');
insert into projects values (seq_projects.nextval, 4, 'Mobile App for Food Delivery', 'Develop a food delivery app for Android and iOS', 80000, sysdate+45, 'in_progress');
insert into projects values (seq_projects.nextval, 5, 'Blog Content for Tech Website', 'Write 10 SEO optimized blog posts about technology', 12000, sysdate+10, 'completed');
insert into projects values (seq_projects.nextval, 6, 'Social Media Marketing Campaign', 'Run a one month digital marketing campaign', 20000, sysdate+30, 'open');

-- PROJECT CATEGORY
insert into project_category values (1, 1);
insert into project_category values (2, 2);
insert into project_category values (3, 3);
insert into project_category values (4, 4);
insert into project_category values (5, 5);
insert into project_category values (6, 6);


-- PROJECT FILES
insert into project_files values (seq_files.nextval, 1, 'requirements.pdf', 'pdf', sysdate);
insert into project_files values (seq_files.nextval, 2, 'brand_guidelines.docx', 'docx', sysdate);
insert into project_files values (seq_files.nextval, 3, 'sales_data_sample.xlsx', 'xlsx', sysdate);
insert into project_files values (seq_files.nextval, 4, 'app_wireframes.fig', 'fig', sysdate);
insert into project_files values (seq_files.nextval, 5, 'content_brief.pdf', 'pdf', sysdate);
insert into project_files values (seq_files.nextval, 6, 'ecommerce_requirements.pdf', 'pdf', sysdate);

-- BIDS
insert into bids values (seq_bids.nextval, 1, 7, 45000, 25, 'accepted', sysdate);
insert into bids values (seq_bids.nextval, 1, 9, 48000, 30, 'rejected', sysdate);
insert into bids values (seq_bids.nextval, 2, 8, 12000, 10, 'accepted', sysdate);
insert into bids values (seq_bids.nextval, 2, 12, 14000, 12, 'rejected', sysdate);
insert into bids values (seq_bids.nextval, 3, 9, 30000, 18, 'accepted', sysdate);
insert into bids values (seq_bids.nextval, 4, 10, 75000, 40, 'accepted', sysdate);
insert into bids values (seq_bids.nextval, 4, 7, 80000, 45, 'rejected', sysdate);
insert into bids values (seq_bids.nextval, 5, 11, 10000, 8, 'accepted', sysdate);
insert into bids values (seq_bids.nextval, 5, 9, 11000, 9, 'rejected', sysdate);
insert into bids values (seq_bids.nextval, 6, 11, 18000, 28, 'pending', sysdate);
insert into bids values (seq_bids.nextval, 6, 12, 20000, 30, 'pending', sysdate);


-- CONTRACTS
insert into contracts values (seq_contracts.nextval, 1, 45000, sysdate, sysdate+25, 'active');
insert into contracts values (seq_contracts.nextval, 3, 12000, sysdate, sysdate+10, 'completed');
insert into contracts values (seq_contracts.nextval, 5, 30000, sysdate, sysdate+18, 'active');
insert into contracts values (seq_contracts.nextval, 6, 75000, sysdate, sysdate+40, 'active');
insert into contracts values (seq_contracts.nextval, 8, 10000, sysdate, sysdate+8, 'completed');

-- PAYMENTS
insert into payments values (seq_payments.nextval, 2, 12000, sysdate, 'easypaisa', 'paid');
insert into payments values (seq_payments.nextval, 1, 20000, sysdate, 'bank', 'paid');
insert into payments values (seq_payments.nextval, 1, 25000, sysdate, 'bank', 'pending');
insert into payments values (seq_payments.nextval, 3, 15000, sysdate, 'jazzcash', 'paid');
insert into payments values (seq_payments.nextval, 3, 15000, sysdate, 'jazzcash', 'pending');
insert into payments values (seq_payments.nextval, 4, 40000, sysdate, 'bank', 'paid');
insert into payments values (seq_payments.nextval, 5, 10000, sysdate, 'easypaisa', 'paid');

-- REVIEWS
insert into reviews values (seq_reviews.nextval, 2, 2, 8, 5, 'Excellent work very professional and delivered on time', sysdate);
insert into reviews values (seq_reviews.nextval, 2, 8, 2, 4, 'Good client with clear requirements and prompt responses', sysdate);
insert into reviews values (seq_reviews.nextval, 5, 5, 11, 5, 'Outstanding content quality exceeded our expectations', sysdate);
insert into reviews values (seq_reviews.nextval, 5, 11, 5, 4, 'Great client very organized and easy to work with', sysdate);

-- DISPUTES
insert into disputes values (seq_disputes.nextval, 3, 9, 'Client not responding to messages for 5 days', 'open', sysdate);
insert into disputes values (seq_disputes.nextval, 4, 6, 'Freelancer missed the first milestone deadline', 'resolved', sysdate);

-- NOTIFICATIONS
insert into notifications values (seq_notifications.nextval, 7, 'Your bid on Company Portfolio Website has been accepted', sysdate, 'N', 'bid_accepted');
insert into notifications values (seq_notifications.nextval, 8, 'Your bid on Logo and Branding Package has been accepted', sysdate, 'Y', 'bid_accepted');
insert into notifications values (seq_notifications.nextval, 9, 'Your bid on Sales Data Dashboard has been accepted', sysdate, 'N', 'bid_accepted');
insert into notifications values (seq_notifications.nextval, 10, 'Your bid on Mobile App for Food Delivery has been accepted', sysdate, 'N', 'bid_accepted');
insert into notifications values (seq_notifications.nextval, 11, 'Your bid on Blog Content for Tech Website has been accepted', sysdate, 'Y', 'bid_accepted');
insert into notifications values (seq_notifications.nextval, 2, 'Payment of 12000 received for Logo and Branding Package', sysdate, 'Y', 'payment');
insert into notifications values (seq_notifications.nextval, 1, 'Payment of 20000 processed for Company Portfolio Website', sysdate, 'N', 'payment');
insert into notifications values (seq_notifications.nextval, 5, 'Payment of 10000 received for Blog Content project', sysdate, 'Y', 'payment');
insert into notifications values (seq_notifications.nextval, 3, 'A dispute has been raised on your contract', sysdate, 'N', 'dispute');
insert into notifications values (seq_notifications.nextval, 6, 'Your dispute has been resolved', sysdate, 'Y', 'dispute');

INSERT INTO admins VALUES (seq_admins.nextval, 'Admin', 'admin@skilllink.com', 'admin123', SYSDATE);