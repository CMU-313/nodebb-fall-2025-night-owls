'use strict';


define('forum/chats/archived-messages', ['api', 'alerts'], function (api, alerts) {
	const archivedMessages = {};
	let container;
	archivedMessages.init = function (_container) {
		container = _container;
		$('[component="chat/archived/messages/btn"]').on('click', async () => {
			const archivedMessagesContainer = container.find('[component="chat/messages/archived/container"]');
			if (!archivedMessagesContainer.hasClass('hidden')) {
				return archivedMessagesContainer.addClass('hidden');
			}
			const userListEl = container.find('[component="chat/user/list"]');
			userListEl.addClass('hidden');
			await archivedMessages.refreshList();
			archivedMessagesContainer.removeClass('hidden');
		});

		handleInfiniteScroll(container);
	};

	function handleInfiniteScroll(container) {
		const listEl = container.find('[component="chat/messages/archived"]');
		listEl.on('scroll', utils.debounce(async () => {
			const bottom = (listEl[0].scrollHeight - listEl.height()) * 0.85;
			if (listEl.scrollTop() > bottom) {
				const lastIndex = listEl.find('[data-index]').last().attr('data-index');
				const data = await loadData(parseInt(lastIndex, 10) + 1);
				if (data && data.length) {
					const html = await parseMessages(data);
					container.find('[component="chat/messages/archived"]').append(html);
				}
			}
		}, 200));
	}

	archivedMessages.refreshList = async function () {
		const data = await loadData(0);

		if (!data.length) {
			container.find('[component="chat/messages/archived/empty"]').removeClass('hidden');
			container.find('[component="chat/messages/archived"]').html('');
			return;
		}
		container.find('[component="chat/messages/archived/empty"]').addClass('hidden');
		const html = await parseMessages(data);
		container.find('[component="chat/messages/archived"]').html(html);
		html.find('.timeago').timeago();
	};

	async function parseMessages(data) {
		return await app.parseAndTranslate('partials/chats/archived-messages-list', 'messages', {
			isOwner: ajaxify.data.isOwner,
			isAdminOrGlobalMod: ajaxify.data.isAdminOrGlobalMod,
			messages: data,
		});
	}

	async function loadData(start) {
		const { messages } = await api.get(`/chats/${ajaxify.data.roomId}/messages/archived`, { start });
		return messages;
	}

	archivedMessages.archive = function (mid, roomId) {
		api.put(`/chats/${roomId}/messages/${mid}/archive`, {}).then(() => {
			$(`[component="chat/message"][data-mid="${mid}"]`).toggleClass('archived', true);
			archivedMessages.refreshList();
		}).catch(alerts.error);
	};

	archivedMessages.unarchiv = function (mid, roomId) {
		api.del(`/chats/${roomId}/messages/${mid}/archive`, {}).then(() => {
			$(`[component="chat/message"][data-mid="${mid}"]`).toggleClass('archived', false);
			container.find(`[component="chat/messages/archived"] [data-mid="${mid}"]`).remove();
			if (!container.find(`[component="chat/messages/archived"] [data-mid]`).length) {
				container.find('[component="chat/messages/archived/empty"]').removeClass('hidden');
			}
		}).catch(alerts.error);
	};

	return archivedMessages;
});
