#!/usr/bin/env node
/**
 * seed-demo.js
 * Wipes and reseeds the Trackr demo account with realistic job-search data.
 *
 * Usage (run from the /api directory):
 *   node seed-demo.js
 *
 * Requirements: .env with MONGO_URI must exist in the /api directory.
 *
 * Seeded data:
 *   - 20 applications (4 Applied, 3 Phone Screen, 4 Technical, 3 Onsite,
 *                      2 Offer, 1 Accepted, 3 Rejected)
 *   - 39 contacts (1–3 per application, all linked)
 *   - 22 interviews (May 2026, weekdays, 9am–5pm ET, zero conflicts)
 */

'use strict';

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const mongoose = require('mongoose');
const User        = require('./models/User');
const Application = require('./models/Application');
const Contact     = require('./models/Contact');
const Interview   = require('./models/Interview');

const DEMO_EMAIL = 'trackrcop4331@gmail.com';

// ─── date helpers ────────────────────────────────────────────────────────────

/** Build a Date for a given "YYYY-MM-DD" at noon UTC (date-only fields). */
function ymd(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
}

/**
 * Build a Date for "YYYY-MM-DD" at `hourET`:mm US Eastern time.
 * May 2026 is EDT = UTC-4.
 */
function et(dateStr, hourET, minET = 0) {
  const utcHour = hourET + 4; // EDT offset
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, utcHour, minET, 0));
}

// ─── application data ────────────────────────────────────────────────────────

