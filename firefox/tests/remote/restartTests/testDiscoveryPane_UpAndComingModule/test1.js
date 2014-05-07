/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

// Include required modules
var addons = require("../../../../lib/addons");
var {assert, expect} = require("../../../../../lib/assertions");
var modalDialog = require("../../../../lib/modal-dialog");
var prefs = require("../../../../lib/prefs");
var tabs = require("../../../../lib/tabs");

const PREF_INSTALL_DIALOG = "security.dialog_enable_delay";
const PREF_LAST_CATEGORY = "extensions.ui.lastCategory";

const INSTALL_DIALOG_DELAY = 1000;
const TIMEOUT_DOWNLOAD = 25000;

const INSTALL_SOURCE = "discovery-upandcoming";

function setupModule(aModule) {
  aModule.controller = mozmill.getBrowserController();
  aModule.addonsManager = new addons.AddonsManager(aModule.controller);

  prefs.preferences.setPref(PREF_INSTALL_DIALOG, INSTALL_DIALOG_DELAY);

  tabs.closeAllTabs(aModule.controller);
}

function teardownModule(aModule) {
  prefs.preferences.clearUserPref(PREF_INSTALL_DIALOG);
  prefs.preferences.clearUserPref(PREF_LAST_CATEGORY);

  aModule.addonsManager.close();
}

/**
 * Tests installation of an Up & Coming add-on
 */
function testInstallUpAndComingAddon() {
  addonsManager.open();

  // Wait for the Get Add-ons pane to load
  var discovery = addonsManager.discoveryPane;
  discovery.waitForPageLoad();

  // Click on a random addon
  var upComing = discovery.getSection("up-and-coming");
  var addonList = discovery.getElements({type: "upAndComing_addons", parent: upComing});
  var randomIndex = Math.floor(Math.random() * addonList.length);
  var randomAddon = addonList[randomIndex];
  var addonId = randomAddon.getNode().getAttribute("data-guid");
  var addonName = randomAddon.getNode().lastElementChild.textContent;

  controller.click(randomAddon);
  discovery.waitForPageLoad();

  // Install the addon
  var addToFirefox = discovery.getElement({type: "addon_installButton"});
  var currentInstallSource = discovery.getInstallSource(addToFirefox);

  expect.equal(currentInstallSource, INSTALL_SOURCE, "Installation link has source set");

  var md = new modalDialog.modalDialog(addonsManager.controller.window);

  md.start(addons.handleInstallAddonDialog);
  controller.click(addToFirefox);
  md.waitForDialog(TIMEOUT_DOWNLOAD);

  // Verify the addon is installed
  addonsManager.setCategory({
    category: addonsManager.getCategoryById({id: "extension"})
  });

  var addon = addonsManager.getAddons({attribute: "value", value: addonId})[0];
  var addonIsInstalled = addonsManager.isAddonInstalled({addon: addon});

  assert.ok(addonIsInstalled, "Extension '" + addonName + "' has been installed");
}

setupModule.__force_skip__ = "Bug 780556 - Mozmill test failure remote/restartTests/" +
                             "testDiscoveryPane_UpAndComingModule/test1.js " +
                             "sometime fails with 'aElement is undefined'";
teardownModule.__force_skip__ = "Bug 780556 - Mozmill test failure remote/restartTests/" +
                                "testDiscoveryPane_UpAndComingModule/test1.js " +
                                "sometime fails with 'aElement is undefined'";
