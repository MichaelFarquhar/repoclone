import { program } from "commander";
import inquirer from "inquirer";
import axios from "axios";
import { execSync } from "child_process";

const getApiUrl = (name) => `https://api.github.com/users/${name}/repos`;

const logError = (errorString) => {
  return console.error("\x1b[31m", errorString, "\x1b[0m");
};

// --- Setup Program ---
program
  .name("repoclean")
  .description("Your command description")
  .option("-o, --option", "Your option description")
  .action((options) => {
    inquirer
      .prompt([
        {
          type: "input",
          name: "username",
          message: "Enter a Github user or organization",
        },
      ])
      .then((answers) => {
        axios
          .get(getApiUrl(answers.username))
          .then((response) => {
            // Get all repo names
            const repos = response.data.map((repo) => repo.name);

            // Create clone http url
            const getCloneURL = (repoName) =>
              `https://github.com/${answers.username}/${repoName}.git`;

            inquirer
              .prompt([
                {
                  type: "checkbox",
                  name: "reposSelected",
                  message: "Select your options",
                  choices: repos,
                },
              ])
              .then((answers) => {
                answers.reposSelected.forEach((repoName) => {
                  try {
                    execSync(`git clone ${getCloneURL(repoName)}`);
                    console.info(
                      `> Successfully cloned \x1b[34m${repoName}\x1b[0m`
                    );
                  } catch (error) {
                    console.error(`Failed to clone: ${repoName}`);
                  }
                });
              });
          })
          .catch((error) => {
            if (error.code === "ERR_BAD_REQUEST") {
              logError("Error: user or organization name not found.");
            } else {
              logError(`Error: ${error.code}`);
            }
          });
      });
  });

program.parse(process.argv);
