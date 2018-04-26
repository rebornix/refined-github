import select from 'select-dom';
import delegate from 'delegate';

const observer = new IntersectionObserver(([{intersectionRatio, target}]) => {
	if (intersectionRatio === 0) {
		observer.unobserve(target);
		const dropdown = select(`
			.dropdown-details[open] summary,
			body.menu-active .modal-backdrop
		`);
		if (dropdown) {
			dropdown.click();
		}
	}
});

export default function () {
	delegate('.dropdown-details, .js-menu-target', 'click', event => {
		const button = event.delegateTarget;
		const dropdown = button.closest('.select-menu, .dropdown')
		if (!dropdown) {
			return;
		}
		const modal = dropdown
			.querySelector('.select-menu-modal, .dropdown-menu');
		if (modal && (!button.open || button.classList.contains('selected'))) {
			observer.observe(modal);
		}
	});
}
