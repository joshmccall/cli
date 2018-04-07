import {basename, resolve} from 'path';
import {prompt} from 'inquirer';
import {copyFile} from 'mz/fs';
import spdxLicenseList from 'spdx-license-list/simple';
import chalk from 'chalk';
import scaffoldReadme from './readme';
import scaffoldGit from './vcs/git';
import scaffoldLicense from './license';
import scaffoldVcsHost from './vcs/host';
import scaffoldJavaScriptProject from './javascript/scaffolder';
import scaffoldTravis from './ci/travis';
import exec from '../../third-party-wrappers/exec-as-promised';
import {
  copyrightInformationShouldBeRequested,
  licenseChoicesShouldBePresented,
  unlicensedConfirmationShouldBePresented,
  vcsHostPromptShouldBePresented
} from './prompt-conditionals';

export const questionNames = {
  PROJECT_NAME: 'projectName',
  DESCRIPTION: 'description',
  VISIBILITY: 'visibility',
  GIT_REPO: 'gitRepo',
  REPO_HOST: 'repoHost',
  UNLICENSED: 'unlicensed',
  LICENSE: 'license',
  COPYRIGHT_HOLDER: 'copyrightHolder',
  COPYRIGHT_YEAR: 'copyrightYear',
  PROJECT_TYPE: 'projectType'
};

const licenseQuestions = [
  {
    name: questionNames.UNLICENSED,
    message: 'Since this is a private project, should it be unlicensed?',
    type: 'confirm',
    when: unlicensedConfirmationShouldBePresented,
    default: true
  },
  {
    name: questionNames.LICENSE,
    message: 'How should this this project be licensed?',
    type: 'list',
    when: licenseChoicesShouldBePresented,
    choices: Array.from(spdxLicenseList),
    default: 'MIT'
  },
  {
    name: questionNames.COPYRIGHT_HOLDER,
    message: 'Who is the copyright holder of this project?',
    when: copyrightInformationShouldBeRequested,
    default: 'Matt Travi'
  },
  {
    name: questionNames.COPYRIGHT_YEAR,
    message: 'What is the copyright year?',
    when: copyrightInformationShouldBeRequested,
    default: new Date().getFullYear()
  }
];

const vcsQuestions = [
  {name: questionNames.GIT_REPO, type: 'confirm', default: true, message: 'Should a git repository be initialized?'},
  {
    name: questionNames.REPO_HOST,
    type: 'list',
    when: vcsHostPromptShouldBePresented,
    message: 'Where will the repository be hosted?',
    choices: ['GitHub', 'BitBucket', 'GitLab', 'KeyBase']
  }
];

export default async function () {
  const projectRoot = process.cwd();
  const answers = await prompt([
    {name: questionNames.PROJECT_NAME, message: 'What is the name of this project?', default: basename(projectRoot)},
    {name: questionNames.DESCRIPTION, message: 'How should this project be described?'},
    {
      name: questionNames.VISIBILITY,
      message: 'Should this project be public or private?',
      type: 'list',
      choices: ['Public', 'Private'],
      default: 'Private'
    },
    ...licenseQuestions,
    ...vcsQuestions,
    {
      name: questionNames.PROJECT_TYPE,
      type: 'list',
      message: 'What type of project is this?',
      choices: ['JavaScript', 'Other']
    }
  ]);

  const projectType = answers[questionNames.PROJECT_TYPE];
  function isJavaScriptProject() {
    return 'JavaScript' === projectType;
  }

  const projectName = answers[questionNames.PROJECT_NAME];
  const chosenLicense = answers[questionNames.LICENSE];
  const visibility = answers[questionNames.VISIBILITY];
  const vcs = await scaffoldVcsHost({host: answers[questionNames.REPO_HOST], projectName, projectRoot, projectType});
  const [license, ci, language] = await Promise.all([
    scaffoldLicense({
      projectRoot,
      license: chosenLicense,
      copyright: {year: answers[questionNames.COPYRIGHT_YEAR], holder: answers[questionNames.COPYRIGHT_HOLDER]},
      vcs
    }),
    scaffoldTravis({projectRoot, projectType, vcs, visibility}),
    isJavaScriptProject() ? scaffoldJavaScriptProject({
      projectRoot,
      projectName,
      vcs,
      visibility,
      license: chosenLicense
    }) : undefined
  ]);

  await Promise.all([
    scaffoldReadme({
      projectName,
      projectRoot,
      description: answers[questionNames.DESCRIPTION],
      license: chosenLicense,
      badges: {
        consumer: {...language && language.badges.consumer, license: license.badge},
        status: {ci: ci.badge}
      }
    }),
    answers[questionNames.GIT_REPO]
      ? scaffoldGit({projectRoot, ignore: language ? language.vcsIgnore : {}})
      : undefined,
    copyFile(resolve(__dirname, 'templates', 'editorconfig.txt'), `${projectRoot}/.editorconfig`)
  ]);

  console.log(chalk.blue('Verifying the generated project'));       // eslint-disable-line no-console
  if (language && language.verificationCommand) await exec(language.verificationCommand, {silent: false});
}
