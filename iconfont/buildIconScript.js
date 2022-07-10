/**
 * @fileoverview 三方 icon 库拉取构建脚本
 */

const request = require('request');
const fs = require('fs-extra');
const path = require('path');
const ejs = require('ejs');

const OUTPUT_DIRECTORY = path.join(process.cwd(), 'assets', 'icon');
const ICON_OPEN_API = 'https://www.iconfont.cn/open/collection/detail.json?id=';

const R_SVG_FILL = /fill="#(\w)+"/g;
const DISABLE_ICONS = ['logistic-logo', 'logistic-logo-fill', 'paylater', 'paylater-fill', 'RFQ-logo', 'gold-supplier', 'feed-logo', 'feed-logo-fill', 'trade-assurance', '快递物流'];

async function getFileContent(library, cid) {
  return new Promise((resolve, reject) => {
    request(ICON_OPEN_API + cid, function(err, res) {
      if (err) {
        console.error(err);
        return reject(err);
      }
      
      let data = JSON.parse(res.body);

      if (cid === 19238) {
        data.data.icons = data.data.icons.filter(x => !DISABLE_ICONS.includes(x.name));
      }

      let svgStr =
        data.data.icons.reduce((acc, item) => {
          const symbolStart = `<symbol id="${library}-${item.name.trim()}" viewBox="0 0 1024 1024">`;
  
          const pathIndex = item.show_svg.indexOf('<path');
          const path = item.show_svg.substring(pathIndex, item.show_svg.length - 6);
  
          const symbolEnd = `</symbol>`;
  
          acc += (symbolStart + path.replace(R_SVG_FILL, '') + symbolEnd);
          return acc;
        }, '<svg>');
      svgStr += '</svg>';

      resolve({
        content: svgStr,
        icons: JSON.stringify(data.data.icons.map(x => x.name.trim())),
      });
    });
  });
}

async function generateIconFile(library, cid) {
  const template = fs.readFileSync(path.join(__dirname, 'iconFileTemplate.ejs'), 'utf-8');
  const { content: svgContent, icons } = await getFileContent(library, cid);
  const fileContent = ejs.render(template, { svgContent });
  const outputFilePath = path.join(OUTPUT_DIRECTORY, `${library}.js`);
  fs.writeFile(outputFilePath, fileContent);
  const iconListFilePath = path.join(OUTPUT_DIRECTORY, `${library}.json`);
  fs.writeFile(iconListFilePath, icons);
}


// 注意!!!!
// 如果只更新其中一个图标库，请注释掉其它库
// Ant Design 官方图标库
generateIconFile('antd', 9402);
// 阿里云控制台官方图标库
generateIconFile('aliyun', 11607);
// 阿里巴巴国际站官方图标库
generateIconFile('aliintl', 19238);
// Rookie 3.0官方图标库
generateIconFile('rookie3', 7077);
// 阿里云IoT官方图标库
generateIconFile('aliiot', 12507);
// 飞猪官方icon
generateIconFile('fliggy', 599);
// 菜鸟官方图标库
generateIconFile('cainiao', 2706);
// 一淘无线图标库
generateIconFile('etao', 58);
// 供应链平台官方图标库
generateIconFile('1688', 16880);
// 阿里健康品牌图标库
generateIconFile('alihealth', 1312);
// B-Design 图标库
generateIconFile('bdesign', 29268);
