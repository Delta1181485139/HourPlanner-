# HourPlanner
# 后端

后端用的云开发，云数据库。

# 前端
## 主要页面

    pages/record/record //首页
      pages/record/focusshow //那张日历，用来记录以往的专注时间
      pages/record/planshow //以往的已完成任务
      pages/record/help //使用帮助
      pages/record/setup //提示音设置
      
    pages/focus/focus  //专注的选择时间页面
      pages/focus/begin //点击开始之后的页面
      
    pages/plan/plan //指定计划和倒计时页面
      pages/plan/editor //编辑计划
      pages/plan/write //编辑倒计时
 
### .
    带app的文件为全局配置
    utils.js是一个工具包（弄来玩玩的，没啥用）
    project config.json是开发环境的一些配置
    sitemap.json文件用于配置小程序及其页面是否允许被微信索引，文件内容为一个 JSON 对象

## 一些想法
   由于第一次完成这种小项目，各种编码规范不是很好，导致代码阅读性可能欠佳，注释也特别少。此类小工具的顺利开发其实得益于微信提供的各种方便实用的API。
## 使用方法
预览要用到微信开发者工具：https://developers.weixin.qq.com/miniprogram/dev/devtools/stable.html
下载后直接安装，导入下载的这个包，AppID那里选择测试号就可以预览了。
用户指南在首页中的帮助中。
