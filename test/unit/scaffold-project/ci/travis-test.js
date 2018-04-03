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

  test('that the travis config is not created if the project is not javascript', () => assert.becomes(
    scaffoldTravis({projectType: any.string()}),
    {}
  ).then(() => assert.notCalled(yamlWriter.default)));

  suite('javascript', () => {
    const projectRoot = any.string();
    const vcs = {owner: any.word(), name: any.word()};

    test('that a base config is created for a javascript project', () => {
      yamlWriter.default.resolves();

      return assert.becomes(
        scaffoldTravis({projectType: 'JavaScript', projectRoot, vcs, visibility: 'Public'}),
        {
          badge: {
            img: `https://img.shields.io/travis/${vcs.owner}/${vcs.name}.svg?branch=master`,
            link: `https://travis-ci.org/${vcs.owner}/${vcs.name}`,
            text: 'Build Status'
          }
        }
      ).then(() => assert.calledWith(
        yamlWriter.default,
        `${projectRoot}/.travis.yml`,
        {language: 'node_js', notifications: {email: false}}
      ));
    });

    test('that a badge is not defined for a private project', () => assert.becomes(
      scaffoldTravis({projectType: 'JavaScript', projectRoot, vcs, visibility: 'Private'}),
      {}
    ));
  });
});
