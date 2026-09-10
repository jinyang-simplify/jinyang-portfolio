# Cloudflare 公共留言墙配置

留言墙通过 `/api/messages` Pages Function 读写 Cloudflare D1。网页不再使用浏览器本地存储，因此所有访客读取的是同一批公开留言。

## 首次上线

1. 在 Cloudflare 控制台进入 `Storage & Databases` > `D1 SQL database`，创建数据库 `jinyang-portfolio-messages`。
2. 打开数据库控制台，执行 `migrations/0001_create_messages.sql` 中的 SQL。新数据库执行完成后留言表为空。
3. 进入作品集 Pages 项目 > `Settings` > `Bindings` > `Add` > `D1 database bindings`。
4. Variable name 填写 `MESSAGES_DB`，数据库选择 `jinyang-portfolio-messages`。
5. Production 和 Preview 环境都添加同名绑定，然后重新部署项目。

## 管理留言

留言默认公开。需要隐藏某条留言时，在 D1 控制台执行：

```sql
UPDATE messages SET is_visible = 0 WHERE id = '留言 ID';
```

重新公开：

```sql
UPDATE messages SET is_visible = 1 WHERE id = '留言 ID';
```

查看最近留言及 ID：

```sql
SELECT id, name, message, created_at, is_visible
FROM messages
ORDER BY created_at DESC;
```

API 每次公开显示最近 50 条，数据库会继续保留更早的留言。
