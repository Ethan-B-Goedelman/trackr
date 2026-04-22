#!/usr/bin/env node
/**
 * seed-demo.js  —  Trackr presentation demo seed
 *
 * Deletes + re-creates the demo account, then seeds realistic job-search
 * data spread across January – May 2026.
 *
 * Usage (run from /api):
 *   node seed-demo.js
 *
 * Seeded data:
 *   20 applications  (4 Applied, 3 Phone Screen, 4 Technical, 3 Onsite,
 *                     2 Offer, 1 Accepted, 3 Rejected)
 *   40 contacts      (1–3 per application)
 *   35 interviews    (spread Jan–Apr completed w/ ratings, May upcoming)
 */

'use strict';

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const mongoose    = require('mongoose');
const User        = require('./models/User');
const Application = require('./models/Application');
const Contact     = require('./models/Contact');
const Interview   = require('./models/Interview');

const DEMO_EMAIL    = 'trackcop4331@gmail.com';
const DEMO_PASSWORD = 'COP4331-21GROUP';

// ─── Date helpers ──────────────────────────────────────────────────────────────

/** YYYY-MM-DD at noon UTC — used for dateApplied fields. */
function ymd(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
}

/**
 * YYYY-MM-DD at hourET:minET US Eastern time.
 *   Jan–Feb  2026 = EST  UTC-5
 *   Mar–May  2026 = EDT  UTC-4
 */
function et(dateStr, hourET, minET = 0) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const offset = m >= 3 ? 4 : 5;
  return new Date(Date.UTC(y, m - 1, d, hourET + offset, minET, 0));
}

// ─── Applications ──────────────────────────────────────────────────────────────

function buildApplications(userId) {
  return [

    // ── January ──────────────────────────────────────────────────────────────

    {
      user: userId, company: 'Netflix', role: 'Full Stack Engineer',
      status: 'Rejected', location: 'Los Gatos, CA',
      salaryMin: 140000, salaryMax: 180000,
      jobUrl: 'https://jobs.netflix.com/full-stack-engineer',
      dateApplied: ymd('2026-01-08'),
      notes: 'Rejected after technical round. Need to study dynamic programming more thoroughly.',
    },
    {
      user: userId, company: 'Dropbox', role: 'Software Engineer',
      status: 'Accepted', location: 'San Francisco, CA',
      salaryMin: 125000, salaryMax: 155000,
      jobUrl: 'https://dropbox.com/jobs/software-engineer',
      dateApplied: ymd('2026-01-10'),
      notes: 'Accepted offer! Start date June 9. Team: Core Platform. Super excited.',
    },
    {
      user: userId, company: 'Twitter/X', role: 'Backend Developer',
      status: 'Rejected', location: 'San Francisco, CA',
      salaryMin: 115000, salaryMax: 145000,
      jobUrl: 'https://careers.x.com/backend-developer',
      dateApplied: ymd('2026-01-12'),
      notes: 'Rejected after phone screen. Lacked experience with large-scale C++ systems.',
    },
    {
      user: userId, company: 'Slack', role: 'Product Engineer',
      status: 'Rejected', location: 'San Francisco, CA',
      salaryMin: 120000, salaryMax: 150000,
      jobUrl: 'https://slack.com/careers/product-engineer',
      dateApplied: ymd('2026-01-15'),
      notes: 'Rejected post-onsite. Product sense round was weak — practice case studies.',
    },

    // ── February ─────────────────────────────────────────────────────────────

    {
      user: userId, company: 'Google', role: 'Software Engineer',
      status: 'Onsite', location: 'San Francisco, CA',
      salaryMin: 130000, salaryMax: 160000,
      jobUrl: 'https://careers.google.com/software-engineer',
      dateApplied: ymd('2026-02-03'),
      notes: 'Onsite loop May 19 — 4 rounds. Practice Leetcode hard + system design.',
    },
    {
      user: userId, company: 'Airbnb', role: 'Software Engineer',
      status: 'Onsite', location: 'San Francisco, CA',
      salaryMin: 128000, salaryMax: 158000,
      jobUrl: 'https://careers.airbnb.com/software-engineer',
      dateApplied: ymd('2026-02-08'),
      notes: 'Onsite May 20. Airbnb values cross-functional collab. Prep behaviorals.',
    },
    {
      user: userId, company: 'Microsoft', role: 'Software Engineer',
      status: 'Offer', location: 'Redmond, WA',
      salaryMin: 130000, salaryMax: 160000,
      jobUrl: 'https://careers.microsoft.com/software-engineer',
      dateApplied: ymd('2026-02-10'),
      notes: 'Offer: $145k base + RSUs. Deadline May 30. Comparing with Snowflake.',
    },
    {
      user: userId, company: 'Snowflake', role: 'Data Engineer',
      status: 'Offer', location: 'San Mateo, CA',
      salaryMin: 135000, salaryMax: 165000,
      jobUrl: 'https://careers.snowflake.com/data-engineer',
      dateApplied: ymd('2026-02-14'),
      notes: 'Offer: $155k + strong equity. High-growth company. Deadline May 28.',
    },

    // ── March ─────────────────────────────────────────────────────────────────

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
      notes: 'Technical May 14. Graph algorithms very likely — review BFS/DFS.',
    },
    {
      user: userId, company: 'NVIDIA', role: 'ML Engineer',
      status: 'Technical', location: 'Santa Clara, CA',
      salaryMin: 140000, salaryMax: 175000,
      jobUrl: 'https://nvidia.wd5.myworkdayjobs.com/ml-engineer',
      dateApplied: ymd('2026-03-10'),
      notes: 'Review CUDA and ML system design. Strong culture fit from recruiter call.',
    },
    {
      user: userId, company: 'Adobe', role: 'Frontend Developer',
      status: 'Onsite', location: 'San Jose, CA',
      salaryMin: 120000, salaryMax: 150000,
      jobUrl: 'https://adobe.com/careers/frontend-developer',
      dateApplied: ymd('2026-03-15'),
      notes: 'Onsite May 21. Focus on web accessibility and Canvas API performance.',
    },
    {
      user: userId, company: 'Amazon', role: 'SDE Intern',
      status: 'Phone Screen', location: 'Seattle, WA',
      salaryMin: 115000, salaryMax: 145000,
      jobUrl: 'https://amazon.jobs/sde-intern',
      dateApplied: ymd('2026-03-20'),
      notes: 'Phone screen May 6. Review Leadership Principles and system design basics.',
    },
    {
      user: userId, company: 'Uber', role: 'Platform Engineer',
      status: 'Phone Screen', location: 'San Francisco, CA',
      salaryMin: 125000, salaryMax: 155000,
      jobUrl: 'https://www.uber.com/us/en/careers/platform-engineer',
      dateApplied: ymd('2026-03-25'),
      notes: 'Recruiter reached out on LinkedIn. Phone screen May 7.',
    },

    // ── April ─────────────────────────────────────────────────────────────────

    {
      user: userId, company: 'Figma', role: 'Software Engineer',
      status: 'Phone Screen', location: 'San Francisco, CA',
      salaryMin: 130000, salaryMax: 165000,
      jobUrl: 'https://www.figma.com/careers/software-engineer',
      dateApplied: ymd('2026-04-01'),
      notes: "Admire Figma's multiplayer architecture. Phone screen May 8.",
    },
    {
      user: userId, company: 'Apple', role: 'iOS Developer',
      status: 'Applied', location: 'Cupertino, CA',
      salaryMin: 120000, salaryMax: 150000,
      jobUrl: 'https://jobs.apple.com/ios-developer',
      dateApplied: ymd('2026-04-05'),
      notes: 'Referred by a friend on the SwiftUI team. Watch for recruiter email.',
    },
    {
      user: userId, company: 'Spotify', role: 'Mobile Engineer',
      status: 'Applied', location: 'New York, NY',
      salaryMin: 120000, salaryMax: 150000,
      jobUrl: 'https://www.lifeatspotify.com/jobs/mobile-engineer',
      dateApplied: ymd('2026-04-10'),
      notes: 'Applied through careers portal. Role focuses on iOS/Android streaming.',
    },
    {
      user: userId, company: 'Salesforce', role: 'Software Engineer',
      status: 'Applied', location: 'San Francisco, CA',
      salaryMin: 125000, salaryMax: 155000,
      jobUrl: 'https://careers.salesforce.com/software-engineer',
      dateApplied: ymd('2026-04-15'),
      notes: 'Submitted via LinkedIn Easy Apply. Follow up in 2 weeks if no response.',
    },
    {
      user: userId, company: 'DoorDash', role: 'Backend Engineer',
      status: 'Applied', location: 'San Francisco, CA',
      salaryMin: 120000, salaryMax: 150000,
      jobUrl: 'https://careers.doordash.com/backend-engineer',
      dateApplied: ymd('2026-04-19'),
      notes: 'Applied for the payments infrastructure team. Strong interest in real-time systems.',
    },
  ];
}

