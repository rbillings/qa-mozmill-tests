/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Include the required modules
var { assert, expect } = require("../../../lib/assertions");
var prefs = require("../../../lib/prefs");
var tabs = require("../../../lib/tabs");
var utils = require("../../../lib/utils");

const LOCAL_TEST_FOLDER = collector.addHttpResource('../../../data/');
const LOCAL_TEST_PAGE = LOCAL_TEST_FOLDER + "popups/popup_trigger.html?count=2";

const PREF_POPUP_BLOCK = "dom.disable_open_during_load";

var setupModule = function(module)
{
  controller = mozmill.getBrowserController();
  tabBrowser = new tabs.tabBrowser(controller);
  tabBrowser.closeAllTabs();

  prefs.preferences.setPref(PREF_POPUP_BLOCK, false);
}

var teardownModule = function(module)
{
  // Reset the pop-up blocking pref
  prefs.preferences.clearUserPref(PREF_POPUP_BLOCK);

  for each (window in mozmill.utils.getWindows("navigator:browser")) {
    if (!window.toolbar.visible)
      window.close();
  }
}

/**
 * Test to make sure pop-ups are not blocked
 *
 */
var testPopUpAllowed = function()
{
  var windowCount = mozmill.utils.getWindows().length;

  // Open the Pop-up test site
  controller.open(LOCAL_TEST_PAGE);
  controller.waitForPageLoad();

  // A notification bar always exists in the DOM so check the visibility of the X button
  var button = tabBrowser.getTabPanelElement(tabBrowser.selectedIndex,
                                             '/{"value":"popup-blocked"}/anon({"type":"warning"})' +
                                             '/{"class":"messageCloseButton tabbable"}');
  assert.ok(!button.exists(), "The X button has been found");

  expect.notEqual(windowCount, mozmill.utils.getWindows().length,
                  "The window count has changed");
}
