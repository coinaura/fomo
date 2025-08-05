/** @type {import('tailwindcss').Config} */
export default {
  content: [
    // entry html
    './index.html',

    // every .tsx inside src — Windows-safe absolute glob
    `${__dirname}/src/**/*.tsx`,
    `${__dirname}/src/**/*.ts`,
    `${__dirname}/src/**/*.jsx`,
    `${__dirname}/src/**/*.js`,
  ],
  theme: { extend: {} },
  plugins: [],
};
