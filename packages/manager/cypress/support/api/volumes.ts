import {
  apiCheckErrors,
  testTag,
  getAll,
  deleteById,
  isTestEntity,
  makeTestLabel
} from './common';
import strings from '../cypresshelpers';

const relativeApiPath = 'volumes';
const testVolumeTag = testTag;
const oauthtoken = Cypress.env('MANAGER_OAUTH');
const apiroot = Cypress.env('REACT_APP_API_ROOT') + '/';

const makeVolumeCreateReq = (linodeID, volume) => {
  const volumeData = volume
    ? volume
    : {
        root_pass: strings.randomPass(12),
        label: makeVolumeLabel(),
        region: 'us-east',
        tags: [testVolumeTag],
        linode_id: linodeID
      };

  return cy.request({
    method: 'POST',
    url: apiroot + relativeApiPath,
    body: volumeData,
    auth: {
      bearer: oauthtoken
    }
  });
};

export const createVolume = (linodeID, volume = undefined) => {
  return makeVolumeCreateReq(linodeID, volume).then(resp => {
    apiCheckErrors(resp);
    console.log(`Created Volume ${resp.body.label} successfully`, resp);
    return resp.body;
  });
};

export const makeVolumeLabel = makeTestLabel;

export const getVolumes = () => getAll(relativeApiPath);

export const deleteVolumeById = id => deleteById(relativeApiPath, id);

export const detachVolumeById = (path: string, id: number) => {
  return cy.request({
    method: 'POST',
    url: `${apiroot}${path}/${id}/detach`,
    auth: {
      bearer: oauthtoken
    }
  });
};

// use this if you have any volumes attached to non test linodes
export const detachAllTestVolumes = () => {
  getVolumes().then(resp => {
    resp.body.data.forEach(vol => {
      if (isTestEntity(vol) && vol.linode_id != undefined) {
        detachVolumeById(relativeApiPath, vol.id);
      }
    });
  });
};

export const deleteAllTestVolumes = () => {
  getVolumes().then(resp => {
    resp.body.data.forEach(vol => {
      if (isTestEntity(vol) && vol.linode_id == undefined) {
        deleteVolumeById(vol.id);
      }
    });
  });
};

export const clickVolumeActionMenu = title => {
  cy.get(`[aria-label="Action menu for Volume ${title}"]`).click();
};
