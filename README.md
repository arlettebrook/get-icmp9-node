# ICMP9 订阅生成器
`get-icmp9-node`是一个基于 Cloudflare Workers 构建的轻量级ICMP9订阅生成服务，支持 V2Ray / Clash / sing-box / Nekobox 等主流客户端，提供一条链接，多端自适应的订阅体验。

💥目的：获取ICMP9提供的全球落地节点，搭配前置代理或反向代理（可套Cloudflare tunnel + 优选IP提速），实现全球落地。

**🌴效果**：![IMG_20251230_164516_402.jpg](https://twilight.vvvv.ee/file/1767084365963_IMG_20251230_164516_402.jpg)

> 🔔前置代理测试客户端：NekoBox

## 🧩 部署方式

使用 GitHub 仓库导入部署（推荐）

1. Fork 本仓库


2. 前往 Cloudflare Dashboard → Workers & Pages


3. 点击「创建应用 → 创建 Worker」


4. 选择「从 GitHub 仓库导入」


5. 选择你 Fork 的仓库
项目名填写为：`get-icmp9-node`


6. 其他设置保持默认，点击 **部署**
7. 部署完成之后，访问你的部署地址（可自定域）参考 `✈️使用方法` ，即可使用。


---

## ✈️使用方法

方法一：链式代理（推荐）
  - 只需要填入ICMP9的🔑 API Key（其他默认），获取链接，导入到代理软件中，配置前置代理即可。
  - 前置代理要求：需要在ICMP9的控制面板放行前置代理节点的服务器IP（包括IPV6）。
  - **提示**：可以用ICMP9提供的免费VPS搭建前置代理节点。



方法二：反向代理

Nginx反代实例：
`/etc/nginx/conf.d/icmp9.conf`
```conf
server {
    listen 8080;
    listen [::]:8080;
    server_name www.example.com;#换成反代tunnel.icmp9.com的域名

    resolver 8.8.8.8 1.1.1.1 valid=300s;
    client_max_body_size 1G;
    proxy_request_buffering off;
    proxy_buffering off;

    location / {
        proxy_pass https://tunnel.icmp9.com;
        proxy_ssl_server_name on;

        proxy_set_header Host tunnel.icmp9.com;

        proxy_set_header X-Real-IP "";
        proxy_set_header X-Forwarded-For "";
        proxy_set_header X-Forwarded-Proto "";
        proxy_set_header Forwarded "";
        proxy_set_header Via "";

        # 防止 Nginx 自动加
        proxy_hide_header X-Powered-By;


        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_connect_timeout 5s;
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
    }
}
```
反代部署成功之后（别忘了放行IP），访问 ICMP9订阅生成器：
  - 将`Server`和`Server Name`替换成反代好的域名。如：`www.example.com`
  - `Port`改成Nginx监听的端口，如：`8080`（如果有端口转发请保持默认`443`）
  - 最后生成订阅链接，导入代理软件，即可使用


方法三：反向代理 ➕ Cloudflare tunnel ➕ 优选IP（推荐）

Nginx反代实例：
```conf
server {
    listen 8080;
    listen [::]:8080;
    server_name localhost;

    resolver 8.8.8.8 1.1.1.1 valid=300s;
    client_max_body_size 1G;
    proxy_request_buffering off;
    proxy_buffering off;

    location / {
        proxy_pass https://tunnel.icmp9.com;
        proxy_ssl_server_name on;

        proxy_set_header Host tunnel.icmp9.com;

        proxy_set_header X-Real-IP "";
        proxy_set_header X-Forwarded-For "";
        proxy_set_header X-Forwarded-Proto "";
        proxy_set_header Forwarded "";
        proxy_set_header Via "";

        # 防止 Nginx 自动加
        proxy_hide_header X-Powered-By;


        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_connect_timeout 5s;
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
    }
}
```
VPS安装了最新版Nginx之后，只需要将上面内容保存到`/etc/nginx/conf.d/icmp9.conf`，重启Nginx即可。

Cloudflare tunnel手动创建即可，不会网上找教程（很简单）。
- 注意URL为localhost + Nginx监听的端口，如上面的就是`localhost:8080`



反代和隧道都搭建好之后（别忘了放行IP），访问ICMP9订阅生成器：
- 将`Server`替换成优选IP或优选域名
- `port`保持默认`443`
- 将`Server Name`替换成Cloudflare tunnel绑定的域名。如：`www.example.com`
- 最后生成订阅链接，导入代理软件，即可使用。（速度不理想，可以更换优选IP或优选域名）


> ⚠️注意：
> - 在小鸡上运行nginx和cloudflared都需要有一定的限制和守护，不会问AI。
> - 这种搭建方法已经有 **一键脚本** （参考其他方法）。
> - 推荐手动搭建，锻炼自己的动手能力。

 
其他方法
  - 参考：https://www.nodeloc.com/t/topic/72682 （本项目出处）
  - 不需要前置代理方法（**一键脚本**）「小白推荐」：https://github.com/nap0o/icmp9.com/tree/nginx

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
- 感谢其提供稳定的全球落地节点资源
- 感谢其提供可用的 [API](https://api.icmp9.com/online.php) 接口
- 感谢其为技术爱好者与开发者提供良好的实验环境

本项目仅作为 ICMP9 服务的第三方技术实践示例。如 ICMP9 官方认为本项目的任何内容可能涉及其权益，请与我联系，我将第一时间进行处理或删除相关内容。
