# Project Starter Kit 🧰

This repository houses my own baseline project starter kit, which I use every time I spin up a new project on GitHub. Over time, I've formed opinions about how I want to manage my projects, including the types of labels I want and the tooling I use. This starter kit leverages GitHub's repository template feature and GitHub Actions to ensure everything is set up correctly to make spinning up a project quicker.

This template does the following:

1. Establishes opinionated pull request and issue labels, these live in `labels.json`.
2. Adds issue, pull request and funding templates.
3. Establishes a standard `dependabot.yml` configuration that can be expanded upon based on project type.
4. Adds auto-label functionality based on [Conventional Commit].
5. Adds a `release.yml` file that properly formats release notes in GitHub's Release tab based on the auto-label feature.
6. Creates a callout for GitHub sponsors in the README.

Special thank you to all the past and present [GitHub Sponsors](https://github.com/sponsors/JamesIves) 💖.

<!-- sponsors --><!-- sponsors -->

## Getting Started ⚙️

The following steps outline how you can use this template:

1. Select the `Use this template` > `Create a new repository` button at the top and give the new repository a name.
2. Go to the repository settings, enable `Discussions`, and optionally enable `Sponsorships`.
3. If you want to add your GitHub Sponsors to your README, create a personal access token with `user:read` and `org:read` scopes and configure it under `Settings -> Secrets and Variables -> Actions -> Repository Secrets` and call it `PERSONAL_ACCESS_TOKEN`. You can then move `<!-- sponsors -->` marker in your README wherever you want your sponsorship information to display. If you don't want sponsorships to display, simply delete `.github/workflows/sponsors.yml`.
4. Run the `Repository Setup` workflow by going to `Actions -> Repository Setup`. This will replace all of the placeholders scattered across the repository with your GitHub username and the repository name you defined. It will also set all of the labels in `labels.json` and clean up the setup files.
5. Replace this README and add anything else you need such as license files, code of conducts, etc. Best of luck!

## Maintenance 🔧

This template has two variables that get replaced across all file types when `setup.yml` is executed by GitHub Actions.

- `{REPLACE_WITH_REPO_NAME}` - This will replace the placeholder with the full repo name (this includes the username), for example `JamesIves/project-starter-kit`.

- `{REPLACE_WITH_REPO_OWNER}` - This will replace placeholder with the owner of the repo, ie `MontezumaIves`.