// ─── Contacts ──────────────────────────────────────────────────────────────────

function buildContacts(userId, appMap) {
  const A = (company, role) => appMap[`${company}|${role}`];

  return [

    // ── Google (3) ───────────────────────────────────────────────────────────
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
      notes: 'Hiring manager for Search Infra. Had a coffee chat April 15.',
    },
    {
      user: userId, application: A('Google', 'Software Engineer'),
      name: 'Sarah Chen', role: 'Recruiting Coordinator', company: 'Google',
      email: 'sarah.chen@google.com',
      linkedIn: 'https://linkedin.com/in/sarah-chen-recruiter',
      notes: 'Coordinates onsite logistics. Point of contact for the interview day.',
    },

    // ── Meta (2) ─────────────────────────────────────────────────────────────
    {
      user: userId, application: A('Meta', 'Frontend Engineer Intern'),
      name: 'Alex Rivera', role: 'University Recruiter', company: 'Meta',
      email: 'alex.rivera@meta.com', phone: '+1 650-543-4800',
      linkedIn: 'https://linkedin.com/in/alex-rivera-meta',
      notes: 'Met at UCF career fair. Sent CoderPad practice links.',
    },
    {
      user: userId, application: A('Meta', 'Frontend Engineer Intern'),
      name: 'David Kim', role: 'Engineering Manager', company: 'Meta',
      email: 'david.kim@meta.com',
      linkedIn: 'https://linkedin.com/in/david-kim-meta-em',
      notes: 'Manages the News Feed performance team. Interviewing for his org.',
    },

    // ── Apple (1) ────────────────────────────────────────────────────────────
    {
      user: userId, application: A('Apple', 'iOS Developer'),
      name: 'Emily Watson', role: 'Technical Recruiter', company: 'Apple',
      email: 'emily.watson@apple.com', phone: '+1 408-996-1010',
      linkedIn: 'https://linkedin.com/in/emily-watson-apple',
      notes: 'Initial contact via LinkedIn. Waiting for recruiter screen slot.',
    },

    // ── Amazon (2) ───────────────────────────────────────────────────────────
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

    // ── Microsoft (3) ────────────────────────────────────────────────────────
    {
      user: userId, application: A('Microsoft', 'Software Engineer'),
      name: 'Rachel Green', role: 'University Recruiter', company: 'Microsoft',
      email: 'rachel.green@microsoft.com', phone: '+1 425-882-8080',
      linkedIn: 'https://linkedin.com/in/rachel-green-msft',
      notes: 'Main recruiter. Called with offer details May 13.',
    },
    {
      user: userId, application: A('Microsoft', 'Software Engineer'),
      name: 'Tom Bradley', role: 'Engineering Manager', company: 'Microsoft',
      email: 'tom.bradley@microsoft.com',
      linkedIn: 'https://linkedin.com/in/tom-bradley-msft',
      notes: 'EM for Azure DevOps team. Onsite interview went very positively.',
    },
    {
      user: userId, application: A('Microsoft', 'Software Engineer'),
      name: 'Sandra Wu', role: 'Director of Engineering', company: 'Microsoft',
      email: 'sandra.wu@microsoft.com',
      linkedIn: 'https://linkedin.com/in/sandra-wu-msft',
      notes: 'Skip-level director. Gave glowing feedback after onsite panel.',
    },

    // ── Netflix (2) ──────────────────────────────────────────────────────────
    {
      user: userId, application: A('Netflix', 'Full Stack Engineer'),
      name: 'Kevin Martinez', role: 'Senior Recruiter', company: 'Netflix',
      email: 'kevin.martinez@netflix.com', phone: '+1 408-540-3700',
      linkedIn: 'https://linkedin.com/in/kevin-martinez-netflix',
      notes: 'Sent rejection Jan 25. Suggested reapplying in 6 months.',
    },
    {
      user: userId, application: A('Netflix', 'Full Stack Engineer'),
      name: 'Lisa Johnson', role: 'Engineering Lead', company: 'Netflix',
      email: 'lisa.johnson@netflix.com',
      linkedIn: 'https://linkedin.com/in/lisa-johnson-netflix',
      notes: 'Interviewed for Playback Experience. Heavy DP focus — practice more.',
    },

    // ── Stripe (2) ───────────────────────────────────────────────────────────
    {
      user: userId, application: A('Stripe', 'Backend Engineer'),
      name: 'Michael Brown', role: 'Technical Recruiter', company: 'Stripe',
      email: 'michael.brown@stripe.com', phone: '+1 415-901-3310',
      linkedIn: 'https://linkedin.com/in/michael-brown-stripe',
      notes: "Sent a detailed prep guide and Stripe's engineering values doc.",
    },
    {
      user: userId, application: A('Stripe', 'Backend Engineer'),
      name: 'Aisha Patel', role: 'Senior Engineer', company: 'Stripe',
      email: 'aisha.patel@stripe.com',
      linkedIn: 'https://linkedin.com/in/aisha-patel-stripe',
      notes: 'Technical interviewer May 13. Worked on Stripe Connect and payouts.',
    },

    // ── Airbnb (3) ───────────────────────────────────────────────────────────
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
      notes: 'Technical interviewer May 13. Booking system design and idempotency focus.',
    },
    {
      user: userId, application: A('Airbnb', 'Software Engineer'),
      name: 'Daniel Wright', role: 'Hiring Manager', company: 'Airbnb',
      email: 'daniel.wright@airbnb.com',
      linkedIn: 'https://linkedin.com/in/daniel-wright-airbnb',
      notes: 'Onsite day lead May 20. Will cover team culture and project expectations.',
    },

    // ── Spotify (1) ──────────────────────────────────────────────────────────
    {
      user: userId, application: A('Spotify', 'Mobile Engineer'),
      name: 'Sophie Anderson', role: 'University Recruiter', company: 'Spotify',
      email: 'sophie.anderson@spotify.com', phone: '+1 212-314-1000',
      linkedIn: 'https://linkedin.com/in/sophie-anderson-spotify',
      notes: 'Connected on LinkedIn. Application currently under review.',
    },

    // ── Uber (2) ─────────────────────────────────────────────────────────────
    {
      user: userId, application: A('Uber', 'Platform Engineer'),
      name: 'Ryan Clark', role: 'University Recruiter', company: 'Uber',
      email: 'ryan.clark@uber.com', phone: '+1 415-612-8582',
      linkedIn: 'https://linkedin.com/in/ryan-clark-uber',
      notes: 'Reached out on LinkedIn first. Phone screen May 7.',
    },
    {
      user: userId, application: A('Uber', 'Platform Engineer'),
      name: 'Nina Shah', role: 'Engineering Lead', company: 'Uber',
      email: 'nina.shah@uber.com',
      linkedIn: 'https://linkedin.com/in/nina-shah-uber',
      notes: 'Real-time dispatch infrastructure team. Potential interviewer.',
    },

    // ── LinkedIn (2) ─────────────────────────────────────────────────────────
    {
      user: userId, application: A('LinkedIn', 'Software Engineer'),
      name: 'Brandon Hayes', role: 'Technical Recruiter', company: 'LinkedIn',
      email: 'brandon.hayes@linkedin.com', phone: '+1 650-687-3600',
      linkedIn: 'https://linkedin.com/in/brandon-hayes-linkedin',
      notes: 'Very communicative. Technical screen May 14.',
    },
    {
      user: userId, application: A('LinkedIn', 'Software Engineer'),
      name: 'Jenny Liu', role: 'Senior Software Engineer', company: 'LinkedIn',
      email: 'jenny.liu@linkedin.com',
      linkedIn: 'https://linkedin.com/in/jenny-liu-lnkd',
      notes: 'Technical interviewer May 14. Works on the Economic Graph team.',
    },

    // ── Twitter/X (1) ────────────────────────────────────────────────────────
    {
      user: userId, application: A('Twitter/X', 'Backend Developer'),
      name: 'Tyler Chen', role: 'Recruiter', company: 'X (Twitter)',
      email: 'tyler.chen@x.com', phone: '+1 415-222-9670',
      linkedIn: 'https://linkedin.com/in/tyler-chen-x',
      notes: 'Rejection came quickly after phone screen. Move on.',
    },

    // ── Salesforce (1) ───────────────────────────────────────────────────────
    {
      user: userId, application: A('Salesforce', 'Software Engineer'),
      name: 'Patricia Moore', role: 'Technical Sourcer', company: 'Salesforce',
      email: 'patricia.moore@salesforce.com', phone: '+1 415-901-7000',
      linkedIn: 'https://linkedin.com/in/patricia-moore-sfdc',
      notes: 'Sourced via LinkedIn. No recruiter screen scheduled yet.',
    },

    // ── Adobe (3) ────────────────────────────────────────────────────────────
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
      notes: 'Technical interviewer. Canvas API and WebGL expert.',
    },

    // ── NVIDIA (2) ───────────────────────────────────────────────────────────
    {
      user: userId, application: A('NVIDIA', 'ML Engineer'),
      name: 'Grace Zhao', role: 'Technical Recruiter', company: 'NVIDIA',
      email: 'grace.zhao@nvidia.com', phone: '+1 408-486-2000',
      linkedIn: 'https://linkedin.com/in/grace-zhao-nvidia',
      notes: 'Phone screen Apr 3. Very enthusiastic about the ML systems role.',
    },
    {
      user: userId, application: A('NVIDIA', 'ML Engineer'),
      name: 'Arjun Mehta', role: 'Research Scientist', company: 'NVIDIA',
      email: 'arjun.mehta@nvidia.com',
      linkedIn: 'https://linkedin.com/in/arjun-mehta-nvidia',
      notes: 'Technical interviewer May 15. Published papers on transformer optimization.',
    },

    // ── Dropbox (2) ──────────────────────────────────────────────────────────
    {
      user: userId, application: A('Dropbox', 'Software Engineer'),
      name: 'Olivia Turner', role: 'University Recruiter', company: 'Dropbox',
      email: 'olivia.turner@dropbox.com', phone: '+1 415-857-6800',
      linkedIn: 'https://linkedin.com/in/olivia-turner-dropbox',
      notes: 'Confirmed offer letter. Start date June 9.',
    },
    {
      user: userId, application: A('Dropbox', 'Software Engineer'),
      name: 'Ethan Brooks', role: 'Engineering Manager', company: 'Dropbox',
      email: 'ethan.brooks@dropbox.com',
      linkedIn: 'https://linkedin.com/in/ethan-brooks-dropbox',
      notes: 'Future manager. Had a great 1:1 during onsite. Team of 8 engineers.',
    },

    // ── Slack (1) ────────────────────────────────────────────────────────────
    {
      user: userId, application: A('Slack', 'Product Engineer'),
      name: 'Isabella Davis', role: 'Recruiter', company: 'Slack',
      email: 'isabella.davis@slack.com', phone: '+1 415-630-7943',
      linkedIn: 'https://linkedin.com/in/isabella-davis-slack',
      notes: 'Rejection Feb 12 post-onsite. Feedback: weak product sense.',
    },

    // ── Figma (2) ────────────────────────────────────────────────────────────
    {
      user: userId, application: A('Figma', 'Software Engineer'),
      name: 'Nathan Evans', role: 'Technical Recruiter', company: 'Figma',
      email: 'nathan.evans@figma.com', phone: '+1 415-800-4300',
      linkedIn: 'https://linkedin.com/in/nathan-evans-figma',
      notes: 'Phone screen May 8 at 10am ET. Prep collaborative editing concepts.',
    },
    {
      user: userId, application: A('Figma', 'Software Engineer'),
      name: 'Chloe Wilson', role: 'Design Engineer', company: 'Figma',
      email: 'chloe.wilson@figma.com',
      linkedIn: 'https://linkedin.com/in/chloe-wilson-figma',
      notes: 'Works on the rendering engine. Potential future teammate.',
    },

    // ── Snowflake (3) ────────────────────────────────────────────────────────
    {
      user: userId, application: A('Snowflake', 'Data Engineer'),
      name: 'Andrew Jackson', role: 'University Recruiter', company: 'Snowflake',
      email: 'andrew.jackson@snowflake.com', phone: '+1 650-632-5306',
      linkedIn: 'https://linkedin.com/in/andrew-jackson-snowflake',
      notes: 'Verbal offer May 15. Written offer May 16. Deadline May 28.',
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
      notes: 'Director interview during onsite. Asked about long-term engineering vision.',
    },

    // ── DoorDash (1) ─────────────────────────────────────────────────────────
    {
      user: userId, application: A('DoorDash', 'Backend Engineer'),
      name: 'Michelle Scott', role: 'Technical Recruiter', company: 'DoorDash',
      email: 'michelle.scott@doordash.com', phone: '+1 415-503-3000',
      linkedIn: 'https://linkedin.com/in/michelle-scott-doordash',
      notes: 'Application acknowledged. Recruiter screen still pending.',
    },
  ];
}

