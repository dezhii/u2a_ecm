document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const idInput = document.getElementById('id-input');
    const calculateBtn = document.getElementById('calculate-btn');
    const resultContainer = document.getElementById('result');

    // 为计算按钮添加点击事件
    calculateBtn.addEventListener('click', function() {
        calculateGroupInfo();
    });

    // 为输入框添加回车键事件
    idInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            calculateGroupInfo();
        }
    });

    /**
     * 解析输入的ID字符串
     * @param {string} input - 输入字符串
     * @returns {number[]} - 解析后的ID数组
     */
    function parseInput(input) {
        // 移除所有空格，并按逗号分割
        return input.replace(/\s+/g, ',')  // 将空格替换为逗号
                   .split(',')             // 按逗号分割
                   .filter(id => id.trim() !== '')  // 移除空项
                   .map(id => parseInt(id.trim()))  // 转换为数字
                   .filter(id => !isNaN(id));      // 移除无效数字
    }

    /**
     * 验证ID是否在有效范围内
     * @param {number} id - 要验证的ID
     * @returns {boolean} - 是否有效
     */
    function isValidId(id) {
        return id >= 0 && id < 300;
    }

    /**
     * 将ID按组分类
     * @param {number[]} ids - ID数组
     * @returns {Object} - 按组分类的ID对象
     */
    function groupIds(ids) {
        const groups = {};
        ids.forEach(id => {
            const groupName = Math.floor(id / 32);
            if (!groups[groupName]) {
                groups[groupName] = [];
            }
            groups[groupName].push(id);
        });
        return groups;
    }

    /**
     * 创建32位显示HTML
     * @param {number[]} groupIds - 同一组内的ID数组
     * @param {number} groupName - 组名
     * @returns {string} - HTML字符串
     */
    function create32BitsDisplay(groupIds, groupName) {
        // 创建32位的二进制表示
        const bits = Array(32).fill(0);
        
        // 计算每个ID的组内编号并标记对应位置
        const indexesInGroup = groupIds.map(id => id % 32);
        indexesInGroup.forEach(index => {
            bits[31 - index] = 1;  // 从bit0开始计算，所以是31-index
        });

        // 创建位显示HTML
        const upperBits = bits.slice(0, 16).map((bit, index) => `
            <div class="bit ${bit === 1 ? 'active' : ''}">
                <div class="bit-index">${31-index}</div>
                <div class="bit-value">${bit}</div>
            </div>
        `).join('');

        const lowerBits = bits.slice(16).map((bit, index) => `
            <div class="bit ${bit === 1 ? 'active' : ''}">
                <div class="bit-index">${15-index}</div>
                <div class="bit-value">${bit}</div>
            </div>
        `).join('');

        // 创建组内编号显示文本
        const indexesText = indexesInGroup
            .sort((a, b) => a - b)  // 按编号排序
            .map(index => `${index}`)
            .join(', ');

        return `
            <div class="bits-visualization">
                <div class="bits-header">
                    <span>组 ${groupName} - 组内编号: ${indexesText}</span>
                </div>
                <div class="bits-row upper-bits" title="高16位 (31-16)">
                    ${upperBits}
                </div>
                <div class="bits-row lower-bits" title="低16位 (15-0)">
                    ${lowerBits}
                </div>
            </div>
        `;
    }

    /**
     * 计算ID的组信息
     */
    function calculateGroupInfo() {
        // 获取并解析输入
        const ids = parseInput(idInput.value);
        
        // 验证是否有输入
        if (ids.length === 0) {
            alert('请输入有效的ID');
            return;
        }

        // 验证所有ID是否在有效范围内
        const invalidIds = ids.filter(id => !isValidId(id));
        if (invalidIds.length > 0) {
            alert(`以下ID超出范围(0-299)：${invalidIds.join(', ')}`);
            return;
        }

        // 按组分类ID
        const groupedIds = groupIds(ids);

        // 清空结果容器
        resultContainer.innerHTML = '';

        // 创建ID列表显示
        const idListHtml = `
            <div class="id-list">
                <div class="label">输入的ID:</div>
                <div class="value">${ids.sort((a, b) => a - b).join(', ')}</div>
            </div>
        `;
        resultContainer.insertAdjacentHTML('beforeend', idListHtml);

        // 为每个组创建显示
        Object.entries(groupedIds)
            .sort(([groupA], [groupB]) => parseInt(groupA) - parseInt(groupB))  // 按组名排序
            .forEach(([groupName, groupIds]) => {
                const groupHtml = create32BitsDisplay(groupIds, groupName);
                resultContainer.insertAdjacentHTML('beforeend', groupHtml);
            });
        
        // 显示结果容器
        resultContainer.style.display = 'block';
    }
});