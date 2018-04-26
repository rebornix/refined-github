import OptionsSync from 'webext-options-sync';
import ghInjection from 'github-injection';

import {h} from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate';
import onetime from 'onetime';
import * as icons from '../libs/icons';
import * as pageDetect from '../libs/page-detect';
import {metaKey, safeOnAjaxedPages} from '../libs/utils';
import observeEl from '../libs/simplified-element-observer';
import {appendBefore} from '../libs/utils';
import {safeElementReady} from '../libs/utils';

const options = new OptionsSync().getAll();

async function addButtons() {
	const { vscodeCurrentMileStone = '', logging = false } = await options;

	if (vscodeCurrentMileStone === '') {
		return;
	}

	let isCurrentMilestone = false;
	for (const milestone of select.all('div.sidebar-milestone form a.milestone-name strong')) {
		if (milestone.textContent === vscodeCurrentMileStone) {
			isCurrentMilestone = true;
			break;
		}
	}

	if (!isCurrentMilestone) {
		return;
	}

	const issueStatelabel = select('.gh-header-meta .State svg');

	if (!issueStatelabel.classList.contains('octicon-issue-closed')) {
		return;
	}

	select('.js-issue-labels-container').before(
		<div>
			<button type="button" class="discussion-sidebar-heading discussion-sidebar-toggle js-menu-target start-verification">Start Verification</button>
			<hr />
		</div>
	);
}

async function startVerification(event) {
	let labelsBtn = select('div.js-issue-labels-container div.select-menu > button')
	console.log(labelsBtn);
	labelsBtn.click();
	setTimeout(async () => {
		const verifiedLabel = await safeElementReady('div.select-menu-item-text input[data-label-name="verified"]')
		verifiedLabel.parentNode.parentNode.click();
		document.body.click();
	}, 500);

	event.preventDefault();
	event.stopPropagation();
}

function listen() {
	delegate('.start-verification', 'click', startVerification);
}

export default function () {
	const listenOnce = onetime(listen);
	safeOnAjaxedPages(() => {
		if (pageDetect.isIssue()) {
			addButtons();
			listenOnce();
		}
	});
}
