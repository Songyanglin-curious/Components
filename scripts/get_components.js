const fs = require('fs-extra');
const path = require('path');
const root = path.dirname(__dirname);

async function getSubDirectories(dir) {
    try {
        const files = await fs.readdir(dir);
        const subDirs = [];

        for (const file of files) {
            const filePath = path.join(dir, file);
            const stats = await fs.stat(filePath);

            // 检查是否为文件夹
            if (stats.isDirectory()) {
                subDirs.push(file);
            }
        }

        return subDirs;
    } catch (error) {
        console.error('读取目录失败:', error);
        return [];
    }
}

console.log('开始读取子文件夹...', root);
const componentsPath = path.join(root, 'components');
getSubDirectories(componentsPath).then(subDirs => {
    console.log('子文件夹:', subDirs);
    //将其拼接成js 导出对象
    const exportStr = `var components = ${JSON.stringify(subDirs)}`;
    console.log(exportStr);
    //写入到文件中
    fs.writeFile(path.join(root, 'components.js'), exportStr, err => {
        if (err) {
            console.error('写入文件失败:', err);
        } else {
            console.log('写入文件成功:', 'components.js');
        }
    });
});