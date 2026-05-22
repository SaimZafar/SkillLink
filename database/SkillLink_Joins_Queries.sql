-- 1. ALL USERS WITH THEIR PROFILE TYPE
select u.user_id, u.name, u.email, u.phone, c.company_name, c.location
from users u join client_profile c on u.user_id = c.client_id;

-- 2. ALL FREELANCERS WITH USER INFO
select u.user_id, u.name, u.email, f.bio, f.hourly_rate, f.rating, f.experience_level, f.availability
from users u join freelancer_profile f on u.user_id = f.freelancer_id;

-- 3. ALL PROJECTS WITH CLIENT NAME
select p.project_id, p.title, p.budget, p.deadline, p.status, u.name as client_name, c.company_name
from projects p join client_profile c on p.client_id = c.client_id join users u on c.client_id = u.user_id;

-- 4. ALL BIDS WITH PROJECT TITLE AND FREELANCER NAME
select b.bid_id, b.amount, b.delivery_time, b.status, b.submitted_at, p.title as project_title, u.name as freelancer_name
from bids b join projects p on b.project_id = p.project_id join freelancer_profile f on b.freelancer_id = f.freelancer_id
join users u on f.freelancer_id = u.user_id;
`	
-- 5. ALL CONTRACTS WITH PROJECT, CLIENT AND FREELANCER
select con.contract_id, con.amount, con.start_date, con.end_date, con.status, p.title as project_title, uc.name as client_name, uf.name as freelancer_name
from contracts con join bids b on con.bid_id = b.bid_id join projects p on b.project_id = p.project_id 
join client_profile c on p.client_id = c.client_id join users uc on c.client_id = uc.user_id 
join freelancer_profile f on b.freelancer_id = f.freelancer_id join users uf on f.freelancer_id = uf.user_id;

-- 6. ALL PAYMENTS WITH CONTRACT AND FREELANCER NAME
select pay.payment_id, pay.amount, pay.pay_date, pay.method, pay.status, con.contract_id, uf.name as freelancer_name, p.title as project_title
from payments pay join contracts con on pay.contract_id = con.contract_id
join bids b on con.bid_id = b.bid_id join projects p on b.project_id = p.project_id
join freelancer_profile f on b.freelancer_id = f.freelancer_id join users uf on f.freelancer_id = uf.user_id;

-- 7. ALL REVIEWS WITH REVIEWER AND REVIEWEE NAMES
select r.review_id, r.rating, r.comment_r, r.created_at, u1.name as reviewer_name, u2.name as reviewee_name, p.title as project_title
from reviews r join users u1 on r.reviewer_id = u1.user_id join users u2 on r.reviewee_id = u2.user_id
join contracts con on r.contract_id = con.contract_id join bids b on con.bid_id = b.bid_id join projects p on b.project_id = p.project_id;

-- 8. ALL SKILLS OF EACH FREELANCER
select u.name as freelancer_name, s.name as skill_name, s.category as skill_category
from users u join freelancer_profile f on u.user_id = f.freelancer_id join user_skills us on f.freelancer_id = us.user_id
join skills s on us.skill_id = s.skill_id order by u.name;

-- 9. ALL PROJECTS WITH THEIR CATEGORIES
select p.project_id, p.title, p.budget, p.status, cat.name as category_name, cat.description as category_description
from projects p join project_category pc on p.project_id = pc.project_id join categories cat on pc.category_id = cat.category_id;

-- 10. ALL DISPUTES WITH CONTRACT AND USER DETAILS
select d.dispute_id, d.reason, d.status, d.created_at, u.name as raised_by, con.contract_id, con.amount, p.title as project_title
from disputes d join users u on d.raised_by = u.user_id join contracts con on d.contract_id = con.contract_id
join bids b on con.bid_id = b.bid_id join projects p on b.project_id = p.project_id;

-- 11. ALL NOTIFICATIONS WITH USER NAME
select n.notification_id, n.message, n.date_sent, n.is_read, n.type, u.name as user_name
from notifications n join users u on n.user_id = u.user_id order by n.date_sent desc;

-- 12. ALL PROJECT FILES WITH PROJECT TITLE AND CLIENT NAME
select pf.file_id, pf.file_name, pf.file_type, pf.upload_date, p.title as project_title, u.name as client_name
from project_files pf join projects p on pf.project_id = p.project_id join client_profile c on p.client_id = c.client_id 
join users u on c.client_id = u.user_id;

-- 13. ALL BIDS WITH PROJECT AND FREELANCER
select b.bid_id, b.amount, b.delivery_time, b.submitted_at, p.title as project_title, u.name as freelancer_name, f.experience_level
from bids b join projects p on b.project_id = p.project_id join freelancer_profile f on b.freelancer_id = f.freelancer_id
join users u on f.freelancer_id = u.user_id;

-- 14. ALL PROJECTS WITH CLIENT NAME AND CATEGORY
select p.project_id, p.title, p.budget, p.deadline, u.name as client_name, cat.name as category
from projects p join client_profile c on p.client_id = c.client_id join users u on c.client_id = u.user_id
join project_category pc on p.project_id = pc.project_id join categories cat on pc.category_id = cat.category_id;

-- 15. ALL FREELANCERS WITH THEIR SKILLS AND HOURLY RATE
select u.name, f.hourly_rate, f.experience_level, f.availability,s.name as skill, s.category as skill_category
from users u join freelancer_profile f on u.user_id = f.freelancer_id
join user_skills us on f.freelancer_id = us.user_id join skills s on us.skill_id = s.skill_id order by u.name;




SELECT * FROM users;
SELECT u.user_id, u.name, u.email, u.phone, u.created_at,
       CASE WHEN c.client_id IS NOT NULL THEN 'client'
            WHEN f.freelancer_id IS NOT NULL THEN 'freelancer'
       END as role,
       c.company_name, c.location,
       f.hourly_rate, f.rating, f.experience_level, f.availability
FROM users u
LEFT JOIN client_profile c ON u.user_id = c.client_id
LEFT JOIN freelancer_profile f ON u.user_id = f.freelancer_id
WHERE u.user_id = 82;


create table customers (customer_id number, customer_name varchar2(50), customer_address varchar2(100), constraint pk_cust primary key (customer_id));

create table products (product_id varchar2(10), product_name varchar2(50), supplier_name varchar2(50), supplier_address varchar2(100),
constraint pk_prod primary key (product_id));

create table orders (order_id number,customer_id number, product_id varchar2(10),quantity number,
  constraint pk_ord primary key (order_id),constraint fk_cust foreign key (customer_id) references customers(customer_id),
  constraint fk_prod foreign key (product_id) references products(product_id));

insert into customers values (1, 'Ali', 'Lahore');
insert into customers values (2, 'Sara', 'Islamabad');
insert into customers values (3, 'John', 'Karachi');
insert into customers values (4, 'Ayesha', 'Multan');
insert into customers values (5, 'Bilal', 'Faisalabad');

insert into products values ('P01', 'Laptop', 'TechWorld', 'Karachi');
insert into products values ('P02', 'Printer', 'PrintCo', 'Lahore');
insert into products values ('P03', 'Mouse', 'TechWorld', 'Karachi');
insert into products values ('P04', 'Keyboard', 'KeyMasters', 'Islamabad');
insert into products values ('P05', 'Monitor', 'VisionTech', 'Karachi');
insert into products values ('P06', 'Tablet', 'SmartWorld', 'Lahore');
insert into products values ('P07', 'Scanner', 'PrintCo', 'Lahore');
insert into products values ('P08', 'Headphones', 'SoundMax', 'Karachi');
insert into products values ('P09', 'Webcam', 'VisionTech', 'Karachi');
insert into products values ('P10', 'Projector', 'BrightTech', 'Islamabad');

insert into orders values (1001, 1, 'P01', 2);
insert into orders values (1002, 2, 'P02', 1);
insert into orders values (1003, 1, 'P03', 5);
insert into orders values (1004, 3, 'P04', 3);
insert into orders values (1005, 4, 'P05', 2);
insert into orders values (1006, 5, 'P06', 1);
insert into orders values (1007, 2, 'P07', 2);
insert into orders values (1008, 1, 'P08', 4);
insert into orders values (1009, 3, 'P09', 1);
insert into orders values (1010, 4, 'P10', 2);

select o.order_id, c.customer_name, c.customer_address, p.product_id, p.product_name, o.quantity, p.supplier_name, p.supplier_address 
from orders o join customers c on o.customer_id = c.customer_id join products p on o.product_id = p.product_id;