// ─── Interviews ────────────────────────────────────────────────────────────────
//
// 35 interviews spread across January – May 2026.
// January–April (before Apr 22) = completed, have ratings + reflections.
// May onwards   = upcoming, have prepNotes only.
//
// All timestamps are unique (conflict-free):
//   Jan 15 10am  Jan 20 2pm   Jan 21 11am  Jan 23 10am  Jan 28 9am   Jan 28 2pm
//   Feb  4 10am  Feb 12  9am  Feb 20  2pm  Feb 25 11am
//   Mar  3 10am  Mar  5  2pm  Mar 10 10am  Mar 15  3pm  Mar 19 11am
//   Mar 24 10am  Mar 26  2pm  Mar 28 11am  Mar 30  3pm
//   Apr  3 11am  Apr  9  9am  Apr 14  2pm  Apr 18 10am
//   May  6 10am  May  7 11am  May  8 10am  May  8  2pm
//   May 12  2pm  May 13 10am  May 13 11am  May 14 10am  May 14  3pm
//   May 15 11am  May 15  2pm  May 19  9am  May 20 10am  May 21 11am

function buildInterviews(userId, appMap) {
  const A = (company, role) => appMap[`${company}|${role}`];

  return [

    // ════════════════════════════════════════════════════════
    // JANUARY — completed, all rated
    // ════════════════════════════════════════════════════════

    {
      user: userId, application: A('Dropbox', 'Software Engineer'),
      scheduledAt: et('2026-01-15', 10), type: 'Phone',
      interviewerName: 'Olivia Turner', interviewerRole: 'University Recruiter',
      location: 'Google Meet',
      prepNotes: 'Recruiter screen + 1 coding problem. Be enthusiastic about the Core Platform team.',
      rating: 5,
      reflection: 'Great start. Olivia loved the background story. Easy string problem solved optimally. Moving to technical.',
    },
    {
      user: userId, application: A('Netflix', 'Full Stack Engineer'),
      scheduledAt: et('2026-01-20', 14), type: 'Technical',
      interviewerName: 'Lisa Johnson', interviewerRole: 'Engineering Lead',
      location: 'Zoom (CoderPad)',
      prepNotes: 'Full technical. DP problems very likely. Review memoization and tabulation patterns.',
      rating: 2,
      reflection: 'Struggled badly with the DP problem — got brute force but no optimization. Need major practice here.',
    },
    {
      user: userId, application: A('Twitter/X', 'Backend Developer'),
      scheduledAt: et('2026-01-21', 11), type: 'Phone',
      interviewerName: 'Tyler Chen', interviewerRole: 'Recruiter',
      location: 'Google Meet',
      prepNotes: 'Technical phone screen. C++ and large-scale distributed systems expected.',
      rating: 2,
      reflection: 'Did not go well. Lacking C++ experience showed immediately. Was honest about it but it ended the process.',
    },
    {
      user: userId, application: A('Dropbox', 'Software Engineer'),
      scheduledAt: et('2026-01-23', 10), type: 'Technical',
      interviewerName: 'Ethan Brooks', interviewerRole: 'Engineering Manager',
      location: 'CoderPad (virtual)',
      prepNotes: 'Coding + system design. Expect file sync system design and 1–2 medium coding problems.',
      rating: 5,
      reflection: 'Nailed the file sync design. Both coding problems solved optimally. Ethan was very positive throughout.',
    },
    {
      user: userId, application: A('Slack', 'Product Engineer'),
      scheduledAt: et('2026-01-28', 9), type: 'Technical',
      interviewerName: 'Isabella Davis', interviewerRole: 'Recruiter',
      location: 'Slack Huddle',
      prepNotes: 'Technical + product sense. Prepare a product improvement case for Slack.',
      rating: 3,
      reflection: 'Coding was fine, but the product case was shaky. Could not articulate user value clearly enough.',
    },
    {
      user: userId, application: A('Dropbox', 'Software Engineer'),
      scheduledAt: et('2026-01-28', 14), type: 'Onsite',
      interviewerName: 'Olivia Turner', interviewerRole: 'University Recruiter',
      location: 'Dropbox HQ — 1800 Owens St, San Francisco',
      prepNotes: '4 rounds: 2× coding, 1× system design, 1× behavioral. Bring ID. Full day.',
      rating: 5,
      reflection: 'Best interview day ever. All rounds went smoothly. System design (Dropbox sync) felt like home. Offer incoming!',
    },

    // ════════════════════════════════════════════════════════
    // FEBRUARY — completed, all rated
    // ════════════════════════════════════════════════════════

    {
      user: userId, application: A('Slack', 'Product Engineer'),
      scheduledAt: et('2026-02-04', 10), type: 'Onsite',
      interviewerName: 'Isabella Davis', interviewerRole: 'Recruiter',
      location: 'Salesforce Tower — 415 Mission St, San Francisco',
      prepNotes: 'Final onsite. 5 rounds including product design. Read Slack product blog.',
      rating: 3,
      reflection: 'Coding rounds were solid. Product design round was my weak point again. Felt the rejection coming.',
    },
    {
      user: userId, application: A('Google', 'Software Engineer'),
      scheduledAt: et('2026-02-20', 14), type: 'Phone',
      interviewerName: 'Priya Nair', interviewerRole: 'Technical Recruiter',
      location: 'Google Meet',
      prepNotes: '2 medium/hard coding questions in 45 min. Use Python.',
      rating: 4,
      reflection: 'Two graph problems. Solved first optimally, got brute force + partial opt on second. Passed to technical.',
    },
    {
      user: userId, application: A('Airbnb', 'Software Engineer'),
      scheduledAt: et('2026-02-25', 11), type: 'Phone',
      interviewerName: 'Chris Taylor', interviewerRole: 'University Recruiter',
      location: 'Zoom',
      prepNotes: "Recruiter screen + light coding. Talk about passion for Airbnb's mission of belonging.",
      rating: 5,
      reflection: "Chris was fantastic. Easy string problem, 30 min culture chat. Said 'very excited about you' — great sign.",
    },

    // ════════════════════════════════════════════════════════
    // MARCH — completed, all rated
    // ════════════════════════════════════════════════════════

    {
      user: userId, application: A('Microsoft', 'Software Engineer'),
      scheduledAt: et('2026-03-03', 10), type: 'Phone',
      interviewerName: 'Rachel Green', interviewerRole: 'University Recruiter',
      location: 'Microsoft Teams',
      prepNotes: 'Recruiter screen + 1 coding problem. Know Azure DevOps product well.',
      rating: 4,
      reflection: 'Smooth call. Rachel was encouraging. Sliding window coding problem solved cleanly.',
    },
    {
      user: userId, application: A('Google', 'Software Engineer'),
      scheduledAt: et('2026-03-05', 14), type: 'Technical',
      interviewerName: 'James Park', interviewerRole: 'Senior Software Engineer',
      location: 'Google Meet',
      prepNotes: 'System design: distributed key-value store. Cover sharding, replication, consistency.',
      rating: 4,
      reflection: 'System design went great — covered consistent hashing and replication. Tree coding problem was clean.',
    },
    {
      user: userId, application: A('Snowflake', 'Data Engineer'),
      scheduledAt: et('2026-03-10', 10), type: 'Phone',
      interviewerName: 'Andrew Jackson', interviewerRole: 'University Recruiter',
      location: 'Zoom',
      prepNotes: 'Recruiter screen + background. Know Snowflake data cloud architecture basics.',
      rating: 4,
      reflection: 'Andrew spent 20 min talking about the team culture. SQL problem was straightforward.',
    },
    {
      user: userId, application: A('Airbnb', 'Software Engineer'),
      scheduledAt: et('2026-03-15', 15), type: 'Technical',
      interviewerName: 'Megan Foster', interviewerRole: 'Tech Lead',
      location: 'Zoom (CoderPad)',
      prepNotes: 'System design + coding. Booking system — cover idempotency and double-booking prevention.',
      rating: 4,
      reflection: 'Really enjoyed the reservation system discussion. Megan asked excellent follow-up edge case questions.',
    },
    {
      user: userId, application: A('Microsoft', 'Software Engineer'),
      scheduledAt: et('2026-03-19', 11), type: 'Technical',
      interviewerName: 'Tom Bradley', interviewerRole: 'Engineering Manager',
      location: 'Microsoft Teams (CoderPad)',
      prepNotes: "OOP design + coding. Know Azure DevOps team's domain.",
      rating: 5,
      reflection: 'Tom was clearly impressed. CI pipeline OOP design question was perfect fit for my experience. Strong round.',
    },
    {
      user: userId, application: A('Meta', 'Frontend Engineer Intern'),
      scheduledAt: et('2026-03-24', 10), type: 'Phone',
      interviewerName: 'Alex Rivera', interviewerRole: 'University Recruiter',
      location: 'WhatsApp Video Call',
      prepNotes: '1–2 coding questions on arrays/strings. CoderPad environment.',
      rating: 4,
      reflection: 'Medium array problem solved optimally. Alex mentioned I was one of the stronger candidates this cycle.',
    },
    {
      user: userId, application: A('Stripe', 'Backend Engineer'),
      scheduledAt: et('2026-03-26', 14), type: 'Phone',
      interviewerName: 'Michael Brown', interviewerRole: 'Technical Recruiter',
      location: 'Stripe Zoom',
      prepNotes: 'Distributed systems + reliability focus. 45 min, 2 problems.',
      rating: 5,
      reflection: "Best phone screen yet. Solved both problems with time to spare. Michael said it was 'the clearest explanation I've heard'.",
    },
    {
      user: userId, application: A('LinkedIn', 'Software Engineer'),
      scheduledAt: et('2026-03-28', 11), type: 'Phone',
      interviewerName: 'Brandon Hayes', interviewerRole: 'Technical Recruiter',
      location: 'Microsoft Teams',
      prepNotes: 'Graph algorithms likely. Review BFS/DFS and shortest path.',
      rating: 3,
      reflection: 'Decent — struggled briefly with the graph problem but recovered. Passed to technical round.',
    },
    {
      user: userId, application: A('Snowflake', 'Data Engineer'),
      scheduledAt: et('2026-03-30', 15), type: 'Technical',
      interviewerName: 'Vanessa Long', interviewerRole: 'Engineering Manager',
      location: 'Zoom',
      prepNotes: 'Data pipeline design + SQL optimization. Know Snowflake Virtual Warehouse concept.',
      rating: 4,
      reflection: 'Data pipeline design question was a perfect fit. SQL optimization round was solid.',
    },

    // ════════════════════════════════════════════════════════
    // APRIL — completed (up to Apr 22), all rated
    // ════════════════════════════════════════════════════════

    {
      user: userId, application: A('NVIDIA', 'ML Engineer'),
      scheduledAt: et('2026-04-03', 11), type: 'Phone',
      interviewerName: 'Grace Zhao', interviewerRole: 'Technical Recruiter',
      location: 'Google Meet',
      prepNotes: 'ML fundamentals (backprop, transformers) + 1 coding problem.',
      rating: 4,
      reflection: 'Explained backpropagation clearly. DP problem went well. Moving to technical round.',
    },
    {
      user: userId, application: A('Microsoft', 'Software Engineer'),
      scheduledAt: et('2026-04-09', 9), type: 'Onsite',
      interviewerName: 'Sandra Wu', interviewerRole: 'Director of Engineering',
      location: 'Microsoft Redmond Campus — Building 92',
      prepNotes: '5 rounds full day: 3× coding, 1× system design, 1× behavioral with Director.',
      rating: 5,
      reflection: 'Outstanding day. Sandra Wu gave extremely positive feedback. CI/CD system design round was flawless.',
    },
    {
      user: userId, application: A('Snowflake', 'Data Engineer'),
      scheduledAt: et('2026-04-14', 14), type: 'Onsite',
      interviewerName: 'Robert Harris', interviewerRole: 'Director of Engineering',
      location: 'Snowflake HQ — 450 Concar Dr, San Mateo',
      prepNotes: '4 rounds: data systems design, coding, behavioral, Director interview.',
      rating: 4,
      reflection: 'Really enjoyed the data ingestion pipeline design. Robert asked great long-term vision questions.',
    },
    {
      user: userId, application: A('Adobe', 'Frontend Developer'),
      scheduledAt: et('2026-04-18', 10), type: 'Phone',
      interviewerName: 'Carlos Rodriguez', interviewerRole: 'University Recruiter',
      location: 'Google Meet',
      prepNotes: 'Recruiter screen. Discuss WCAG accessibility, CSS animations, Canvas API projects.',
      rating: 4,
      reflection: 'Carlos appreciated the accessibility experience from Trackr. DOM manipulation problem was straightforward.',
    },

    // ════════════════════════════════════════════════════════
    // MAY — upcoming, no ratings yet
    // ════════════════════════════════════════════════════════

    {
      user: userId, application: A('Amazon', 'SDE Intern'),
      scheduledAt: et('2026-05-06', 10), type: 'Phone',
      interviewerName: 'Jessica Lee', interviewerRole: 'Recruiting Coordinator',
      location: 'Amazon Chime (link in confirmation email)',
      prepNotes: 'Leadership Principles + 1 coding. 45 min. Review all 16 LPs with STAR format examples.',
    },
    {
      user: userId, application: A('Uber', 'Platform Engineer'),
      scheduledAt: et('2026-05-07', 11), type: 'Phone',
      interviewerName: 'Ryan Clark', interviewerRole: 'University Recruiter',
      location: 'Google Meet',
      prepNotes: 'Intro call — background, motivation, culture fit. 30 min. Discuss real-time systems interest.',
    },
    {
      user: userId, application: A('Figma', 'Software Engineer'),
      scheduledAt: et('2026-05-08', 10), type: 'Phone',
      interviewerName: 'Nathan Evans', interviewerRole: 'Technical Recruiter',
      location: 'Zoom (link TBD)',
      prepNotes: "Recruiter screen. Discuss Figma's multiplayer model, why Figma, and your strongest project.",
    },
    {
      user: userId, application: A('NVIDIA', 'ML Engineer'),
      scheduledAt: et('2026-05-08', 14), type: 'Technical',
      interviewerName: 'Arjun Mehta', interviewerRole: 'Research Scientist',
      location: 'NVIDIA HQ — 2788 San Tomas Expy, Building D',
      prepNotes: "Deep ML technical. CUDA basics, transformer architecture, distributed training. Review Arjun's attention papers.",
    },
    {
      user: userId, application: A('Meta', 'Frontend Engineer Intern'),
      scheduledAt: et('2026-05-12', 14), type: 'Technical',
      interviewerName: 'David Kim', interviewerRole: 'Engineering Manager',
      location: 'CoderPad (virtual)',
      prepNotes: 'React internals, reconciliation algorithm, performance optimization. May include system design.',
    },
    {
      user: userId, application: A('Microsoft', 'Software Engineer'),
      scheduledAt: et('2026-05-13', 10), type: 'Phone',
      interviewerName: 'Rachel Green', interviewerRole: 'University Recruiter',
      location: 'Microsoft Teams',
      prepNotes: 'Offer call — discuss $145k base, RSU grant, start date options. Prepare to negotiate sign-on bonus.',
    },
    {
      user: userId, application: A('Stripe', 'Backend Engineer'),
      scheduledAt: et('2026-05-13', 11), type: 'Technical',
      interviewerName: 'Aisha Patel', interviewerRole: 'Senior Engineer',
      location: 'Stripe HQ — 354 Oyster Point Blvd, Room 4B',
      prepNotes: "API design + coding. Read Stripe's engineering blog on idempotency keys.",
    },
    {
      user: userId, application: A('LinkedIn', 'Software Engineer'),
      scheduledAt: et('2026-05-14', 10), type: 'Technical',
      interviewerName: 'Jenny Liu', interviewerRole: 'Senior Software Engineer',
      location: 'LinkedIn Sunnyvale — 1000 W Maude Ave, Room 210',
      prepNotes: "Coding + system design for a social graph feature. Review LinkedIn's feed ranking architecture.",
    },
    {
      user: userId, application: A('Adobe', 'Frontend Developer'),
      scheduledAt: et('2026-05-14', 15), type: 'Technical',
      interviewerName: 'Joshua Park', interviewerRole: 'Tech Lead',
      location: 'Zoom',
      prepNotes: 'Canvas API, WebGL basics, CSS animation performance, browser rendering pipeline.',
    },
    {
      user: userId, application: A('Snowflake', 'Data Engineer'),
      scheduledAt: et('2026-05-15', 11), type: 'Phone',
      interviewerName: 'Andrew Jackson', interviewerRole: 'University Recruiter',
      location: 'Zoom',
      prepNotes: 'Verbal offer call. $155k + equity. Deadline May 28. Compare total comp with Microsoft.',
    },
    {
      user: userId, application: A('Google', 'Software Engineer'),
      scheduledAt: et('2026-05-19', 9), type: 'Onsite',
      interviewerName: 'Sarah Chen', interviewerRole: 'Recruiting Coordinator',
      location: 'Google SF — 345 Spear St, 8th Floor',
      prepNotes: '4-round onsite: 2× coding (LC hard), 1× system design, 1× behavioral (Googleyness). Full day 9am–4pm. Bring ID.',
    },
    {
      user: userId, application: A('Airbnb', 'Software Engineer'),
      scheduledAt: et('2026-05-20', 10), type: 'Onsite',
      interviewerName: 'Daniel Wright', interviewerRole: 'Hiring Manager',
      location: 'Airbnb HQ — 888 Brannan St, San Francisco',
      prepNotes: '5 rounds: 2× coding, 1× system design, 1× cross-functional, 1× HM. Review Airbnb engineering blog.',
    },
    {
      user: userId, application: A('Adobe', 'Frontend Developer'),
      scheduledAt: et('2026-05-21', 11), type: 'Onsite',
      interviewerName: 'Hannah Kim', interviewerRole: 'Hiring Manager',
      location: 'Adobe HQ — 345 Park Ave, San Jose',
      prepNotes: '4 rounds including designer panel. Accessibility focus throughout. Bring portfolio on laptop.',
    },
  ];
}

