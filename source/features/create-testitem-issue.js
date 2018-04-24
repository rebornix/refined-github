import {h} from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate';
import onetime from 'onetime';
import * as icons from '../libs/icons';
import * as pageDetect from '../libs/page-detect';
import {metaKey, safeOnAjaxedPages} from '../libs/utils';
import observeEl from '../libs/simplified-element-observer';

async function addButtons() {
	let isTestplanItem = false;
	for (const label of select.all('.labels a')) {
		if (label.title === 'testplan-item') {
			isTestplanItem = true;
		}
	}

	if (isTestplanItem) {
		let newCommentForm = select('.js-new-comment-form');
		let commentActions = select('#partial-new-comment-form-actions', newCommentForm);

		if (commentActions) {
			commentActions.appendChild(
				<button type="button" class="btn btn-primary rgh-createissue-btn" data-disable-with>
					Create Issue
				</button>
			)
		}
	}
}

function createTestItemIssue(event) {
	let textarea = select('textarea#new_comment_field');
	if (!textarea) {
		return;
	}

	let content = textarea.value;
	let issueContent = '';
	let issueTitle = '';
	let reg = new RegExp(/\s*# (.*)\s*([\S\s]*)/);
	let matches = reg.exec(content);
	if (matches) {
		issueTitle = matches[1];
		issueContent = matches[2];
	} else {
		issueContent = content;
	}

	let issueNumber = select('.gh-header-number').textContent;
	let issueBody = `Testing ${issueNumber}\n\n${issueContent}`;

	let op;
	if (pageDetect.isPR()) {
		const titleRegex = /^(?:.+) by (\S+) · Pull Request #(\d+)/;
		[, op] = titleRegex.exec(document.title) || [];
	} else {
		op = select('.timeline-comment-header-text .author').textContent;
	}

	let reportIssueUrl = 'https://github.com/Microsoft/vscode/issues/new';
	const queryStringPrefix = reportIssueUrl.indexOf('?') === -1 ? '?' : '&';
	let baseUrl = `${reportIssueUrl}${queryStringPrefix}title=${encodeURIComponent(issueTitle)}`;
	let url = baseUrl + `&body=${encodeURIComponent(issueBody)}&assignees=${op}`;
	window.open(url);
	textarea.value = '';
}

function listen() {
	delegate('.rgh-createissue-btn', 'click', createTestItemIssue);
}

export default function () {
	const listenOnce = onetime(listen);
	safeOnAjaxedPages(() => {
		if (pageDetect.isIssue() || pageDetect.isNewIssue()) {
			addButtons();
			listenOnce();
		}
	});
}
