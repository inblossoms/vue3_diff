/**
 * author:
 * params: 
 * 	arr(发生变动的数据组成的新集和)
 * desc: 实现 [最长递增子序列(longest increasing subsequence)] 来做动态规划
*/
// sequence 处理新旧VNode中的差异节点部分
export function getSequence(arr) {
	const lis = [0] // 返回的是 lis 的下标组成的数组
	let recordIndexOfI = arr.slice(); // 记录每一 i 次的变化时，i 的真实位置

	const len = arr.length;
	for (let i = 0; i < len; i++) {
		const curEle = arr[i],
			last = lis[lis.length - 1]; // 最后一个元素

		// 如果元素为0 证明当前位置上没有新元素，不需要算到lis里，直接跳过即可
		if (curEle !== 0) {
			if (arr[last] < curEle) {
				lis.push(i) // 当目标值大于last时，可以直接放入集合
				recordIndexOfI[i] = last; // 记录每一次排列目标的索引
				continue
			}

			// 当目标值小于last时，我们应该保证最长子序列来做动态规划
			// 否则把 curEle , 因为lis是有序的，所以可以通过二分插入
			let left = 0,
				right = lis.length - 1;
			while (left < right) {
				const mid = (left + right) >> 1
				curEle < arr[lis[mid]] ? right = mid - 1 : left = mid + 1
			}

			// 从LIS中找到所以比目标值大的中的最小值 进行替换
			if (curEle < arr[lis[left]]) {
				// 记录第i 次替换前的位置
				left > 0 && (recordIndexOfI[i] = lis[left - 1])
				lis[left].push(i)
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