"use strict";

const screenshots = {
  shortcuts: { src: "assets/screenshots/shortcuts.png", title: "快捷键配置", alt: "KeyCaps 真实主界面：左侧为触发模式，右侧为演示快捷键配置", caption: "常用操作，一目了然。你的快捷键，由你定义。", tab: "tab-shortcuts" },
  input: { src: "assets/screenshots/caps-input.png", title: "Caps 输入", alt: "KeyCaps 的 Caps 输入模式，包含输入浮窗位置、配色、声音和指令序列配置", caption: "按一下 Caps，输入熟悉的指令序列。", tab: "tab-input" },
  editor: { src: "assets/screenshots/action-editor.png?v=2", title: "动作编辑器", alt: "KeyCaps 可视化动作编辑器，演示将 S 绑定为 Ctrl + S", caption: "从按键到动作，在一个可视化面板里配好。", tab: "tab-editor" },
  routing: { src: "assets/screenshots/app-routing.png?v=2", title: "应用分流", alt: "KeyCaps 应用分流界面，演示为代码编辑器指定另存为动作", caption: "同一组按键，在不同应用里执行不同动作。", tab: "tab-routing" }
};
const tabs = Array.from(document.querySelectorAll("[data-shot]"));
const mainScreenshot = document.getElementById("main-screenshot");
function selectScreenshot(name, focus = false) {
  const shot = screenshots[name];
  if (!shot) return;
  for (const tab of tabs) {
    const selected = tab.dataset.shot === name;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
    if (selected && focus) tab.focus();
  }
  mainScreenshot.src = shot.src;
  mainScreenshot.alt = shot.alt;
  mainScreenshot.closest("button").setAttribute("aria-label", `放大查看${shot.title}截图`);
  document.getElementById("screenshot-caption").textContent = shot.caption;
  document.getElementById("screenshot-panel").setAttribute("aria-labelledby", shot.tab);
}
for (const tab of tabs) {
  tab.addEventListener("click", () => selectScreenshot(tab.dataset.shot));
  tab.addEventListener("keydown", event => {
    const index = tabs.indexOf(tab);
    let next;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = tabs.length - 1;
    if (next !== undefined) { event.preventDefault(); selectScreenshot(tabs[next].dataset.shot, true); }
  });
}
for (const link of document.querySelectorAll("[data-select-shot]")) {
  link.addEventListener("click", () => selectScreenshot(link.dataset.selectShot));
}

const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightbox-image");
for (const button of document.querySelectorAll("[data-lightbox]")) {
  button.addEventListener("click", () => {
    const image = button.querySelector("img");
    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt;
    document.getElementById("lightbox-title").textContent = button.getAttribute("aria-label").replace("放大查看", "");
    lightbox.showModal();
    document.body.classList.add("has-lightbox");
  });
}
document.getElementById("lightbox-close").addEventListener("click", () => lightbox.close());
lightbox.addEventListener("click", event => {
  const rect = lightbox.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) lightbox.close();
});
lightbox.addEventListener("close", () => document.body.classList.remove("has-lightbox"));

const capsButton = document.getElementById("demo-caps");
const demoKeys = Array.from(document.querySelectorAll("[data-demo]"));
const contexts = Array.from(document.querySelectorAll("[data-context]"));
let selectedKey = "S";
let selectedContext = "daily";
let capsEnabled = true;
const demos = {
  S: { title: "保存当前文件", description: "把 Ctrl + S 放在更顺手的位置。", output: "发送 Ctrl + S", icon: "i-check" },
  B: { title: "回到你的浏览器", description: "已经打开就激活，还没打开就启动。", output: "激活 / 启动浏览器", icon: "i-browser" },
  H: { title: "窗口，向左靠齐", description: "让当前窗口贴靠屏幕左半侧。", output: "窗口操作 · 贴靠左侧", icon: "i-window" }
};
function renderDemo(animate = true) {
  let demo = demos[selectedKey];
  if (selectedKey === "S" && selectedContext === "code") demo = { title: "代码文件，另存一份", description: "应用分流：在 Code 中，切换为另存为。", output: "发送 Ctrl + Shift + S", icon: "i-route" };
  if (!capsEnabled) demo = { title: "先唤醒你的 Caps", description: "点击左侧 Caps，再试试高亮的按键。", output: "等待 Caps 组合键", icon: "i-keyboard" };
  capsButton.setAttribute("aria-pressed", String(capsEnabled));
  demoKeys.forEach(key => { const selected = key.dataset.demo === selectedKey; key.classList.toggle("is-active", selected); key.setAttribute("aria-pressed", String(selected)); });
  contexts.forEach(button => { const selected = button.dataset.context === selectedContext; button.classList.toggle("is-active", selected); button.setAttribute("aria-pressed", String(selected)); });
  document.getElementById("result-shortcut").textContent = capsEnabled ? `Caps + ${selectedKey}` : "CAPS 未启用";
  document.getElementById("result-title").textContent = demo.title;
  document.getElementById("result-description").textContent = demo.description;
  document.querySelector("#result-svg use").setAttribute("href", `#${demo.icon}`);
  const output = document.getElementById("result-output");
  output.firstChild.textContent = demo.output + " ";
  if (animate) {
    const result = document.querySelector(".demo-result");
    result.classList.remove("flash");
    void result.offsetWidth;
    result.classList.add("flash");
  }
}
capsButton.addEventListener("click", () => { capsEnabled = !capsEnabled; renderDemo(); });
demoKeys.forEach(key => key.addEventListener("click", () => { selectedKey = key.dataset.demo; renderDemo(); }));
contexts.forEach(button => button.addEventListener("click", () => { selectedContext = button.dataset.context; renderDemo(); }));
document.getElementById("playground").addEventListener("keydown", event => {
  if (event.ctrlKey || event.altKey || event.metaKey || event.repeat) return;
  const key = event.key.toUpperCase();
  if (Object.hasOwn(demos, key)) { event.preventDefault(); selectedKey = key; renderDemo(); }
});