function buildApplications(userId) {
  return [
    // ── Applied × 4 ───────────────────────────────────────────────────────
    {
      user: userId, company: 'Apple', role: 'iOS Developer',
      status: 'Applied', location: 'Cupertino, CA',
      salaryMin: 120000, salaryMax: 150000,
      jobUrl: 'https://jobs.apple.com/ios-developer',
      dateApplied: ymd('2026-03-28'),
      notes: 'Referred by a friend on the SwiftUI team. Watch for recruiter email.',
    },
    {
      user: userId, company: 'Spotify', role: 'Mobile Engineer',
      status: 'Applied', location: 'New York, NY',
      salaryMin: 120000, salaryMax: 150000,
      jobUrl: 'https://www.lifeatspotify.com/jobs/mobile-engineer',
      dateApplied: ymd('2026-04-01'),
      notes: 'Applied through careers portal. Role focuses on iOS/Android streaming.',
    },
    {
      user: userId, company: 'Salesforce', role: 'Software Engineer',
      status: 'Applied', location: 'San Francisco, CA',
      salaryMin: 125000, salaryMax: 155000,
      jobUrl: 'https://careers.salesforce.com/software-engineer',
      dateApplied: ymd('2026-04-05'),
      notes: 'Submitted via LinkedIn Easy Apply. Follow up in 2 weeks if no response.',
    },
    {
      user: userId, company: 'DoorDash', role: 'Backend Engineer',
      status: 'Applied', location: 'San Francisco, CA',
      salaryMin: 120000, salaryMax: 150000,
      jobUrl: 'https://careers.doordash.com/backend-engineer',
      dateApplied: ymd('2026-04-10'),
      notes: 'Applied for the payments infrastructure team. Strong interest in real-time systems.',
    },

    // ── Phone Screen × 3 ──────────────────────────────────────────────────
    {
      user: userId, company: 'Amazon', role: 'SDE Intern',
      status: 'Phone Screen', location: 'Seattle, WA',
      salaryMin: 115000, salaryMax: 145000,
      jobUrl: 'https://amazon.jobs/sde-intern',
      dateApplied: ymd('2026-03-15'),
      notes: 'Phone screen scheduled May 6. Review Leadership Principles and system design basics.',
    },
    {
      user: userId, company: 'Uber', role: 'Platform Engineer',
      status: 'Phone Screen', location: 'San Francisco, CA',
      salaryMin: 125000, salaryMax: 155000,
      jobUrl: 'https://www.uber.com/us/en/careers/platform-engineer',
      dateApplied: ymd('2026-03-20'),
      notes: 'Uber recruiter reached out on LinkedIn. Strong interest in real-time dispatch systems.',
    },
    {
      user: userId, company: 'Figma', role: 'Software Engineer',
      status: 'Phone Screen', location: 'San Francisco, CA',
      salaryMin: 130000, salaryMax: 165000,
      jobUrl: 'https://www.figma.com/careers/software-engineer',
      dateApplied: ymd('2026-03-25'),
      notes: "Admire Figma's multiplayer architecture. Brush up on CRDTs before phone screen.",
    },

    // ── Technical × 4 ─────────────────────────────────────────────────────
    {
      user: userId, company: 'Meta', role: 'Frontend Engineer Intern',
      status: 'Technical', location: 'Menlo Park, CA',
      salaryMin: 125000, salaryMax: 155000,
      jobUrl: 'https://www.metacareers.com/frontend-engineer',
      dateApplied: ymd('2026-03-01'),
      notes: 'Passed phone screen. Technical round covers React internals and performance profiling.',
    },
    {
      user: userId, company: 'Stripe', role: 'Backend Engineer',
      status: 'Technical', location: 'San Francisco, CA',
      salaryMin: 135000, salaryMax: 165000,
      jobUrl: 'https://stripe.com/jobs/backend-engineer',
      dateApplied: ymd('2026-03-05'),
      notes: "Strong focus on reliability and distributed systems. Know Stripe's API design philosophy.",
    },
    {
      user: userId, company: 'LinkedIn', role: 'Software Engineer',
      status: 'Technical', location: 'Sunnyvale, CA',
      salaryMin: 130000, salaryMax: 160000,
      jobUrl: 'https://careers.linkedin.com/software-engineer',
      dateApplied: ymd('2026-03-08'),
      notes: 'Technical interview scheduled May 14. Graph algorithms very likely — review BFS/DFS.',
    },
    {
      user: userId, company: 'NVIDIA', role: 'ML Engineer',
      status: 'Technical', location: 'Santa Clara, CA',
      salaryMin: 140000, salaryMax: 175000,
      jobUrl: 'https://nvidia.wd5.myworkdayjobs.com/ml-engineer',
      dateApplied: ymd('2026-03-10'),
      notes: 'Review CUDA programming and ML system design. Strong culture fit from recruiter call.',
    },

    // ── Onsite × 3 ────────────────────────────────────────────────────────
    {
      user: userId, company: 'Google', role: 'Software Engineer',
      status: 'Onsite', location: 'San Francisco, CA',
      salaryMin: 130000, salaryMax: 160000,
      jobUrl: 'https://careers.google.com/software-engineer',
      dateApplied: ymd('2026-02-15'),
      notes: 'Onsite loop on May 19 — 4 rounds. Practice Leetcode hard + system design.',
    },
    {
      user: userId, company: 'Airbnb', role: 'Software Engineer',
      status: 'Onsite', location: 'San Francisco, CA',
      salaryMin: 128000, salaryMax: 158000,
      jobUrl: 'https://careers.airbnb.com/software-engineer',
      dateApplied: ymd('2026-02-20'),
      notes: 'Onsite on May 20. Airbnb values cross-functional collab. Prep behaviorals.',
    },
    {
      user: userId, company: 'Adobe', role: 'Frontend Developer',
      status: 'Onsite', location: 'San Jose, CA',
      salaryMin: 120000, salaryMax: 150000,
      jobUrl: 'https://adobe.com/careers/frontend-developer',
      dateApplied: ymd('2026-02-25'),
      notes: 'Final onsite on May 21. Focus on web accessibility and Canvas API performance.',
    },

    // ── Offer × 2 ─────────────────────────────────────────────────────────
    {
      user: userId, company: 'Microsoft', role: 'Software Engineer',
      status: 'Offer', location: 'Redmond, WA',
      salaryMin: 130000, salaryMax: 160000,
      jobUrl: 'https://careers.microsoft.com/software-engineer',
      dateApplied: ymd('2026-02-01'),
      notes: 'Received offer: $145k base + RSUs. Deadline May 30. Comparing with Snowflake.',
    },
    {
      user: userId, company: 'Snowflake', role: 'Data Engineer',
      status: 'Offer', location: 'San Mateo, CA',
      salaryMin: 135000, salaryMax: 165000,
      jobUrl: 'https://careers.snowflake.com/data-engineer',
      dateApplied: ymd('2026-02-05'),
      notes: 'Offer: $155k + strong equity. High-growth company. Deadline May 28.',
    },

    // ── Accepted × 1 ──────────────────────────────────────────────────────
    {
      user: userId, company: 'Dropbox', role: 'Software Engineer',
      status: 'Accepted', location: 'San Francisco, CA',
      salaryMin: 125000, salaryMax: 155000,
      jobUrl: 'https://dropbox.com/jobs/software-engineer',
      dateApplied: ymd('2026-01-20'),
      notes: 'Accepted offer! Start date June 9. Team: Core Platform. Super excited.',
    },

    // ── Rejected × 3 ──────────────────────────────────────────────────────
    {
      user: userId, company: 'Netflix', role: 'Full Stack Engineer',
      status: 'Rejected', location: 'Los Gatos, CA',
      salaryMin: 140000, salaryMax: 180000,
      jobUrl: 'https://jobs.netflix.com/full-stack-engineer',
      dateApplied: ymd('2026-01-15'),
      notes: 'Rejected after technical round. Need to study dynamic programming more thoroughly.',
    },
    {
      user: userId, company: 'Twitter/X', role: 'Backend Developer',
      status: 'Rejected', location: 'San Francisco, CA',
      salaryMin: 115000, salaryMax: 145000,
      jobUrl: 'https://careers.x.com/backend-developer',
      dateApplied: ymd('2026-01-18'),
      notes: 'Rejected after phone screen. Lacked experience with large-scale C++ systems.',
    },
    {
      user: userId, company: 'Slack', role: 'Product Engineer',
      status: 'Rejected', location: 'San Francisco, CA',
      salaryMin: 120000, salaryMax: 150000,
      jobUrl: 'https://slack.com/careers/product-engineer',
      dateApplied: ymd('2026-01-22'),
      notes: 'Rejected post-onsite. Product sense round was weak — practice case studies.',
    },
  ];
}

// ─── contact data ────────────────────────────────────────────────────────────