// ─── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🌱  Trackr Demo Seed — January through May 2026');
  console.log('══════════════════════════════════════════════════\n');

  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    console.error('❌  MONGODB_URI is not set. Ensure api/.env exists.');
    process.exit(1);
  }
  await mongoose.connect(uri);
  console.log('✅  Connected to MongoDB\n');

  // ── 1. Find or create demo user ────────────────────────────────────────────
  let user = await User.findOne({ email: DEMO_EMAIL.toLowerCase() }).select('+password');

  if (user) {
    console.log(`✅  Found existing user: ${user.firstName} ${user.lastName} <${user.email}>`);
    user.firstName  = 'Demo';
    user.lastName   = 'User';
    user.password   = DEMO_PASSWORD;   // pre-save hook will re-hash
    user.isVerified = true;
    user.verificationToken       = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();
    console.log('✅  Password reset and account verified');
  } else {
    console.log(`➕  No existing account found — creating ${DEMO_EMAIL}`);
    user = new User({
      firstName:  'Demo',
      lastName:   'User',
      email:      DEMO_EMAIL.toLowerCase(),
      password:   DEMO_PASSWORD,
      isVerified: true,
    });
    await user.save();
    console.log('✅  Demo account created and verified');
  }

  const userId = user._id;

  // ── 2. Wipe existing data ──────────────────────────────────────────────────
  const [delApps, delContacts, delInterviews] = await Promise.all([
    Application.deleteMany({ user: userId }),
    Contact.deleteMany({ user: userId }),
    Interview.deleteMany({ user: userId }),
  ]);
  console.log(
    `\n🗑️   Wiped: ${delApps.deletedCount} applications, ` +
    `${delContacts.deletedCount} contacts, ` +
    `${delInterviews.deletedCount} interviews\n`
  );

  // ── 3. Insert applications ─────────────────────────────────────────────────
  const appDefs      = buildApplications(userId);
  const insertedApps = await Application.insertMany(appDefs, { ordered: true });
  console.log(`📋  Inserted ${insertedApps.length} applications`);

  const appMap = {};
  for (const a of insertedApps) {
    appMap[`${a.company}|${a.role}`] = a._id;
  }

  // ── 4. Insert contacts ─────────────────────────────────────────────────────
  const contactDefs      = buildContacts(userId, appMap);
  const insertedContacts = await Contact.insertMany(contactDefs, { ordered: true });
  console.log(`👤  Inserted ${insertedContacts.length} contacts`);

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
  console.log('🔗  Linked contacts → applications');

  // ── 5. Insert interviews ───────────────────────────────────────────────────
  const interviewDefs      = buildInterviews(userId, appMap);
  const insertedInterviews = await Interview.insertMany(interviewDefs, { ordered: true });
  console.log(`📅  Inserted ${insertedInterviews.length} interviews`);

  // ── 6. Integrity checks ────────────────────────────────────────────────────
  console.log('\n🔍  Running integrity checks…');

  const appIdSet = new Set(insertedApps.map((a) => a._id.toString()));

  const orphanedContacts   = insertedContacts.filter(
    (c) => c.application && !appIdSet.has(c.application.toString())
  ).length;
  const orphanedInterviews = insertedInterviews.filter(
    (i) => !appIdSet.has(i.application.toString())
  ).length;
  const timestamps    = insertedInterviews.map((i) => i.scheduledAt.getTime());
  const timeConflicts = timestamps.length - new Set(timestamps).size;

  const statusCounts = {};
  for (const a of insertedApps) {
    statusCounts[a.status] = (statusCounts[a.status] || 0) + 1;
  }

  const byMonth = { Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0 };
  for (const i of insertedInterviews) {
    const m = i.scheduledAt.getUTCMonth();
    if      (m === 0) byMonth.Jan++;
    else if (m === 1) byMonth.Feb++;
    else if (m === 2) byMonth.Mar++;
    else if (m === 3) byMonth.Apr++;
    else if (m === 4) byMonth.May++;
  }

  // ── 7. Print summary ───────────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════════════');
  console.log('  SEED SUMMARY');
  console.log('══════════════════════════════════════════════════');
  console.log(`  Email        ${DEMO_EMAIL}`);
  console.log(`  Password     ${DEMO_PASSWORD}`);
  console.log(`  Applications ${insertedApps.length}`);
  console.log(`  Contacts     ${insertedContacts.length}`);
  console.log(`  Interviews   ${insertedInterviews.length}`);

  console.log('\n  Application status breakdown:');
  const ORDER = ['Applied', 'Phone Screen', 'Technical', 'Onsite', 'Offer', 'Accepted', 'Rejected'];
  for (const s of ORDER) {
    if (statusCounts[s]) console.log(`    ${s.padEnd(16)} ${statusCounts[s]}`);
  }

  console.log('\n  Interviews by month:');
  for (const [mn, count] of Object.entries(byMonth)) {
    const bar = '█'.repeat(count);
    console.log(`    ${mn.padEnd(5)} ${String(count).padStart(2)}  ${bar}`);
  }

  console.log('\n  Integrity:');
  console.log(`    Orphaned contacts    ${orphanedContacts   === 0 ? '✅ 0' : `❌ ${orphanedContacts}`}`);
  console.log(`    Orphaned interviews  ${orphanedInterviews === 0 ? '✅ 0' : `❌ ${orphanedInterviews}`}`);
  console.log(`    Time conflicts       ${timeConflicts      === 0 ? '✅ 0' : `❌ ${timeConflicts}`}`);
  console.log('══════════════════════════════════════════════════\n');

  if (orphanedContacts > 0 || orphanedInterviews > 0 || timeConflicts > 0) {
    console.error('❌  Integrity check FAILED — review the errors above.\n');
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
