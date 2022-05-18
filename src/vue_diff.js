// vdom 虚拟dom
// c1老节点
// c2新节点
// old array  a b c d e f g
// new array  a b e c d h f g

// mountElement 新增元素 h
// patch  复用元素 a b c d e f g
// unmount 删除元素
// todo
// move 元素移动 ?
// import { getSequence } from './sequence';

exports.diffArray = (c1, c2, { mountElement, patch, unmount, move }) => {
	function isSameVnodeType(n1, n2) {
		return n1.key === n2.key; // && n1.type === n2.type
	}

	let i = 0 // 起始位置
	const l1 = c1.length,
		l2 = c2.length;
	let e1 = l1 - 1,
		e2 = l2 - 1; // 获取新旧节点的边界 尾位置

	// 1. 从左边向右边遍历，如果节点可以复用就继续，反之停止
	while (i <= e1 && i <= e2) {
		const n1 = c1[i],
			n2 = c2[i];
		if (isSameVnodeType(n1, n2)) {
			patch(n1.key)
		} else {
			break
		}
		i++
	}
	// 2. 从右边向左边遍历，如果节点可以复用就继续，反之停止
	while (i <= e1 && i <= e2) {
		const n1 = c1[e1],
			n2 = c2[e2];
		if (isSameVnodeType(n1, n2)) {
			patch(n1.key)
		} else {
			break
		}
		// 从右向左 需要修改边界值
		e1--
		e2--
	}

	// 3.1 旧节点没了： 如果新节点还有，则新增这部分的新节点
	if (i > e1) {
		if (i <= e2) {
			while (i <= e2) {
				mountElement(c2[i].key)
				i++
			}
		}
	}

	// 3.2 新节点没了：如果旧节点还有，则删除这部分的旧节点
	if (i <= e1) {
		if (i > e2) {
			while (i <= e1) {
				unmount(c1[i].key)
				i++
			}
		}
	}


}
