function buildContacts(userId, appMap) {
  const A = (company, role) => appMap[`${company}|${role}`];

  return [
    // ── Google (3) ────────────────────────────────────────────────────────
    {
      user: userId, application: A('Google', 'Software Engineer'),
      name: 'Priya Nair', role: 'Technical Recruiter', company: 'Google',
      email: 'priya.nair@google.com', phone: '+1 650-253-0001',
      linkedIn: 'https://linkedin.com/in/priya-nair-google',
      notes: 'Primary recruiter. Very responsive — usually replies within the day.',
    },
    {
      user: userId, application: A('Google', 'Software Engineer'),
      name: 'James Park', role: 'Senior Software Engineer', company: 'Google',
      email: 'james.park@google.com', phone: '+1 650-253-0002',
      linkedIn: 'https://linkedin.com/in/james-park-swe',
      notes: 'Hiring manager for the Search Infra team. Had a coffee chat on Apr 30.',
    },
    {
      user: userId, application: A('Google', 'Software Engineer'),
      name: 'Sarah Chen', role: 'Recruiting Coordinator', company: 'Google',
      email: 'sarah.chen@google.com',
      linkedIn: 'https://linkedin.com/in/sarah-chen-recruiter',
      notes: 'Coordinates all interview logistics. Point of contact for onsite day.',
    },

    // ── Meta (2) ──────────────────────────────────────────────────────────
    {
      user: userId, application: A('Meta', 'Frontend Engineer Intern'),
      name: 'Alex Rivera', role: 'University Recruiter', company: 'Meta',
      email: 'alex.rivera@meta.com', phone: '+1 650-543-4800',
      linkedIn: 'https://linkedin.com/in/alex-rivera-meta',
      notes: 'Met at UCF career fair. Very helpful — sent CoderPad practice links.',
    },
    {
      user: userId, application: A('Meta', 'Frontend Engineer Intern'),
      name: 'David Kim', role: 'Engineering Manager', company: 'Meta',
      email: 'david.kim@meta.com',
      linkedIn: 'https://linkedin.com/in/david-kim-meta-em',
      notes: 'Manages the News Feed performance team. Interviewing for his org.',
    },

    // ── Apple (1) ─────────────────────────────────────────────────────────
    {
      user: userId, application: A('Apple', 'iOS Developer'),
      name: 'Emily Watson', role: 'Technical Recruiter', company: 'Apple',
      email: 'emily.watson@apple.com', phone: '+1 408-996-1010',
      linkedIn: 'https://linkedin.com/in/emily-watson-apple',
      notes: 'Initial contact via LinkedIn. Waiting for recruiter screen slot.',
    },

    // ── Amazon (2) ────────────────────────────────────────────────────────
    {
      user: userId, application: A('Amazon', 'SDE Intern'),
      name: 'Jessica Lee', role: 'Recruiting Coordinator', company: 'Amazon',
      email: 'jessica.lee@amazon.com', phone: '+1 206-266-1000',
      linkedIn: 'https://linkedin.com/in/jessica-lee-amazon',
      notes: 'Phone screen coordinator. Sent Chime link for May 6 call.',
    },
    {
      user: userId, application: A('Amazon', 'SDE Intern'),
      name: 'Marcus Thompson', role: 'Senior Hiring Manager', company: 'Amazon',
      email: 'marcus.thompson@amazon.com',
      linkedIn: 'https://linkedin.com/in/marcus-thompson-amzn',
      notes: 'Bar Raiser for the S3 team. Know all 16 Leadership Principles.',
    },

    // ── Microsoft (3) ─────────────────────────────────────────────────────
    {
      user: userId, application: A('Microsoft', 'Software Engineer'),
      name: 'Rachel Green', role: 'University Recruiter', company: 'Microsoft',
      email: 'rachel.green@microsoft.com', phone: '+1 425-882-8080',
      linkedIn: 'https://linkedin.com/in/rachel-green-msft',
      notes: 'Main recruiter. Called with offer details on May 13.',
    },
    {
      user: userId, application: A('Microsoft', 'Software Engineer'),
      name: 'Tom Bradley', role: 'Engineering Manager', company: 'Microsoft',
      email: 'tom.bradley@microsoft.com',
      linkedIn: 'https://linkedin.com/in/tom-bradley-msft',
      notes: 'EM for Azure DevOps team. Interview went very positively.',
    },
    {
      user: userId, application: A('Microsoft', 'Software Engineer'),
      name: 'Sandra Wu', role: 'Director of Engineering', company: 'Microsoft',
      email: 'sandra.wu@microsoft.com',
      linkedIn: 'https://linkedin.com/in/sandra-wu-msft',
      notes: 'Skip-level director. Gave glowing feedback after onsite panel.',
    },

    // ── Netflix (2) ───────────────────────────────────────────────────────
    {
      user: userId, application: A('Netflix', 'Full Stack Engineer'),
      name: 'Kevin Martinez', role: 'Senior Recruiter', company: 'Netflix',
      email: 'kevin.martinez@netflix.com', phone: '+1 408-540-3700',
      linkedIn: 'https://linkedin.com/in/kevin-martinez-netflix',
      notes: 'Sent rejection email Apr 2. Suggested applying again in 6 months.',
    },
    {
      user: userId, application: A('Netflix', 'Full Stack Engineer'),
      name: 'Lisa Johnson', role: 'Engineering Lead', company: 'Netflix',
      email: 'lisa.johnson@netflix.com',
      linkedIn: 'https://linkedin.com/in/lisa-johnson-netflix',
      notes: 'Interviewed for Playback Experience team. Heavy DP focus in coding round.',
    },

    // ── Stripe (2) ────────────────────────────────────────────────────────
    {
      user: userId, application: A('Stripe', 'Backend Engineer'),
      name: 'Michael Brown', role: 'Technical Recruiter', company: 'Stripe',
      email: 'michael.brown@stripe.com', phone: '+1 415-901-3310',
      linkedIn: 'https://linkedin.com/in/michael-brown-stripe',
      notes: "Great recruiter — sent a detailed prep guide and Stripe's engineering values doc.",
    },
    {
      user: userId, application: A('Stripe', 'Backend Engineer'),
      name: 'Aisha Patel', role: 'Senior Engineer', company: 'Stripe',
      email: 'aisha.patel@stripe.com',
      linkedIn: 'https://linkedin.com/in/aisha-patel-stripe',
      notes: 'Will interview on May 13. Worked on Stripe Connect and payouts infrastructure.',
    },

    // ── Airbnb (3) ────────────────────────────────────────────────────────
    {
      user: userId, application: A('Airbnb', 'Software Engineer'),
      name: 'Chris Taylor', role: 'University Recruiter', company: 'Airbnb',
      email: 'chris.taylor@airbnb.com', phone: '+1 415-800-5959',
      linkedIn: 'https://linkedin.com/in/chris-taylor-airbnb',
      notes: 'Coordinating all Airbnb rounds. Very organized, sends timely reminders.',
    },
    {
      user: userId, application: A('Airbnb', 'Software Engineer'),
      name: 'Megan Foster', role: 'Tech Lead', company: 'Airbnb',
      email: 'megan.foster@airbnb.com',
      linkedIn: 'https://linkedin.com/in/megan-foster-airbnb',
      notes: 'Technical interviewer May 13. Focus on booking system design and idempotency.',
    },
    {
      user: userId, application: A('Airbnb', 'Software Engineer'),
      name: 'Daniel Wright', role: 'Hiring Manager', company: 'Airbnb',
      email: 'daniel.wright@airbnb.com',
      linkedIn: 'https://linkedin.com/in/daniel-wright-airbnb',
      notes: 'Onsite day lead May 20. Will cover team culture and project expectations.',
    },

    // ── Spotify (1) ───────────────────────────────────────────────────────
    {
      user: userId, application: A('Spotify', 'Mobile Engineer'),
      name: 'Sophie Anderson', role: 'University Recruiter', company: 'Spotify',
      email: 'sophie.anderson@spotify.com', phone: '+1 212-314-1000',
      linkedIn: 'https://linkedin.com/in/sophie-anderson-spotify',
      notes: 'Connected on LinkedIn. Application currently under review.',
    },

    // ── Uber (2) ──────────────────────────────────────────────────────────
    {
      user: userId, application: A('Uber', 'Platform Engineer'),
      name: 'Ryan Clark', role: 'University Recruiter', company: 'Uber',
      email: 'ryan.clark@uber.com', phone: '+1 415-612-8582',
      linkedIn: 'https://linkedin.com/in/ryan-clark-uber',
      notes: 'Reached out on LinkedIn first. Phone screen scheduled May 7.',
    },
    {
      user: userId, application: A('Uber', 'Platform Engineer'),
      name: 'Nina Shah', role: 'Engineering Lead', company: 'Uber',
      email: 'nina.shah@uber.com',
      linkedIn: 'https://linkedin.com/in/nina-shah-uber',
      notes: 'Works on the real-time dispatch infrastructure team.',
    },

    // ── LinkedIn (2) ──────────────────────────────────────────────────────
    {
      user: userId, application: A('LinkedIn', 'Software Engineer'),
      name: 'Brandon Hayes', role: 'Technical Recruiter', company: 'LinkedIn',
      email: 'brandon.hayes@linkedin.com', phone: '+1 650-687-3600',
      linkedIn: 'https://linkedin.com/in/brandon-hayes-linkedin',
      notes: 'Very communicative. Technical screen scheduled May 7.',
    },
    {
      user: userId, application: A('LinkedIn', 'Software Engineer'),
      name: 'Jenny Liu', role: 'Senior Software Engineer', company: 'LinkedIn',
      email: 'jenny.liu@linkedin.com',
      linkedIn: 'https://linkedin.com/in/jenny-liu-lnkd',
      notes: 'Technical interviewer May 14. Works on the Economic Graph team.',
    },

    // ── Twitter/X (1) ─────────────────────────────────────────────────────
    {
      user: userId, application: A('Twitter/X', 'Backend Developer'),
      name: 'Tyler Chen', role: 'Recruiter', company: 'X (Twitter)',
      email: 'tyler.chen@x.com', phone: '+1 415-222-9670',
      linkedIn: 'https://linkedin.com/in/tyler-chen-x',
      notes: 'Rejection came quickly after phone screen. Move on.',
    },

    // ── Salesforce (1) ────────────────────────────────────────────────────
    {
      user: userId, application: A('Salesforce', 'Software Engineer'),
      name: 'Patricia Moore', role: 'Technical Sourcer', company: 'Salesforce',
      email: 'patricia.moore@salesforce.com', phone: '+1 415-901-7000',
      linkedIn: 'https://linkedin.com/in/patricia-moore-sfdc',
      notes: 'Sourced via LinkedIn. No recruiter screen scheduled yet.',
    },

    // ── Adobe (3) ─────────────────────────────────────────────────────────
    {
      user: userId, application: A('Adobe', 'Frontend Developer'),
      name: 'Carlos Rodriguez', role: 'University Recruiter', company: 'Adobe',
      email: 'carlos.rodriguez@adobe.com', phone: '+1 408-536-6000',
      linkedIn: 'https://linkedin.com/in/carlos-rodriguez-adobe',
      notes: 'Organized all Adobe rounds efficiently. Onsite confirmed May 21.',
    },
    {
      user: userId, application: A('Adobe', 'Frontend Developer'),
      name: 'Hannah Kim', role: 'Hiring Manager', company: 'Adobe',
      email: 'hannah.kim@adobe.com',
      linkedIn: 'https://linkedin.com/in/hannah-kim-adobe',
      notes: 'Leads onsite panel. Heavy focus on accessibility and creative tools.',
    },
    {
      user: userId, application: A('Adobe', 'Frontend Developer'),
      name: 'Joshua Park', role: 'Tech Lead', company: 'Adobe',
      email: 'joshua.park@adobe.com',
      linkedIn: 'https://linkedin.com/in/joshua-park-adobe',
      notes: 'Technical interviewer May 14. Canvas API and WebGL expert.',
    },

    // ── NVIDIA (2) ────────────────────────────────────────────────────────
    {
      user: userId, application: A('NVIDIA', 'ML Engineer'),
      name: 'Grace Zhao', role: 'Technical Recruiter', company: 'NVIDIA',
      email: 'grace.zhao@nvidia.com', phone: '+1 408-486-2000',
      linkedIn: 'https://linkedin.com/in/grace-zhao-nvidia',
      notes: 'Phone screen May 8. Very enthusiastic about the ML systems role.',
    },
    {
      user: userId, application: A('NVIDIA', 'ML Engineer'),
      name: 'Arjun Mehta', role: 'Research Scientist', company: 'NVIDIA',
      email: 'arjun.mehta@nvidia.com',
      linkedIn: 'https://linkedin.com/in/arjun-mehta-nvidia',
      notes: 'Technical interviewer May 15. Published papers on transformer optimization.',
    },

    // ── Dropbox (2) ───────────────────────────────────────────────────────
    {
      user: userId, application: A('Dropbox', 'Software Engineer'),
      name: 'Olivia Turner', role: 'University Recruiter', company: 'Dropbox',
      email: 'olivia.turner@dropbox.com', phone: '+1 415-857-6800',
      linkedIn: 'https://linkedin.com/in/olivia-turner-dropbox',
      notes: 'Sent and confirmed offer letter. Start date June 9.',
    },
    {
      user: userId, application: A('Dropbox', 'Software Engineer'),
      name: 'Ethan Brooks', role: 'Engineering Manager', company: 'Dropbox',
      email: 'ethan.brooks@dropbox.com',
      linkedIn: 'https://linkedin.com/in/ethan-brooks-dropbox',
      notes: 'Future manager. Had a great 1:1 during onsite day. Team of 8 engineers.',
    },

    // ── Slack (1) ─────────────────────────────────────────────────────────
    {
      user: userId, application: A('Slack', 'Product Engineer'),
      name: 'Isabella Davis', role: 'Recruiter', company: 'Slack',
      email: 'isabella.davis@slack.com', phone: '+1 415-630-7943',
      linkedIn: 'https://linkedin.com/in/isabella-davis-slack',
      notes: 'Rejection received Mar 15 post-onsite. Feedback: weak product sense.',
    },

    // ── Figma (2) ─────────────────────────────────────────────────────────
    {
      user: userId, application: A('Figma', 'Software Engineer'),
      name: 'Nathan Evans', role: 'Technical Recruiter', company: 'Figma',
      email: 'nathan.evans@figma.com', phone: '+1 415-800-4300',
      linkedIn: 'https://linkedin.com/in/nathan-evans-figma',
      notes: 'Phone screen May 8 at 2pm ET. Prep collaborative editing concepts.',
    },
    {
      user: userId, application: A('Figma', 'Software Engineer'),
      name: 'Chloe Wilson', role: 'Design Engineer', company: 'Figma',
      email: 'chloe.wilson@figma.com',
      linkedIn: 'https://linkedin.com/in/chloe-wilson-figma',
      notes: 'Works on the rendering engine. Potential future teammate.',
    },

    // ── Snowflake (3) ─────────────────────────────────────────────────────
    {
      user: userId, application: A('Snowflake', 'Data Engineer'),
      name: 'Andrew Jackson', role: 'University Recruiter', company: 'Snowflake',
      email: 'andrew.jackson@snowflake.com', phone: '+1 650-632-5306',
      linkedIn: 'https://linkedin.com/in/andrew-jackson-snowflake',
      notes: 'Called with verbal offer May 15. Written offer sent May 16. Deadline May 28.',
    },
    {
      user: userId, application: A('Snowflake', 'Data Engineer'),
      name: 'Vanessa Long', role: 'Engineering Manager', company: 'Snowflake',
      email: 'vanessa.long@snowflake.com',
      linkedIn: 'https://linkedin.com/in/vanessa-long-snowflake',
      notes: 'EM for Data Ingestion team. Very mission-driven interview style.',
    },
    {
      user: userId, application: A('Snowflake', 'Data Engineer'),
      name: 'Robert Harris', role: 'Director of Engineering', company: 'Snowflake',
      email: 'robert.harris@snowflake.com',
      linkedIn: 'https://linkedin.com/in/robert-harris-snowflake',
      notes: 'Director-level interview during onsite. Asked about long-term engineering vision.',
    },

    // ── DoorDash (1) ──────────────────────────────────────────────────────
    {
      user: userId, application: A('DoorDash', 'Backend Engineer'),
      name: 'Michelle Scott', role: 'Technical Recruiter', company: 'DoorDash',
      email: 'michelle.scott@doordash.com', phone: '+1 415-503-3000',
      linkedIn: 'https://linkedin.com/in/michelle-scott-doordash',
      notes: 'Application acknowledged. Recruiter screen still pending.',
    },
  ];
}

