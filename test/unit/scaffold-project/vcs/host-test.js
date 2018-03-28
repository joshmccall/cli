import {assert} from 'chai';
import any from '@travi/any';
import sinon from 'sinon';
import * as githubScaffolder from '../../../../src/scaffold-project/vcs/github';
import scaffoldVcsHost from '../../../../src/scaffold-project/vcs/host';

suite('vcs host scaffolder', () => {
  let sandbox;
  const projectName = any.string();

  setup(() => {
    sandbox = sinon.sandbox.create();

    sandbox.stub(githubScaffolder, 'default');
  });

  teardown(() => sandbox.restore());

  test('that hosting details are returned', () => {
    const host = any.string();

    return assert.becomes(scaffoldVcsHost({host, projectName}), {host, owner: 'travi', name: projectName}).then(() => {
      assert.notCalled(githubScaffolder.default);
    });
  });

  test('that github is scaffolded if github was chosen as the host', () => {
    const host = 'GitHub';
    githubScaffolder.default.resolves();

    return assert.becomes(scaffoldVcsHost({host, projectName}), {host, owner: 'travi', name: projectName}).then(() => {
      assert.called(githubScaffolder.default);
    });
  });
});
