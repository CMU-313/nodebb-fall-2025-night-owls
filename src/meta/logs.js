'use strict';

const path = require('path');
const fs = require('fs');

const Logs = module.exports;

Logs.path = path.resolve(__dirname, '../../logs/output.log');

async function ensureLogFile() {
	try {
		await fs.promises.access(Logs.path);
	} catch (err) {
		if (err.code !== 'ENOENT') {
			throw err;
		}

		await fs.promises.mkdir(path.dirname(Logs.path), { recursive: true });
		await fs.promises.writeFile(Logs.path, '');
	}
}

Logs.get = async function () {
	await ensureLogFile();
	return await fs.promises.readFile(Logs.path, 'utf-8');
};

Logs.clear = async function () {
	await ensureLogFile();
	await fs.promises.truncate(Logs.path, 0);
};
