# ICMP9 订阅生成器
`get-icmp9-node`是一个基于 Cloudflare Workers 构建的轻量级ICMP9订阅生成服务，支持 V2Ray / Clash / sing-box / Nekobox 等主流客户端，提供一条链接，多端自适应的订阅体验。

💥目的：获取ICMP9提供的全球落地节点，搭配前置代理，实现全球落地。

**🌴效果**：![IMG_20251230_164516_402.jpg](https://twilight.vvvv.ee/file/1767084365963_IMG_20251230_164516_402.jpg)

## 🧩 部署方式

使用 GitHub 仓库导入部署（推荐）

1. Fork 本仓库


2. 前往 Cloudflare Dashboard → Workers & Pages


3. 点击「创建应用 → 创建 Worker」


4. 选择「从 GitHub 仓库导入」


5. 选择你 Fork 的仓库
项目名填写为：`get-icmp9-node`


6. 其他设置保持默认，点击 部署


---

## ✈️使用方法
- 方法一（推荐）
  - 只需要填入ICMP9的🔑 API Key，获取链接，导入到代理软件中，配置前置代理即可。
  - 前置代理要求：需要在ICMP9的控制面板放行前置代理节点的服务器IP（包括IPV6）。
  - 提示：可以用ICMP9提供的免费VPS搭建前置代理节点。
- 其他方法
  - 参考：https://www.nodeloc.com/t/topic/72682 （本项目出处）
  - 不需要前置代理方法：https://github.com/nap0o/icmp9.com

---

## ⚠️ 免责声明（Disclaimer）
本项目`get-icmp9-node`仅作为技术研究与学习用途。
- 本项目 不提供任何代理节点、网络加速或翻墙服务
- 使用本项目所生成的订阅配置，需用户自行确保：
  - 符合所在地法律法规
  - 符合 ICMP9 官方服务条款与使用规范
 
> **请在合法、合规的前提下使用本项目。**


---

## 🙏 致谢（Acknowledgements）
特别感谢 [ICMP9](https://icmp9.com) 提供的全球落地网络服务与开放接口支持：
- 提供稳定的全球落地节点资源
- 提供可用的 API 接口
- 为技术爱好者与开发者提供良好的实验环境

本项目仅作为 ICMP9 服务的第三方技术实践示例。如果您认为该项目的内容可能涉嫌侵犯其权利，请与我联系，我会尽快删除文件。
