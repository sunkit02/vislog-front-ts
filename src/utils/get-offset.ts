export function getAbsoluteOffsetX(node: HTMLElement): number {
	let offset = 0;

	let currNode: HTMLElement | null = node;
	while (currNode) {
		const nodeOffset = currNode.offsetLeft;
		offset += nodeOffset;
		currNode = currNode.parentElement;
	}

	return offset - node.offsetLeft;
}
