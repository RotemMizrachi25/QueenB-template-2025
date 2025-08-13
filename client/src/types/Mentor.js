// client/src/types/Mentor.js

/**
 * @typedef {("HTML" | "CSS" | "JAVASCRIPT" | "REACT" | "NODE" | "FULLSTACK" | string)} Tech
 */

/**
 * @typedef {Object} Mentor
 * @property {string} id
 * @property {string} firstName
 * @property {string} lastName
 * @property {Tech} headlineTech
 * @property {number} yearsOfExperience
 * @property {string} [about]
 * @property {string} [email]
 * @property {string} [phone]
 * @property {string} [linkedinUrl]
 * @property {string} [avatarUrl]
 * @property {Tech[]} [tags]
 */