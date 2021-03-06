'use strict';

var FS = require('fs');
var PATH = require('path');
var filesize = require('filesize'),
        mime = require('mime');


function directoryTree (urlBase, base, path) {
	const name = PATH.basename(path);
	const item = { path, name };
	let stats;

	try {
    stats = FS.statSync(base + '/' + path);
  }
	catch (e) { return null; }

  item.modified = new Date(stats.mtime.getTime()).toISOString();

	if (stats.isFile()) {
		const ext = PATH.extname(path).toLowerCase();
    if (!config.includeHistoryFiles
      && item.name.endsWith(config.historyExtention)) {
        return null;
      }
    if (!config.includeDotFiles && item.name.startsWith(".")) {
          return null;
      }
		item.size = stats.size;  // File size in bytes
    item.humanSize = filesize(stats.size);
		item.extension = ext;
    item.url = urlBase + path;
    item.history = urlBase + '/history' + path;
    item.type = 'file';
    item.mimeType = mime.lookup(ext);
	}
	else if (stats.isDirectory()) {
    if (!config.includeDotDirectories && item.name.startsWith(".")) {
        return null;
      }
		try {
      item.type = 'directory'
			item.children = FS.readdirSync(base + '/' + path)
				.map(child => directoryTree(urlBase, base, PATH.join(path, child)))
				.filter(e => !!e);
			item.size = item.children.reduce((prev, cur) => prev + cur.size, 0);
      item.humanSize = filesize(item.size);

		} catch(ex) {
			if (ex.code == "EACCES")
				//User does not have permissions, ignore directory
				return null;
		}
	} else {
		return null; // Or set item.size = 0 for devices, FIFO and sockets ?
	}
	return item;
}

module.exports = directoryTree;
