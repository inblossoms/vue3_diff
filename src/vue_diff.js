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
// import { getSequence } from './sequence.js';

exports.diffArray = (c1, c2, { mountElement, patch, unmount, move }) => {
	function isSameVnodeType(n1, n2) {
		return n1.key === n2.key; // && n1.type === n2.type
	}

	let i = 0 // 起始位置
	let l1 = c1.length,
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
	else if (i > e2) {
		if (i <= e1) {
			while (i <= e1) {
				unmount(c1[i].key)
				i++
			}
		}
	} else {
		// 4. 新旧节点都还有，但顺序不稳定，则对节点进行相应的增、删、移
		// 4.1 因为剩下的这些新老节点顺序是"乱序",所以为了方便接下来的查找，可以把新节点做成key：value（index: 一来是可以通过index在数组中获取值，再就是可以记录对应的地址）的Map图 -- 涉及：散列表（拉链法、红黑树）
		// 处理新节点
		const s1 = i;
		const s2 = i;
		const keyToNewIndexMap = new Map();

		for (i = s2; i <= e2; i++) {
			const nextChild = c2[i]; // 新节点
			keyToNewIndexMap.set(nextChild.key, i)
		}

		const toBePatched = e2 - s2 + 1 // 需要处理的元素个数(新增、更新)
		// 4.2 下标是新元素的相对下标，初始值是0。 如果节点被复用了，只就是老元素的下标加一
		const newIndexToOldIndextMap = new Array(toBePatched)
		for (i = 0; i < toBePatched; i++) {
			newIndexToOldIndextMap[i] = 0 // 新节点置为0
		}

		let patched = 0 // 记录我们要更新的个数 当达到要更新数目时 就可以停止了
		let moved = false; // 默认情况下 没有节点需要移动
		let maxNewIndexSoFar = 0; // 记录初始化位置 默认为0

		// 4.3 处理旧元素
		for (i = s1; i <= e1; i++) {
			const pervChild = c1[i]

			if (patched >= toBePatched) {
				unmount(pervChild.key)
				continue
			}

			// 查看旧元素是否被复用： 和利用新元素生成的Map图做对比
			const newIndex = keyToNewIndexMap.get(pervChild.key)
			if (newIndex === undefined) {
				// 节点无法被复用
				unmount(pervChild.key)
			} else {
				// 节点要被复用
				if (newIndex >= maxNewIndexSoFar) {
					maxNewIndexSoFar = newIndex // 没有被复用
				} else {
					moved = true
				}


				newIndexToOldIndextMap[newIndex - s2] = i + 1 // 新节点的mount
				patch(pervChild.key) // 因为复用，所以新旧key值是一样的

				patched++
			}
		}

		// 处理在新节点中相对于父节点来说是move、mount 的节点
		// move: 我们在移动时需要一个相对位置：
		// 1. 如果从前往后插，我们同时需要拿到下一个节点位置显然不合理
		// 2. 如果从后往前插，就可满足在任何位置插入的情况

		const increasingNewIndexSequence = moved
			? getSequence(newIndexToOldIndextMap)
			: [] // 获取到的是最长递增子序列
		let lastIndex = increasingNewIndexSequence.length - 1 // 最后一个元素的下标
		for (i = toBePatched - 1; i >= 0; i--) {
			const nextChildIndex = s2 + i, // 切记：我们这里处理的是新集合
				nextChild = c2[nextChildIndex];

			//  - 判断是否进行节点移动
			if (newIndexToOldIndextMap[i] === 0) {
				mountElement(nextChild.key)
			} else {
				if (lastIndex < 0 || i != increasingNewIndexSequence[lastIndex]) { // 代表除去子序列之外，且不包含在稳定序列中的 需要移动的
					move(nextChild.key)
				} else {
					lastIndex--
				}
			}
		}
	}
	/**
 * author:
 * params: 
 * 	arr(发生变动的数据组成的新集和)
 * desc: 实现 [最长递增子序列(longest increasing subsequence)] 来做动态规划
*/
	// sequence 处理新旧VNode中的差异节点部分
	function getSequence(arr) {
		const lis = [0] // 返回的是 lis 的下标组成的数组
		let recordIndexOfI = arr.slice(); // 记录每一 i 次的变化时，i 的真实位置

		const len = arr.length;
		for (let i = 0; i < len; i++) {
			const curEle = arr[i];

			// 如果元素为0 证明当前位置上没有新元素，不需要算到lis里，直接跳过即可
			if (curEle !== 0) {
				const last = lis[lis.length - 1]; // 最后一个元素
				if (arr[last] < curEle) {
					recordIndexOfI[i] = last; // 记录每一次排列目标的索引
					lis.push(i) // 当目标值大于last时，可以直接放入集合
					continue
				}

				// 当目标值小于last时，我们应该保证最长子序列来做动态规划
				// 否则把 curEle , 因为lis是有序的，所以可以通过二分插入
				let left = 0,
					right = lis.length - 1;
				while (left < right) {
					const mid = (left + right) >> 1
					curEle < arr[lis[mid]] ? right = mid : left = mid + 1
				}

				// 从LIS中找到所以比目标值大的中的最小值 进行替换
				if (curEle < arr[lis[left]]) {
					// 记录第i 次替换前的位置
					(left > 0) && (recordIndexOfI[i] = lis[left - 1])
					lis[left] = i
				}
			}
		}
		// 对lis进行纠错
		let i = lis.length,
			last = lis[i - 1];
		while (i-- > 0) { // 我们通过recordIndexOfI做了每一次值的记录，这里通过记录对lis进行容错
			lis[i] = last
			last = recordIndexOfI[last]
		}
		return lis
	}
}
	// 下标是新元素的相对下标，value是旧元素的下标加一
/* 	4.3 遍历新节点数组：获取节点的最长递增子序列，这些节点不动，剩下节点移动或者新增
*/