// ─── interview data ──────────────────────────────────────────────────────────
//
// 22 interviews across May 2026 weekdays, 9am–5pm ET (EDT = UTC-4).
// Schedule verified conflict-free — no two interviews share the same timestamp.
//
// May 5  (Tue): 10am Meta-Phone,     2pm  Google-Phone
// May 6  (Wed): 10am Amazon-Phone,   2pm  Stripe-Phone,     4pm Airbnb-Phone
// May 7  (Thu):  9am Adobe-Phone,   11am  Uber-Phone,       3pm LinkedIn-Phone
// May 8  (Fri): 11am NVIDIA-Phone,   2pm  Figma-Phone
// May 12 (Tue): 10am Google-Tech,    2pm  Meta-Tech
// May 13 (Wed): 10am MSFT-Offer,    11am  Stripe-Tech,      3pm Airbnb-Tech
// May 14 (Thu): 10am LinkedIn-Tech,  3pm  Adobe-Tech
// May 15 (Fri): 11am SNOW-Offer,     2pm  NVIDIA-Tech
// May 19 (Mon):  9am Google-Onsite
// May 20 (Tue): 10am Airbnb-Onsite
// May 21 (Wed): 11am Adobe-Onsite

function buildInterviews(userId, appMap) {
  const A = (company, role) => appMap[`${company}|${role}`];

  return [
    // ── Amazon — Phone Screen (1) ─────────────────────────────────────────
    {
      user: userId, application: A('Amazon', 'SDE Intern'),
      scheduledAt: et('2026-05-06', 10), type: 'Phone',
      interviewerName: 'Jessica Lee', interviewerRole: 'Recruiting Coordinator',
      location: 'Amazon Chime (link in confirmation email)',
      prepNotes: 'Review Leadership Principles. Practice coding in Python. Expect 1 behavioral + 1 coding question. 45 min.',
    },

    // ── Uber — Phone Screen (1) ───────────────────────────────────────────
    {
      user: userId, application: A('Uber', 'Platform Engineer'),
      scheduledAt: et('2026-05-07', 11), type: 'Phone',
      interviewerName: 'Ryan Clark', interviewerRole: 'University Recruiter',
      location: 'Google Meet (link sent via email)',
      prepNotes: 'Intro call — background, motivation, culture fit. 30 minutes. Be ready to discuss real-time systems interest.',
    },

    // ── Figma — Phone Screen (1) ──────────────────────────────────────────
    {
      user: userId, application: A('Figma', 'Software Engineer'),
      scheduledAt: et('2026-05-08', 14), type: 'Phone',
      interviewerName: 'Nathan Evans', interviewerRole: 'Technical Recruiter',
      location: 'Zoom (link TBD)',
      prepNotes: "Recruiter screen. Be ready to discuss Figma's multiplayer model, why Figma, and your strongest project.",
    },

    // ── Meta — Technical (2) ──────────────────────────────────────────────
    {
      user: userId, application: A('Meta', 'Frontend Engineer Intern'),
      scheduledAt: et('2026-05-05', 10), type: 'Phone',
      interviewerName: 'Alex Rivera', interviewerRole: 'University Recruiter',
      location: 'WhatsApp Video Call',
      prepNotes: 'Technical phone screen. Expect 1–2 coding questions on arrays/strings. CoderPad environment.',
      rating: 4,
      reflection: 'Went well. One medium array problem solved optimally. Alex seemed pleased with the explanation.',
    },
    {
      user: userId, application: A('Meta', 'Frontend Engineer Intern'),
      scheduledAt: et('2026-05-12', 14), type: 'Technical',
      interviewerName: 'David Kim', interviewerRole: 'Engineering Manager',
      location: 'CoderPad (virtual)',
      prepNotes: 'Full technical round. React internals, reconciliation algorithm, perf optimization. May include system design.',
    },

    // ── Stripe — Technical (2) ────────────────────────────────────────────
    {
      user: userId, application: A('Stripe', 'Backend Engineer'),
      scheduledAt: et('2026-05-06', 14), type: 'Phone',
      interviewerName: 'Michael Brown', interviewerRole: 'Technical Recruiter',
      location: 'Stripe Zoom',
      prepNotes: 'Technical screen. Distributed systems and reliability focus. 45 min coding, expect 2 problems.',
      rating: 5,
      reflection: 'Best phone screen yet. Solved both problems with time to spare. Michael was very encouraging.',
    },
    {
      user: userId, application: A('Stripe', 'Backend Engineer'),
      scheduledAt: et('2026-05-13', 11), type: 'Technical',
      interviewerName: 'Aisha Patel', interviewerRole: 'Senior Engineer',
      location: 'Stripe HQ, 354 Oyster Point Blvd — Room 4B',
      prepNotes: "Deep technical round. API design question + coding. Read Stripe's engineering blog on idempotency keys.",
    },

    // ── LinkedIn — Technical (2) ──────────────────────────────────────────
    {
      user: userId, application: A('LinkedIn', 'Software Engineer'),
      scheduledAt: et('2026-05-07', 15), type: 'Phone',
      interviewerName: 'Brandon Hayes', interviewerRole: 'Technical Recruiter',
      location: 'Microsoft Teams',
      prepNotes: 'Technical phone screen. Graph algorithms very likely. Review BFS/DFS and shortest path algorithms.',
      rating: 3,
      reflection: 'Decent — struggled briefly with the graph problem but recovered. Passed to technical round.',
    },
    {
      user: userId, application: A('LinkedIn', 'Software Engineer'),
      scheduledAt: et('2026-05-14', 10), type: 'Technical',
      interviewerName: 'Jenny Liu', interviewerRole: 'Senior Software Engineer',
      location: 'LinkedIn Sunnyvale Office — 1000 W Maude Ave, Room 210',
      prepNotes: "Full technical: coding + system design for a social graph feature. Review LinkedIn's feed ranking architecture.",
    },

    // ── NVIDIA — Technical (2) ────────────────────────────────────────────
    {
      user: userId, application: A('NVIDIA', 'ML Engineer'),
      scheduledAt: et('2026-05-08', 11), type: 'Phone',
      interviewerName: 'Grace Zhao', interviewerRole: 'Technical Recruiter',
      location: 'Google Meet',
      prepNotes: 'Technical screen. Expect ML fundamentals (backprop, transformers) + 1 coding problem.',
      rating: 4,
      reflection: 'Solid round. Explained backpropagation clearly. DP problem went well. Moving to technical.',
    },
    {
      user: userId, application: A('NVIDIA', 'ML Engineer'),
      scheduledAt: et('2026-05-15', 14), type: 'Technical',
      interviewerName: 'Arjun Mehta', interviewerRole: 'Research Scientist',
      location: 'NVIDIA HQ — 2788 San Tomas Expy, Santa Clara, Building D',
      prepNotes: "Deep ML technical. CUDA basics, transformer architecture, distributed training. Review Arjun's papers on attention.",
    },

    // ── Google — Onsite (3) ───────────────────────────────────────────────
    {
      user: userId, application: A('Google', 'Software Engineer'),
      scheduledAt: et('2026-05-05', 14), type: 'Phone',
      interviewerName: 'Priya Nair', interviewerRole: 'Technical Recruiter',
      location: 'Google Meet',
      prepNotes: 'Technical phone screen — 2 medium/hard coding questions in 45 min. Use Python or Go.',
      rating: 4,
      reflection: 'Two graph problems. Solved first optimally, got brute force + partial optimization on second. Passed.',
    },
    {
      user: userId, application: A('Google', 'Software Engineer'),
      scheduledAt: et('2026-05-12', 10), type: 'Technical',
      interviewerName: 'James Park', interviewerRole: 'Senior Software Engineer',
      location: 'Google Meet',
      prepNotes: 'Virtual technical round. System design: design a distributed key-value store. Cover sharding and replication.',
      rating: 4,
      reflection: 'System design went great — covered sharding, replication, consistency models. Tree coding problem was clean.',
    },
    {
      user: userId, application: A('Google', 'Software Engineer'),
      scheduledAt: et('2026-05-19', 9), type: 'Onsite',
      interviewerName: 'Sarah Chen', interviewerRole: 'Recruiting Coordinator',
      location: 'Google San Francisco — 345 Spear St, 8th Floor',
      prepNotes: '4-round onsite: 2× coding (LC hard), 1× system design, 1× behavioral (Googleyness). Full day 9am–4pm. Bring ID.',
    },

    // ── Airbnb — Onsite (3) ───────────────────────────────────────────────
    {
      user: userId, application: A('Airbnb', 'Software Engineer'),
      scheduledAt: et('2026-05-06', 16), type: 'Phone',
      interviewerName: 'Chris Taylor', interviewerRole: 'University Recruiter',
      location: 'Zoom',
      prepNotes: "Recruiter screen + 1 light coding question. Discuss passion for Airbnb's mission of belonging.",
      rating: 5,
      reflection: 'Chris was fantastic. Easy string problem. Talked 30 min about culture. Very enthusiastic response.',
    },
    {
      user: userId, application: A('Airbnb', 'Software Engineer'),
      scheduledAt: et('2026-05-13', 15), type: 'Technical',
      interviewerName: 'Megan Foster', interviewerRole: 'Tech Lead',
      location: 'Zoom (CoderPad)',
      prepNotes: 'System design + coding. Focus on booking/reservation system design. Cover idempotency, double-booking prevention.',
      rating: 4,
      reflection: 'Really enjoyed the reservation system discussion. Megan asked excellent follow-up questions on edge cases.',
    },
    {
      user: userId, application: A('Airbnb', 'Software Engineer'),
      scheduledAt: et('2026-05-20', 10), type: 'Onsite',
      interviewerName: 'Daniel Wright', interviewerRole: 'Hiring Manager',
      location: 'Airbnb HQ — 888 Brannan St, San Francisco',
      prepNotes: '5 rounds: 2× coding, 1× system design, 1× cross-functional collaboration, 1× HM. Review Airbnb engineering blog.',
    },

    // ── Adobe — Onsite (3) ────────────────────────────────────────────────
    {
      user: userId, application: A('Adobe', 'Frontend Developer'),
      scheduledAt: et('2026-05-07', 9), type: 'Phone',
      interviewerName: 'Carlos Rodriguez', interviewerRole: 'University Recruiter',
      location: 'Google Meet',
      prepNotes: 'Recruiter phone screen. Be ready to discuss WCAG accessibility, CSS animations, and Canvas API projects.',
      rating: 4,
      reflection: 'Carlos appreciated accessibility experience from Trackr. DOM manipulation coding question was straightforward.',
    },
    {
      user: userId, application: A('Adobe', 'Frontend Developer'),
      scheduledAt: et('2026-05-14', 15), type: 'Technical',
      interviewerName: 'Joshua Park', interviewerRole: 'Tech Lead',
      location: 'Zoom',
      prepNotes: 'Technical round: Canvas API, WebGL basics, CSS animation performance, browser rendering pipeline. Bring portfolio.',
    },
    {
      user: userId, application: A('Adobe', 'Frontend Developer'),
      scheduledAt: et('2026-05-21', 11), type: 'Onsite',
      interviewerName: 'Hannah Kim', interviewerRole: 'Hiring Manager',
      location: 'Adobe HQ — 345 Park Ave, San Jose, CA',
      prepNotes: '4 rounds including a panel with designers. Accessibility focus throughout. Bring portfolio on laptop.',
    },

    // ── Microsoft — Offer Call (1) ────────────────────────────────────────
    {
      user: userId, application: A('Microsoft', 'Software Engineer'),
      scheduledAt: et('2026-05-13', 10), type: 'Phone',
      interviewerName: 'Rachel Green', interviewerRole: 'University Recruiter',
      location: 'Microsoft Teams',
      prepNotes: 'Offer call — discuss $145k base, RSU grant, start date options, team placement.',
      rating: 5,
      reflection: 'Rachel presented $145k base + $25k RSUs/yr. Considering negotiating sign-on bonus. Deadline May 30.',
    },

    // ── Snowflake — Offer Call (1) ────────────────────────────────────────
    {
      user: userId, application: A('Snowflake', 'Data Engineer'),
      scheduledAt: et('2026-05-15', 11), type: 'Phone',
      interviewerName: 'Andrew Jackson', interviewerRole: 'University Recruiter',
      location: 'Zoom',
      prepNotes: 'Verbal offer call. $155k base + equity. Deadline May 28. Will compare total comp with Microsoft.',
      rating: 5,
      reflection: 'Great call. Andrew confirmed 4-year vesting schedule with 1-year cliff. Strong total comp. Hard decision.',
    },
  ];
}

