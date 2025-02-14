//
//  This file is part of the 2FAS Browser Extension (https://github.com/twofas/2fas-browser-extension)
//  Copyright © 2023 Two Factor Authentication Service, Inc.
//  Contributed by Grzegorz Zając. All rights reserved.
//
//  This program is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation, either version 3 of the License, or
//  any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
//  GNU General Public License for more details.
//
//  You should have received a copy of the GNU General Public License
//  along with this program. If not, see <https://www.gnu.org/licenses/>
//

const { loadFromLocalStorage, saveToLocalStorage } = require('../../localStorage');
const storeLog = require('../../partials/storeLog');
const SDK = require('../../sdk');
const checkTabCS = require('../functions/checkTabCS');

const onTabUpdated = async (tabID, changeInfo) => {
  if (!changeInfo) {
    return false;
  }

  if (tabID && changeInfo.status === 'complete') {
    await checkTabCS(tabID);
  }

  if (!changeInfo?.url) {
    return false;
  }

  let storage;

  try {
    storage = await loadFromLocalStorage([`tabData-${tabID}`, 'extensionID']);
  } catch (err) {
    return storeLog('error', 3, err, storage[`tabData-${tabID}`]?.url);
  }

  if (storage[`tabData-${tabID}`]?.url !== changeInfo.url) {
    return false;
  }

  if (storage[`tabData-${tabID}`] && storage[`tabData-${tabID}`].requestID) {
    await new SDK().close2FARequest(storage.extensionID, storage[`tabData-${tabID}`].requestID, false);
  }

  if (storage[`tabData-${tabID}`]) {
    return saveToLocalStorage({ [`tabData-${tabID}`]: {} })
      .then(() => { storage = null; })
      .catch(err => storeLog('error', 3, err, storage[`tabData-${tabID}`]?.url));
  }
};

module.exports = onTabUpdated;
