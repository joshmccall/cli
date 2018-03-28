import sinon from 'sinon';
import any from '@travi/any';
import {assert} from 'chai';
import * as yamlWriter from '../../../../third-party-wrappers/write-yaml';
import scaffoldTravis from '../../../../src/scaffold-project/ci/travis';

suite('travis', () => {
  let sandbox;

  setup(() => {
    sandbox = sinon.sandbox.create();

    sandbox.stub(yamlWriter, 'default');
  });

  teardown(() => sandbox.restore());

  test('that the travis config is not created if the project is not javascript', () => scaffoldTravis({
    projectType: any.string()
  }).then(() => assert.notCalled(yamlWriter.default)));

  suite('javascript', () => {
    test('that a base config is created for a javascript project', () => {
      const projectRoot = any.string();
      yamlWriter.default.resolves();

      return scaffoldTravis({projectType: 'JavaScript', projectRoot}).then(() => assert.calledWith(
        yamlWriter.default,
        `${projectRoot}/.travis.yml`,
        {language: 'node_js', notifications: {email: false}}
      ));
    });
  });
});
