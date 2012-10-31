/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Include necessary modules
var {expect} = require("../../../lib/assertions");
var prefs = require("../../../lib/prefs");
var utils = require("../../../lib/utils");

const PREF_KEEP_ALIVE = "network.http.keep-alive";
const PREF_SSL_3 = "security.enable_ssl3";
const PREF_TLS = "security.enable_tls";

const gDelay = 0;
const gTimeout = 5000;

// TODO: move the dtds to a SecurityAPI, if one will be created
const dtds = ["chrome://browser/locale/netError.dtd"];
const property = "chrome://pipnss/locale/pipnss.properties";

var setupModule = function(module) {
  module.controller = mozmill.getBrowserController();

  // XXX: Bug 513129
  //      Disable Keep-alive connections
  prefs.preferences.setPref(PREF_KEEP_ALIVE, false);

  // Disable SSL 3.0 and TLS for secure connections
  prefs.preferences.setPref(PREF_SSL_3, false);
  prefs.preferences.setPref(PREF_TLS, false);
}

var teardownModule = function(module) {
  // Reset the SSL and TLS pref
  prefs.preferences.clearUserPref(PREF_SSL_3);
  prefs.preferences.clearUserPref(PREF_TLS);

  // XXX: Bug 513129
  //      Re-enable Keep-alive connections
  prefs.preferences.clearUserPref(PREF_KEEP_ALIVE);
}

/**
 * Test that SSL and TLS are checked by default
 *
 */
var testDisableSSL = function() {
  // Open a blank page so we don't have any error page shown
  controller.open("about:blank");
  controller.waitForPageLoad();

  controller.open("https://mail.mozilla.org");
  controller.waitForPageLoad();

  // Verify "Secure Connection Failed" error page title
  var title = new elementslib.ID(controller.tabs.activeTab, "errorTitleText");
  controller.waitForElement(title, gTimeout);

  var nssFailure2title = utils.getEntity(dtds, "nssFailure2.title")
  expect.equal(title.getNode().textContent, nssFailure2title,
               "The correct SSL error title is shown");

  // Verify "Try Again" button appears
  var tryAgain = new elementslib.ID(controller.tabs.activeTab, "errorTryAgain");
  controller.assertNode(tryAgain);

  // Verify the error message is correct
  var text = new elementslib.ID(controller.tabs.activeTab, "errorShortDescText");
  controller.waitForElement(text, gTimeout);

  expect.contain(text.getNode().textContent, 'ssl_error_ssl_disabled',
                 "The SSL error message contains disabled information");

  expect.contain(text.getNode().textContent, 'mail.mozilla.org',
                 "The SSL error message contains domain name");

  var PSMERR_SSL_Disabled = utils.getProperty(property, 'PSMERR_SSL_Disabled');
  expect.contain(text.getNode().textContent, PSMERR_SSL_Disabled,
                 "The SSL error message contains disabled property");
}

/**
 * Map test functions to litmus tests
 */
// testDisableSSL.meta = {litmusids : [9345]};
