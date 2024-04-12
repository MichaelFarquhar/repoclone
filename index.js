#! /usr/bin/env node

import { program } from "commander";
import inquirer from "inquirer";
import axios from "axios";
import { execSync } from "child_process";

const getApiUrl = (name) => `https://api.github.com/users/${name}/repos`;

const logError = (errorString) => {
  return console.error("\x1b[31mError:", errorString, "\x1b[0m");
};

const handleApiError = (error) => {
  if (error.code === "ERR_BAD_REQUEST") {
    logError("user or organization not found.");
  } else {
    logError(error.code);
  }
};

// --- Setup Program ---
program
  .name("repoclean")
  .description(
    "Clone multiple GitHub repositories for a specified username or organization into the current working directory."
  )
  .version("1.0.3")
  .action(() => {
    inquirer
      .prompt([
        {
          type: "input",
          name: "usernameInput",
          message: "Enter a Github user or organization:",
          prefix: "\n ->",
        },
      ])
      .then(({ usernameInput }) => {
        axios
          .get(getApiUrl(usernameInput))
          .then((response) => {
            // Get all repo names
            const repos = response.data.map((repo) => repo.name);

            // Create clone http url
            const getCloneURL = (repoName) =>
              `https://github.com/${usernameInput}/${repoName}.git`;

            inquirer
              .prompt([
                {
                  type: "checkbox",
                  name: "reposSelected",
                  message: "Select repositories to clone:",
                  choices: repos,
                  prefix: "\n ->",
                },
              ])
              .then(({ reposSelected }) => {
                reposSelected.forEach((repoName) => {
                  try {
                    execSync(`git clone ${getCloneURL(repoName)}`);
                    console.info(
                      `> Successfully cloned \x1b[34m${repoName}\x1b[0m`
                    );
                  } catch (err) {
                    logError(`Failed to clone: ${repoName}`);
                  }
                });
              });
          })
          .catch(handleApiError);
      });
  });

program.parse(process.argv);
