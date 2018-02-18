import fs from 'mz/fs';
import spdxLicenseList from 'spdx-license-list/simple';
import spdxLicenseListWithContent from 'spdx-license-list/full';
import sinon from 'sinon';
import {assert} from 'chai';
import any from '@travi/any';
import scaffoldLicense from '../../../src/scaffold-project/license';

suite('license', () => {
  let sandbox;

  setup(() => {
    sandbox = sinon.sandbox.create();

    sandbox.stub(fs, 'writeFile');
  });

  teardown(() => sandbox.restore());

  test('that no license file is created when no license was chosen', () => {
    scaffoldLicense({});

    assert.notCalled(fs.writeFile);
  });

  test('that the contents for the chosen license are written to LICENSE', () => {
    const projectRoot = any.string();
    const license = any.fromList(Array.from(spdxLicenseList));
    fs.writeFile.resolves();

    return scaffoldLicense({projectRoot, license}).then(() => assert.calledWith(
      fs.writeFile,
      `${projectRoot}/LICENSE`,
      spdxLicenseListWithContent[license].licenseText
    ));
  });
});
