'use strict';

const fs = require('fs');
const path = require('path');
const utils = require('./utils');
const { paths } = require('./constants');
const plugins = require('./plugins');

const Languages = module.exports;
const primaryLanguagesPath = path.join(__dirname, '../build/public/language');
const fallbackLanguagesPath = path.join(paths.baseDir, 'public/language');

function resolveLanguagesPath() {
	return fs.existsSync(primaryLanguagesPath) ? primaryLanguagesPath : fallbackLanguagesPath;
}

const files = fs.readdirSync(path.join(paths.nodeModules, '/timeago/locales'));
Languages.timeagoCodes = files.filter(f => f.startsWith('jquery.timeago')).map(f => f.split('.')[2]);

Languages.get = async function (language, namespace) {
	const languagesPath = resolveLanguagesPath();
	const pathToLanguageFile = path.resolve(languagesPath, language, `${namespace}.json`);
	if (!pathToLanguageFile.startsWith(languagesPath)) {
		throw new Error('[[error:invalid-path]]');
	}
	const data = await fs.promises.readFile(pathToLanguageFile, 'utf8');
	const parsed = JSON.parse(data) || {};
	const result = await plugins.hooks.fire('filter:languages.get', {
		language,
		namespace,
		data: parsed,
	});
	return result.data;
};

let codeCache = null;
Languages.listCodes = async function () {
	if (codeCache && codeCache.length) {
		return codeCache;
	}
	const languagesPath = resolveLanguagesPath();
	try {
		const file = await fs.promises.readFile(path.join(languagesPath, 'metadata.json'), 'utf8');
		const parsed = JSON.parse(file);

		codeCache = parsed.languages;
		return parsed.languages;
	} catch (err) {
		if (err.code !== 'ENOENT') {
			throw err;
		}
	}

	const entries = await fs.promises.readdir(languagesPath, { withFileTypes: true });
	const codes = entries.filter(entry => entry.isDirectory()).map(entry => entry.name);
	codeCache = codes;
	return codes;
};

let listCache = null;
Languages.list = async function () {
	if (listCache && listCache.length) {
		return listCache;
	}

	const codes = await Languages.listCodes();
	const languagesPath = resolveLanguagesPath();

	let languages = await Promise.all(codes.map(async (folder) => {
		try {
			const configPath = path.join(languagesPath, folder, 'language.json');
			const file = await fs.promises.readFile(configPath, 'utf8');
			const lang = JSON.parse(file);
			return lang;
		} catch (err) {
			if (err.code === 'ENOENT') {
				return;
			}
			throw err;
		}
	}));

	// filter out invalid ones
	languages = languages.filter(lang => lang && lang.code && lang.name && lang.dir);

	listCache = languages;
	return languages;
};

Languages.userTimeagoCode = async function (userLang) {
	const languageCodes = await Languages.listCodes();
	const timeagoCode = utils.userLangToTimeagoCode(userLang);
	if (languageCodes.includes(userLang) && Languages.timeagoCodes.includes(timeagoCode)) {
		return timeagoCode;
	}
	return '';
};

require('./promisify')(Languages);
