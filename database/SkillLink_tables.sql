-- The steps done below are in order to auto increment the ids in each table when adding the records in order to avoid duplication
create sequence seq_users start with 1 increment by 1;
create sequence seq_skills start with 1 increment by 1;
create sequence seq_categories start with 1 increment by 1;
create sequence seq_projects start with 1 increment by 1;
create sequence seq_files start with 1 increment by 1;
create sequence seq_bids start with 1 increment by 1;
create sequence seq_contracts start with 1 increment by 1;
create sequence seq_payments start with 1 increment by 1;
create sequence seq_reviews start with 1 increment by 1;
create sequence seq_disputes start with 1 increment by 1;
create sequence seq_notifications start with 1 increment by 1;

create table users ( user_id number primary key, name varchar(100) not null, email varchar(100) unique not null, password varchar(100) not null, 
  phone varchar(20), created_at date default sysdate);

create table client_profile ( client_id number primary key, company_name varchar(100), location varchar(100),
  constraint fk_client foreign key (client_id) references users(user_id));

create table freelancer_profile (freelancer_id number primary key, bio varchar(500) not null, hourly_rate number(10,2), rating number(3,2) default 0,
  experience_level varchar(20), availability varchar(5), 
  constraint fk_freelancer foreign key (freelancer_id) references users(user_id));

create table skills (skill_id number primary key, name varchar(100) unique not null, category varchar(100));

create table user_skills (user_id number, skill_id number, primary key (user_id, skill_id),
  constraint fk_us_user foreign key (user_id) references users(user_id),
constraint fk_us_skill foreign key (skill_id) references skills(skill_id));

create table categories (category_id number primary key, name varchar(100) unique not null, description varchar(300));

create table projects (project_id number primary key, client_id number not null, title varchar(200) not null, description varchar(1000), 
  budget number(10,2) not null, deadline date, status varchar(20) default 'open', 
  constraint fk_proj_client foreign key (client_id) references client_profile(client_id));

create table project_category ( project_id number, category_id number, primary key (project_id, category_id),
  constraint fk_pc_proj foreign key (project_id) references projects(project_id),
  constraint fk_pc_cat foreign key (category_id) references categories(category_id));

create table project_files (file_id number primary key, project_id number not null, file_name varchar(200) not null,
  file_type varchar(50), upload_date date default sysdate, 
  constraint fk_pf_proj foreign key (project_id) references projects(project_id));

create table bids (bid_id number primary key, project_id number not null, freelancer_id number not null, amount number(10,2) not null, delivery_time number,
  status varchar(20) default 'pending', submitted_at date default sysdate, 
  constraint fk_bid_proj foreign key (project_id) references projects(project_id),
  constraint fk_bid_free foreign key (freelancer_id) references freelancer_profile(freelancer_id),
  constraint uq_bid unique (project_id, freelancer_id));

create table contracts (contract_id number primary key, bid_id number unique not null, amount number(10,2) not null, start_date date default sysdate,
  end_date date, status varchar(20) default 'active', 
  constraint fk_con_bid foreign key (bid_id) references bids(bid_id));

create table payments (payment_id number primary key, contract_id number not null, amount number(10,2) not null, pay_date date default sysdate,
  method varchar(20), status varchar(20) default 'pending', 
  constraint fk_pay_con foreign key (contract_id) references contracts(contract_id));

create table reviews (review_id number primary key, contract_id number not null, reviewer_id number not null, reviewee_id number not null,rating number not null,
  comment_r varchar(500), created_at date default sysdate, 
  constraint fk_rev_con foreign key (contract_id) references contracts(contract_id),
  constraint fk_rev_reviewer foreign key (reviewer_id) references users(user_id),
  constraint fk_rev_reviewee foreign key (reviewee_id) references users(user_id));

create table disputes (dispute_id number primary key, contract_id number not null, raised_by number not null, reason varchar(500),
  status varchar(20) default 'open', created_at date default sysdate,
  constraint fk_dis_con foreign key (contract_id) references contracts(contract_id),
  constraint fk_dis_user foreign key (raised_by) references users(user_id));

create table notifications (notification_id number primary key, user_id number not null, message varchar(500) not null, 
  date_sent date default sysdate, is_read varchar(1) default 'N', type varchar(50),
  constraint fk_notif_user foreign key (user_id) references users(user_id));


CREATE TABLE admins (admin_id NUMBER PRIMARY KEY, name VARCHAR2(100) NOT NULL, email VARCHAR2(100) UNIQUE NOT NULL, password VARCHAR2(100) NOT NULL, created_at DATE DEFAULT SYSDATE);

CREATE SEQUENCE seq_admins START WITH 1 INCREMENT BY 1;
SELECT * FROM admins;

 
