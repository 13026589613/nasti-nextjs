const lintScript = () => "npm run lint";
const gitAdd = (filenames) => `git add ${filenames.join(" ")}`;

module.exports = {
  "*.{js,jsx,ts,tsx}": [lintScript, gitAdd],
};
