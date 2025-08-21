import { __BROWSER__ } from 'svelte-petit-utils';

type width = number;
type height = number;

type SIZE = [width, height];
type ElementResize = (rect: SIZE) => any;

const resized = new Map<Element, ElementResize>();
const resizes = __BROWSER__
	? new ResizeObserver((entries) => {
			const { contentRect, target } = entries[0];
			const { width, height } = contentRect;
			resized.get(target)!([width, height]);
	  })
	: undefined;

export function onResize(el: HTMLElement, cb: ElementResize) {
	update(cb);
	resizes?.observe(el);
	return { update, destroy };

	function update(newCb: ElementResize) {
		cb = newCb;
		resized.set(el, cb);
		const { offsetWidth, offsetHeight } = el;
		cb([offsetWidth, offsetHeight]);
		return;
	}

	function destroy() {
		resizes?.unobserve(el);
		resized.delete(el);
	}
}
