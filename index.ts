import * as core from '@actions/core';
import fs from 'fs';
import * as plist from 'plist';
import axios from 'axios';

async function main() {
  try {
    const baseUrl = core.getInput('baseUrl');
    const appName = core.getInput('appName');
    const appVVersion = core.getInput('appVVersion');
    const appVersion = /v(.*)/.exec(appVVersion)![1];
    const config = {
      headers: { Authorization: `Bearer ${core.getInput('bearerToken')}` }
    };
 
    const distributionSummaryStr = fs.readFileSync(`${appVVersion}/DistributionSummary.plist`).toString('utf8');
    const distributionSummaryPlist = plist.parse(distributionSummaryStr) as any;
    const distributionSummary = distributionSummaryPlist[Object.keys(distributionSummaryPlist)[0]][0];

    await axios.post(`${baseUrl}/appDateExpires`, {
      expireDate: Math.floor((new Date(distributionSummary.certificate.dateExpires)).getTime() / 1000),
      expireType: 'certificate',
      appName: appName,
      appVersion: appVersion,
    }, config);

    await axios.post(`${baseUrl}/appDateExpires`, {
      expireDate: Math.floor((new Date(distributionSummary.profile.dateExpires)).getTime() / 1000),
      expireType: 'profile',
      appName: appName,
      appVersion: appVersion,
    }, config);
  } catch (error: any) {
    core.setFailed(error.message);
  }
}

main();