// ─── main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🌱  Trackr Demo Seed Script');
  console.log('═══════════════════════════════════════════\n');

  // 1. Connect to MongoDB
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    console.error('❌  MONGODB_URI is not set. Ensure .env exists in /api.');
    process.exit(1);
  }
  await mongoose.connect(uri);
  console.log('✅  Connected to MongoDB\n');

  // 2. Find demo user
  const user = await User.findOne({ email: DEMO_EMAIL.toLowerCase() });
  if (!user) {
    console.error(`❌  Demo user not found: ${DEMO_EMAIL}`);
    console.error('    Register the account via the app first, then re-run this script.');
    await mongoose.disconnect();
    process.exit(1);
  }
  console.log(`✅  Found user: ${user.firstName} ${user.lastName} <${user.email}>`);

  // 3. Verify account (use updateOne to avoid triggering the password pre-save hook)
  await User.updateOne(
    { _id: user._id },
    {
      $set: { isVerified: true },
      $unset: { verificationToken: '', verificationTokenExpiry: '' },
    }
  );
  console.log('✅  Account verified\n');

  const userId = user._id;

  // 4. Wipe all existing data for this user
  const [delApps, delContacts, delInterviews] = await Promise.all([
    Application.deleteMany({ user: userId }),
    Contact.deleteMany({ user: userId }),
    Interview.deleteMany({ user: userId }),
  ]);
  console.log(
    `🗑️   Wiped: ${delApps.deletedCount} applications, ` +
    `${delContacts.deletedCount} contacts, ` +
    `${delInterviews.deletedCount} interviews\n`
  );

  // 5. Insert applications
  const appDefs = buildApplications(userId);
  const insertedApps = await Application.insertMany(appDefs, { ordered: true });
  console.log(`📋  Inserted ${insertedApps.length} applications`);

  // Build lookup map: "Company|Role" → ObjectId
  const appMap = {};
  for (const a of insertedApps) {
    appMap[`${a.company}|${a.role}`] = a._id;
  }

  // 6. Insert contacts
  const contactDefs = buildContacts(userId, appMap);
  const insertedContacts = await Contact.insertMany(contactDefs, { ordered: true });
  console.log(`👤  Inserted ${insertedContacts.length} contacts`);

  // 7. Update Application.contacts[] arrays
  const contactsByApp = {};
  for (const c of insertedContacts) {
    if (c.application) {
      const key = c.application.toString();
      if (!contactsByApp[key]) contactsByApp[key] = [];
      contactsByApp[key].push(c._id);
    }
  }
  await Promise.all(
    Object.entries(contactsByApp).map(([appId, ids]) =>
      Application.findByIdAndUpdate(appId, { $set: { contacts: ids } })
    )
  );
  console.log(`🔗  Linked contacts → applications`);

  // 8. Insert interviews
  const interviewDefs = buildInterviews(userId, appMap);
  const insertedInterviews = await Interview.insertMany(interviewDefs, { ordered: true });
  console.log(`📅  Inserted ${insertedInterviews.length} interviews`);

  // ─── 9. Integrity validation ─────────────────────────────────────────────
  console.log('\n🔍  Running integrity checks…');

  const appIdSet = new Set(insertedApps.map((a) => a._id.toString()));

  // Orphaned contacts (linked to non-existent application)
  const orphanedContacts = insertedContacts.filter(
    (c) => c.application && !appIdSet.has(c.application.toString())
  ).length;

  // Orphaned interviews (linked to non-existent application)
  const orphanedInterviews = insertedInterviews.filter(
    (i) => !appIdSet.has(i.application.toString())
  ).length;

  // Duplicate timestamps (exact time conflicts)
  const timestamps = insertedInterviews.map((i) => i.scheduledAt.getTime());
  const uniqueTimestamps = new Set(timestamps);
  const timeConflicts = timestamps.length - uniqueTimestamps.size;

  // Status distribution
  const statusCounts = {};
  for (const a of insertedApps) {
    statusCounts[a.status] = (statusCounts[a.status] || 0) + 1;
  }

  // ─── 10. Print summary ───────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════════');
  console.log('  SEED SUMMARY');
  console.log('══════════════════════════════════════════════');
  console.log(`  User         ${user.firstName} ${user.lastName} <${user.email}>`);
  console.log(`  Applications ${insertedApps.length}`);
  console.log(`  Contacts     ${insertedContacts.length}`);
  console.log(`  Interviews   ${insertedInterviews.length}`);
  console.log('\n  Status breakdown:');
  const ORDER = ['Applied', 'Phone Screen', 'Technical', 'Onsite', 'Offer', 'Accepted', 'Rejected'];
  for (const s of ORDER) {
    if (statusCounts[s]) {
      console.log(`    ${s.padEnd(16)} ${statusCounts[s]}`);
    }
  }
  console.log('\n  Integrity:');
  console.log(`    Orphaned contacts    ${orphanedContacts  === 0 ? '✅ 0' : `❌ ${orphanedContacts}`}`);
  console.log(`    Orphaned interviews  ${orphanedInterviews === 0 ? '✅ 0' : `❌ ${orphanedInterviews}`}`);
  console.log(`    Time conflicts       ${timeConflicts      === 0 ? '✅ 0' : `❌ ${timeConflicts}`}`);
  console.log('══════════════════════════════════════════════\n');

  const failed = orphanedContacts > 0 || orphanedInterviews > 0 || timeConflicts > 0;
  if (failed) {
    console.error('❌  Integrity check FAILED — review the data above.\n');
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log('🎉  Seed complete!\n');
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error('\n❌  Fatal error:', err.message || err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
