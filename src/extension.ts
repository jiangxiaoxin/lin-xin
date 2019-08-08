
import * as vscode from 'vscode';
import axios from 'axios';
import * as schedule from 'node-schedule';


let allJobs: schedule.Job[] = [];
let statusItem: vscode.StatusBarItem;
let isShowingFull = false;//简单现实还是完整显示
let currentMsg = '';
let defaultMsg = `Xin $(heart) Lin`;
let toggleCommandId = 'xin-lin.toggleMsg';

export function activate(context: vscode.ExtensionContext) {
  console.log('插件激活');

  statusItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusItem.command = toggleCommandId;
  statusItem.text = defaultMsg;
  statusItem.show();
  isShowingFull = false;
  context.subscriptions.push(statusItem);

  let job: schedule.Job;
  let cron: string;
  let now = new Date();
  let min = now.getMinutes();
  let sec = now.getSeconds();
  let hour = now.getHours();
  cron = `${sec} ${min}/30 * * * *`;//从启动开始每隔30分钟
  job = schedule.scheduleJob(cron, () => {
    vscode.window.showInformationMessage('起来走动下吧，顺道喝口水水~~');
  });
  allJobs.push(job);
  cron = `${sec} ${min} ${hour}/1 * * *`;//从启动开始每1个小时
  job = schedule.scheduleJob(cron, () => {
    showLoveMsg();
  });
  allJobs.push(job);

  context.subscriptions.push(vscode.commands.registerCommand(toggleCommandId, toggleStatusBar));

  showLoveMsg();
}

function toggleStatusBar(args: any[]) {
  console.log('toggle status bar', args);
  isShowingFull = !isShowingFull;
  if (isShowingFull) {
    statusItem.text = currentMsg ? `$(heart) ${currentMsg}` : defaultMsg;
  } else {
    statusItem.text = defaultMsg;
  }
}

// this method is called when your extension is deactivated
export function deactivate() {
  clearAllJobs();
}

function clearAllJobs() {
  allJobs.forEach(job => {
    if (job instanceof schedule.Job) {
      job.cancel();
    }
  });
  allJobs = [];
}

async function getLoveMsgFromInternet() {
  try {
    const res = await axios.get('https://api.lovelive.tools/api/SweetNothings/Serialization/Json');
    console.log('res:', res);
    const { data } = res;
    const msg = data.returnObj[0];
    console.log('msg:', msg);
    return msg;
  } catch (error) {
    console.log('err:', error);
    return '';
  }
}

function showLoveMsg() {
  getLoveMsgFromInternet()
    .then(msg => {
      currentMsg = msg;
      statusItem.text = `$(heart) ${msg}`;
      isShowingFull = true;
    })
    .catch(err => {
      console.log('err:', err.message);
    });
}

