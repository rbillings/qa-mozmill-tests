/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Include required modules
var { expect } = require("../../../../lib/assertions");
var modalDialog = require("../../../../lib/modal-dialog");
var prefs = require("../../../../lib/prefs");
var tabs = require("../../../../lib/tabs");
var toolbars = require("../../../../lib/toolbars");
var utils = require("../../../../lib/utils");


const LOCAL_TEST_FOLDER = collector.addHttpResource('../../../../data/');
const LOCAL_TEST_PAGE = LOCAL_TEST_FOLDER + 'password_manager/login_form.html';

var setupModule = function(module) {
  controller = mozmill.getBrowserController();
  locationBar = new toolbars.locationBar(controller);
  tabBrowser = new tabs.tabBrowser(controller);

  tabBrowser.closeAllTabs();
}

/**
 * Test saving login information and setting a master password
 */
var testSetMasterPassword = function() {
  // Go to the sample login page and perform a test log-in with inputted fields
  controller.open(LOCAL_TEST_PAGE);
  controller.waitForPageLoad();

  var userField = new elementslib.ID(controller.tabs.activeTab, "uname");
  var passField = new elementslib.ID(controller.tabs.activeTab, "Password");

  controller.waitForElement(userField);
  controller.type(userField, "bar");
  controller.type(passField, "foo");

  var loginButton = new elementslib.ID(controller.tabs.activeTab, "LogIn");
  controller.waitThenClick(loginButton);

  // After logging in, remember the login information
  var button = locationBar.getNotificationElement(
                 "password-save-notification",
                 '/anon({"anonid":"button"})'
               );

  expect.ok(utils.isDisplayed(controller, button),
            "Remember password button is visible");

  // Click the Remember Password button
  controller.waitThenClick(button);

  // After clicking the 'Remember Password' button, check notification state
  var notification = locationBar.getNotification();

  expect.waitFor(function() {
    return notification.getNode().state == 'closed';
  }, "Password notification should be closed");

  // Call preferences dialog and invoke master password functionality
  prefs.openPreferencesDialog(controller, prefDialogSetMasterPasswordCallback);
}

/**
 * Handler for preferences dialog to set the Master Password
 * @param {MozMillController} controller
 *        MozMillController of the window to operate on
 */
var prefDialogSetMasterPasswordCallback = function(controller) {
  var prefDialog = new prefs.preferencesDialog(controller);

  prefDialog.paneId = 'paneSecurity';

  var masterPasswordCheck = new elementslib.ID(controller.window.document, "useMasterPassword");
  controller.waitForElement(masterPasswordCheck);

  // Call setMasterPassword dialog and set a master password to your profile
  var md = new modalDialog.modalDialog(controller.window);
  md.start(masterPasswordHandler);

  controller.click(masterPasswordCheck);
  md.waitForDialog();

  // Close the Preferences dialog
  prefDialog.close(true);
}

/**
 * Set the master password via the master password dialog
 * @param {MozMillController} controller
 *        MozMillController of the window to operate on
 */
var masterPasswordHandler = function(controller) {
  var pw1 = new elementslib.ID(controller.window.document, "pw1");
  var pw2 = new elementslib.ID(controller.window.document, "pw2");

  // Fill in the master password into both input fields and click ok
  controller.waitForElement(pw1);
  controller.type(pw1, "test1");
  controller.type(pw2, "test1");

  // Call the confirmation dialog and click ok to go back to the preferences dialog
  var md = new modalDialog.modalDialog(controller.window);
  md.start(confirmHandler);

  var button = new elementslib.Lookup(controller.window.document,
                           '/id("changemp")/anon({"anonid":"buttons"})/{"dlgtype":"accept"}');
  controller.waitThenClick(button);
  md.waitForDialog();
}

/**
 * Call the confirmation dialog and click ok to go back to the preferences dialog
 * @param {MozMillController} controller
 *        MozMillController of the window to operate on
 */
var confirmHandler = function(controller) {
  var button = new elementslib.Lookup(controller.window.document,
                               '/id("commonDialog")/anon({"anonid":"buttons"})/{"dlgtype":"accept"}');
  controller.waitThenClick(button);
}