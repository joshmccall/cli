import {questionNames} from './scaffolder';

export function vcsHostPromptShouldBePresented(answers) {
  return answers[questionNames.GIT_REPO];
}

export function unlicensedConfirmationShouldBePresented(answers) {
  return 'Private' === answers[questionNames.VISIBILITY];
}

export function licenseChoicesShouldBePresented(answers) {
  return 'Public' === answers[questionNames.VISIBILITY] || !answers[questionNames.UNLICENSED];
}
