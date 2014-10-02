/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

var files = exports;


const iniFactory = Cc["@mozilla.org/xpcom/ini-processor-factory;1"]
                   .getService(Ci.nsIINIParserFactory);


/**
 * Class to handle files
 *
 * @param {nsIFile} aFile
 *        Reference to the file
 */
function File(aFile) {
  this._file = aFile;
}

File.prototype = {
  /**
   * Get path of the file
   *
   * @returns {string} Path
   */
  get path() {
    return this._file.path;
  },

  /**
   * Read the contents of a file
   *
   * @returns {string} Contents
   */
  get contents() {
    assert.ok(this._file.exists(), "File has been found: " + this._file.path);

    var fstream = Cc["@mozilla.org/network/file-input-stream;1"].
                  createInstance(Ci.nsIFileInputStream);
    var cstream = Cc["@mozilla.org/intl/converter-input-stream;1"].
                  createInstance(Ci.nsIConverterInputStream);
    fstream.init(this._file, -1, 0, 0);
    cstream.init(fstream, "UTF-8", 0, 0);

    var data = "";
    var str = {};
    var read = 0;

    do {
      read = cstream.readString(0xffffffff, str);
      data += str.value;
    } while (read != 0);

    cstream.close();

    return data;
  },

  /**
   * Write the specified contents to the file
   *
   * @param {string} aContents
   *        Contents to write
   */
  set contents(aContents) {
    var foStream = Cc["@mozilla.org/network/file-output-stream;1"]
                   .createInstance(Ci.nsIFileOutputStream);
    foStream.init(this._file, 0x02 | 0x08 | 0x20, -1, 0);
    foStream.write(aContents, aContents.length);
    foStream.close();
  }
};

/**
 * Class to handle INI files
 *
 * @param {nsIFile} aFile
 *        Reference to the INI file
 */
function INIFile(aFile) {
  File.call(this, aFile);

  this._parser = iniFactory.createINIParser(this._file);
  this._writer = iniFactory.createINIParser(this._file)
                           .QueryInterface(Ci.nsIINIParserWriter);
}

INIFile.prototype = Object.create(File.prototype);
INIFile.prototype.constructor = INIFile;

/**
 * Return a nsIFile reference of the INI file
 *
 * @returns {nsIFile} File reference
 */
INIFile.prototype.__defineGetter__("file", function() {
  return this._file;
});

/**
 * Return the list of keys for the given section
 *
 * @param {string} aSection
 *        Name of the section to return the keys for
 *
 * @returns {string[]} Available keys
 */
INIFile.prototype.getKeys = function INIFile_getKeys(aSection) {
  var enumerator = this._parser.getKeys(aSection);
  var keys = [];

  while (enumerator && enumerator.hasMore()) {
    keys.push(enumerator.getNext());
  }

  return keys;
};

/**
 * Return the list of sections
 *
 * @returns {string[]} Available sections
 */
INIFile.prototype.getSections = function INIFile_getSections() {
  var enumerator = this._parser.getSections();
  var sections = [];

  while (enumerator && enumerator.hasMore()) {
    sections.push(enumerator.getNext());
  }

  return sections;
};

/**
 * Read the value of the given key
 *
 * @param {string} aSection
 *        Name of the section
 * @param {string} aKey
 *        Name of the key
 *
 * @returns {string} Value of the key
 */
INIFile.prototype.getValue = function INIFile_getValue(aSection, aKey) {
  return this._parser.getString(aSection, aKey);
};

/**
 * Write the value for the given key
 *
 * @param {string} aSection
 *        Name of the section
 * @param {string} aKey
 *        Name of the key
 * @param {string} aValue
 *        Data to be written
 */
INIFile.prototype.setValue = function INIFile_getValue(aSection, aKey, aValue) {
  this._writer.setString(aSection, aKey, aValue);
  this._writer.writeFile(null, Ci.nsIINIParserWriter.WRITE_UTF16);
}


// Export of classes
exports.File = File;
exports.INIFile = INIFile;