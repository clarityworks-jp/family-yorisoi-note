"use strict";

const form = document.querySelector("#note-form");
const screens = [...document.querySelectorAll("[data-screen]")];
const menuButton = document.querySelector(".menu-button");
const siteNav = document.querySelector("#site-nav");
const toast = document.querySelector("#toast");
const printModal = document.querySelector("#print-modal");
const printButton = document.querySelector("#print-result");
const confirmPrintButton = document.querySelector("#confirm-print");
const cancelPrintButton = document.querySelector("#cancel-print");
let toastTimer;
let currentResultSections = [];
let currentTodayChoice = "";
let printModalReturnFocus = null;
let formValidationStarted = false;
const requiredGroups = ["person", "distance", "tone"];

const topicData = {
  health: {
    label: "健康や通院のこと",
    questions: [
      "最近、体のことで少し気になっていることはある？",
      "いつも頼りにしている病院や先生はいる？",
      "お薬手帳や診察券は、必要なときに見つけやすい場所にある？"
    ],
    observations: [
      "薬のことを、本人が無理なく扱えていそうか",
      "通院や移動で、少し手伝えそうな場面がないか",
      "以前より疲れやすそうな日があれば、そっと気にかける"
    ],
    next: ["いつも頼りにしている病院名だけ聞いてみる", "お薬手帳の置き場所を、話せそうなら聞いてみる"]
  },
  food: {
    label: "食事や買い物のこと",
    questions: [
      "買い物や食事の準備で、負担に感じることはある？",
      "重いものを買うとき、手伝えることはある？",
      "最近、食べたいものや、食べるとほっとするものはある？"
    ],
    observations: [
      "食事の準備が、以前より大変そうな日がないか",
      "買い物で重いものを持つ場面が負担になっていないか",
      "無理なく食事を楽しめていそうか"
    ],
    next: ["次に会うとき、好きな食べ物を一緒に用意する", "買い物で手伝えそうなことをひとつ聞いてみる"]
  },
  home: {
    label: "家の中の安全のこと",
    questions: [
      "家の中で、歩くときに少し気をつかう場所はある？",
      "夜に動くとき、明かりがあったら楽になりそうな場所はある？",
      "最近、片付けを手伝えたらうれしい場所はある？"
    ],
    observations: [
      "玄関や廊下を、本人が歩きやすく過ごせていそうか",
      "家電やガス機器を、無理なく使えていそうか",
      "掃除や片付けで、少し手伝えそうなところがないか"
    ],
    next: ["よく通る場所を、本人と一緒に少しだけ見てみる", "気になる場所があれば、ひとつだけ一緒に整える"]
  },
  contact: {
    label: "連絡先や緊急時のこと",
    questions: [
      "何かあったとき、最初に誰へ連絡してほしい？",
      "近くに、声をかけやすい人はいる？",
      "病院や薬局の連絡先を、家族も知っておいたら少し心強いかな？"
    ],
    observations: [
      "よく使う連絡先が、見つけやすい場所にありそうか",
      "電話や充電器を、無理なく使えていそうか",
      "困ったときに声をかけたい相手がいそうか"
    ],
    next: ["もしよければ、連絡してほしい相手をひとり聞いてみる", "よく使う連絡先を、本人が見やすい形で一緒に置いてみる"]
  },
  documents: {
    label: "書類や大事なものの置き場所",
    questions: [
      "保険証や診察券は、必要なときにすぐ出せる場所にある？",
      "大切な書類は、いつか一緒にゆっくり見られたら心強いね。",
      "すぐに必要になりそうなものだけ、置き場所を聞いておいてもいい？"
    ],
    observations: [
      "郵便物や書類が、本人にとって扱いやすい量か",
      "よく使う書類を、本人が見つけやすそうか",
      "書類まわりで、少し手伝えそうなところがないか"
    ],
    next: ["よく使う書類の置き場所を、話せそうなら聞いてみる", "本人と相談して、書類をひとつだけ一緒に置き直す"]
  },
  future: {
    label: "これからの暮らしの希望",
    questions: [
      "これからも大事にしたい暮らし方はある？",
      "今の暮らしで、これからも続けていきたいことはある？",
      "困ったときは、どんなふうに手伝われるとほっとする？"
    ],
    observations: [
      "今の暮らしで大切にしている習慣は何か",
      "本人が続けたいことや楽しみにしていることは何か",
      "手伝ってほしいことと、本人が自分で続けたいことは何か"
    ],
    next: ["大切にしたい暮らし方をひとつ聞いてみる", "次に会うとき、楽しみにしていることを話す"]
  },
  gentle: {
    label: "少しずつ話しておきたいこと",
    questions: [
      "最近、楽しかったことはあった？",
      "今の暮らしで、これからも続けていきたいことはある？",
      "何か手伝ってほしいときは、いつでも言ってね。少しでも力になれたらうれしい。"
    ],
    observations: [
      "いつもの暮らしを心地よく続けられているか",
      "会話の中で、少し気にかけられそうなことがないか",
      "最近楽しんでいることや大切にしていることは何か"
    ],
    next: ["次に話す日をゆるく決める", "最近楽しかったことをひとつ聞く"]
  }
};

const relatedCardCatalog = [
  {
    id: "meal",
    category: "meal-delivery",
    title: "食事を支えるサービス",
    text: "食事や買い物に少し手を借りたいと感じたときは、宅配食や配食サービスも選択肢のひとつです。本人の好きな味や暮らし方を大切にしながら、合いそうな形をゆっくり眺めてみてください。",
    linkText: "食事を支える選択肢を眺める",
    url: ""
  },
  {
    id: "connection",
    category: "connection-service",
    title: "離れていてもつながれるサービス",
    text: "離れて暮らしているときは、負担の少ない連絡サービスも選択肢のひとつです。本人の気持ちを大切にしながら、心地よい距離感で使えそうなものをゆっくり眺めてみてください。",
    linkText: "つながりを支える選択肢を眺める",
    url: ""
  },
  {
    id: "safety",
    category: "home-safety",
    title: "家の中を心地よく整える用品",
    text: "家の中をもう少し歩きやすくしたいと感じたときは、暮らしを支える小さな用品も選択肢のひとつです。無理に急がず、本人と一緒に今の暮らしになじみそうなものを眺めてみてください。",
    linkText: "暮らしに寄り添う用品を眺める",
    url: ""
  },
  {
    id: "notebook",
    category: "family-notebook",
    title: "家族で使える共有ノート",
    text: "大切にしたいことや希望を、少しずつ書けるノートもあります。家族で話せそうなときに、本人が書きたくなったところから始められるものを眺めてみてください。",
    linkText: "家族共有ノートを眺める",
    url: ""
  },
  {
    id: "books",
    category: "family-books",
    title: "家族の会話に寄り添う本やノート",
    text: "会話のきっかけがほしいときは、家族で読める本や一緒に書けるノートも選択肢のひとつです。興味のあるものだけ、ゆっくり眺めてみてください。",
    linkText: "本やノートを眺める",
    url: ""
  }
];

const thingsNotToForce = [
  "今すぐ答えを出さなくてよいこと",
  "本人が話したくなさそうなこと",
  "お金や書類の細かい話を、急に全部聞くこと",
  "不安な言葉で急かすこと",
  "家族側だけで決めてしまうこと"
];

const gentleRephrases = [
  {
    before: "心配だから聞きたい",
    after: "大切に思っているから、少し知っておきたい"
  },
  {
    before: "危ないから片付けよう",
    after: "もっと歩きやすくなるように、一緒に整えてみる？"
  },
  {
    before: "ちゃんと薬を飲んでる？",
    after: "薬のことで困っていることはない？"
  },
  {
    before: "何かあったら困るから",
    after: "何かあったときに慌てないように、少しだけ共有できたら安心だね"
  },
  {
    before: "早く決めておこう",
    after: "今すぐ決めなくて大丈夫だけど、少しずつ話せたらうれしい"
  }
];

function showScreen(name, updateHash = true) {
  const target = screens.find((screen) => screen.dataset.screen === name) || screens[0];
  screens.forEach((screen) => {
    const active = screen === target;
    screen.hidden = !active;
    screen.classList.toggle("is-active", active);
  });
  if (updateHash) history.replaceState(null, "", `#${name}`);
  siteNav.classList.remove("is-open");
  menuButton.setAttribute("aria-expanded", "false");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function getSelectedValues() {
  const data = new FormData(form);
  return {
    person: data.get("person"),
    distance: data.get("distance"),
    concerns: data.getAll("concerns"),
    tone: data.get("tone"),
    purposes: data.getAll("purposes")
  };
}

function getMissingRequiredGroups(values) {
  return requiredGroups.filter((name) => !values[name]);
}

function updateRequiredErrors(missingGroups) {
  const missing = new Set(missingGroups);
  document.querySelectorAll("[data-required-group]").forEach((fieldset) => {
    const groupName = fieldset.dataset.requiredGroup;
    const hasError = missing.has(groupName);
    const error = fieldset.querySelector(".field-error");
    fieldset.classList.toggle("has-error", hasError);
    if (hasError) {
      fieldset.setAttribute("aria-invalid", "true");
    } else {
      fieldset.removeAttribute("aria-invalid");
    }
    if (error) error.hidden = !hasError;
    fieldset.querySelectorAll(`input[name="${groupName}"]`).forEach((input) => {
      if (hasError) {
        input.setAttribute("aria-invalid", "true");
        if (error) input.setAttribute("aria-describedby", error.id);
      } else {
        input.removeAttribute("aria-invalid");
        input.removeAttribute("aria-describedby");
      }
    });
  });
  document.querySelector("#form-error").hidden = missingGroups.length === 0;
}

function focusRequiredGroup(groupName) {
  const fieldset = document.querySelector(`[data-required-group="${groupName}"]`);
  if (!fieldset) return;
  const header = document.querySelector(".site-header");
  const headerHeight = header ? header.getBoundingClientRect().height : 0;
  const extraMargin = 32;
  const targetTop = fieldset.getBoundingClientRect().top + window.scrollY - headerHeight - extraMargin;
  window.scrollTo({
    top: Math.max(targetTop, 0),
    behavior: "smooth"
  });
  window.setTimeout(() => fieldset.focus({ preventScroll: true }), 320);
}

function unique(items) {
  return [...new Set(items)];
}

function generatePersonalMessage(values) {
  const people = {
    "親": "親御さん",
    "祖父母": "祖父母の方",
    "義父母": "義父母の方",
    "配偶者の家族": "配偶者のご家族",
    "その他の家族": "大切なご家族"
  };
  const distances = {
    "一緒に暮らしている": "日々をともに過ごす中で",
    "近くに住んでいる": "近くで暮らしを想いながら",
    "離れて暮らしている": "離れていても心を寄せながら",
    "帰省や用事のときに会う": "次に会える時間を思い浮かべながら",
    "電話やLINEで話すことが多い": "いつもの電話やメッセージの中で"
  };
  const tones = {
    soft: "とてもやわらかく",
    natural: "いつもの会話の流れで",
    family: "ご家族とも分かち合いやすい形で",
    one: "まずはひとつだけ"
  };

  return `${distances[values.distance]}、${people[values.person]}と${tones[values.tone]}話したい気持ちに寄り添って、しおりをまとめました。`;
}

function generateConversationStarters(values) {
  const toneOpeners = {
    soft: "無理に今全部話さなくて大丈夫だけど、",
    natural: "そういえば、",
    family: "みんなで少しずつ知っておけたらと思って、",
    one: "今日はひとつだけ、"
  };
  const starters = [
    "最近どう？体調や暮らしのことで、気になっていることはない？",
    "困っていることがあったら、話せそうなときに少しだけ教えてくれたらうれしいな。",
    `${toneOpeners[values.tone]}今の暮らしで大切にしていることを聞いてもいい？`,
    "こちらで手伝えることがあったら、無理のない範囲で一緒に考えたいな。"
  ];
  if (values.concerns.includes("contact")) {
    starters.push("何かあったときに慌てないように、連絡したい相手だけ一緒に話しておけたらうれしいな。");
  }
  if (values.concerns.includes("gentle")) {
    starters.push("今すぐ決めることはないけれど、これからも心地よく過ごせるように、少しずつ話せたらうれしいな。");
  }
  return unique(starters).slice(0, 5);
}

function generateQuestions(values) {
  const selected = values.concerns.length ? values.concerns : ["gentle"];
  return unique(selected.flatMap((key) => topicData[key].questions)).slice(0, 12);
}

function generateObservationPoints(values) {
  const selected = values.concerns.length ? values.concerns : ["gentle"];
  return unique(selected.flatMap((key) => topicData[key].observations)).slice(0, 10);
}

function generateTopicGroups(values, field, limit) {
  const selected = values.concerns.length ? values.concerns : ["gentle"];
  let remaining = limit;

  return selected.reduce((groups, key) => {
    if (!remaining) return groups;
    const items = topicData[key][field].slice(0, remaining);
    if (items.length) {
      groups.push({
        title: topicData[key].label,
        items
      });
      remaining -= items.length;
    }
    return groups;
  }, []);
}

function generateFamilyShareTemplate() {
  return {
    template: `今回話せたこと、そっと気づいたことを簡単にメモします。

・体調：
・通院・薬：
・食事・買い物：
・家の中で少し気にかけたいこと：
・本人が大切にしたいこと：
・次回までにできそうなこと：`,
    message: "急ぎではないけれど、これからも本人らしく過ごせるように、少しずつ話せたらと思います。本人の気持ちを大切にしながら、できそうなことから一緒に考えていきましょう。"
  };
}

function generateNextSteps(values) {
  const selected = values.concerns.length ? values.concerns : ["gentle"];
  const steps = selected.flatMap((key) => topicData[key].next);
  if (values.purposes.includes("share")) steps.push("家族に「少し話せたこと」をやわらかく伝える");
  if (values.distance === "離れて暮らしている") steps.push("次に電話やメッセージをする日をゆるく決める");
  steps.push("次に会うとき、もうひとつだけ話してみる");
  return unique(steps).slice(0, 8);
}

function generateRelatedCards(values) {
  const ids = [];
  if (values.concerns.includes("food")) ids.push("meal");
  if (values.distance === "離れて暮らしている") ids.push("connection");
  if (values.concerns.includes("home")) ids.push("safety");
  if (values.concerns.includes("documents")) ids.push("notebook");
  if (!ids.length) ids.push("books");
  return unique(ids).map((id) => relatedCardCatalog.find((card) => card.id === id));
}

function listMarkup(items) {
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function selectableListMarkup(items) {
  return `<ul class="selectable-list">${items.map((item) => `
    <li>
      <span>${escapeHtml(item)}</span>
      <button class="choose-today no-print" type="button" data-today-choice="${encodeURIComponent(item)}">今日使う言葉に選ぶ</button>
    </li>
  `).join("")}</ul>`;
}

function groupedListMarkup(groups) {
  return groups.map((group) => `
    <section class="topic-group">
      <h4>${escapeHtml(group.title)}</h4>
      ${listMarkup(group.items)}
    </section>
  `).join("");
}

function rephraseMarkup(items) {
  return `<div class="rephrase-list">${items.map((item) => `
    <div class="rephrase-item">
      <p><span>言い換え前</span>${escapeHtml(item.before)}</p>
      <p><span>言い換え後</span>${escapeHtml(item.after)}</p>
    </div>
  `).join("")}</div>`;
}

function escapeHtml(text) {
  const node = document.createElement("div");
  node.textContent = text;
  return node.innerHTML;
}

function createResultCard(number, title, intro, contentMarkup, copyTextValue, expanded = false) {
  const bodyId = `result-card-body-${number}`;
  return `
    <article class="result-card" data-copy-text="${encodeURIComponent(copyTextValue)}">
      <button class="result-card-toggle" type="button" aria-expanded="${expanded}" aria-controls="${bodyId}">
        <span class="result-card-header">
          <span class="result-card-title" role="heading" aria-level="3">${number}. ${title}</span>
        </span>
        <span class="toggle-label">${expanded ? "閉じる" : "開く"}</span>
      </button>
      <div id="${bodyId}" class="result-card-body" ${expanded ? "" : "hidden"}>
        <div class="card-content">
          ${intro ? `<p>${escapeHtml(intro)}</p>` : ""}
          ${contentMarkup}
        </div>
        <button class="copy-section no-print" type="button">この部分をコピー</button>
      </div>
    </article>`;
}

function renderResult(values) {
  const starters = generateConversationStarters(values);
  const questions = generateQuestions(values);
  const questionGroups = generateTopicGroups(values, "questions", 12);
  const observations = generateObservationPoints(values);
  const observationGroups = generateTopicGroups(values, "observations", 10);
  const share = generateFamilyShareTemplate();
  const nextSteps = generateNextSteps(values);
  const observationIntro = "暮らしの中で少し手伝えそうなことがないか、本人のペースを大切にしながら、そっと気づくための目安です。";
  const nextIntro = "全部やろうとしなくて大丈夫です。ひとつ話せたら、それだけでも十分な一歩です。";
  const notToForceIntro = "話せなかったことがあっても大丈夫です。今日は一緒に過ごせたことだけでも、大切な時間です。";
  const rephraseIntro = "同じ想いでも、言い方を少しやわらかくすると、相手が受け取りやすくなることがあります。";
  currentTodayChoice = "";
  document.querySelector("#result-personal-message").textContent = generatePersonalMessage(values);
  document.querySelector("#today-choice-text").textContent = "下のカードから、話してみたい言葉や小さな一歩をひとつ選べます。今は選ばなくても大丈夫です。";
  document.querySelector("#copy-today-choice").hidden = true;
  document.querySelector("#today-choice").classList.remove("has-choice");

  currentResultSections = [
    { title: "やさしく話すきっかけ", intro: "", items: starters },
    { title: "聞いてみてもよさそうなこと", intro: "", groups: questionGroups, items: questions },
    { title: "そっと見ておくこと", intro: observationIntro, groups: observationGroups, items: observations },
    { title: "家族で共有しておきたいこと", intro: "", text: `${share.template}\n\n共有文例：\n「${share.message}」` },
    { title: "次にできる小さな一歩", intro: nextIntro, items: nextSteps },
    { title: "無理に聞かなくていいこと", intro: notToForceIntro, items: thingsNotToForce },
    { title: "相手の気持ちを大切にする言い方", intro: rephraseIntro, pairs: gentleRephrases }
  ];

  const cardMarkup = [
    createResultCard(1, currentResultSections[0].title, "", selectableListMarkup(starters), sectionToText(currentResultSections[0]), true),
    createResultCard(2, currentResultSections[1].title, "", groupedListMarkup(questionGroups), sectionToText(currentResultSections[1])),
    createResultCard(3, currentResultSections[2].title, observationIntro, groupedListMarkup(observationGroups), sectionToText(currentResultSections[2])),
    createResultCard(4, currentResultSections[3].title, "", `<div class="share-template">${escapeHtml(share.template)}</div><p><strong>共有文例</strong><br>「${escapeHtml(share.message)}」</p>`, sectionToText(currentResultSections[3])),
    createResultCard(5, currentResultSections[4].title, nextIntro, selectableListMarkup(nextSteps), sectionToText(currentResultSections[4])),
    createResultCard(6, currentResultSections[5].title, notToForceIntro, listMarkup(thingsNotToForce), sectionToText(currentResultSections[5])),
    createResultCard(7, currentResultSections[6].title, rephraseIntro, rephraseMarkup(gentleRephrases), sectionToText(currentResultSections[6]))
  ].join("");

  document.querySelector("#result-cards").innerHTML = cardMarkup;
  document.querySelector("#related-cards").innerHTML = generateRelatedCards(values).map((card) => `
    <article class="related-card">
      <span class="ad-label">関連情報・広告</span>
      <h3>${escapeHtml(card.title)}</h3>
      <p>${escapeHtml(card.text)}</p>
      ${
        card.url
          ? `<a href="${escapeHtml(card.url)}" data-category="${escapeHtml(card.category)}" target="_blank" rel="noopener noreferrer">${escapeHtml(card.linkText)} →</a>`
          : ""
      }
    </article>`).join("");
}

function sectionToText(section) {
  let body = "";
  if (section.text) {
    body = section.text;
  } else if (section.groups) {
    body = section.groups.map((group) => (
      `${group.title}\n${group.items.map((item) => `・${item}`).join("\n")}`
    )).join("\n\n");
  } else if (section.pairs) {
    body = section.pairs.map((item) => `・「${item.before}」→「${item.after}」`).join("\n");
  } else {
    body = section.items.map((item) => `・${item}`).join("\n");
  }
  return `${section.title}\n${section.intro ? `${section.intro}\n` : ""}${body}`;
}

function getAllResultText() {
  const todayText = currentTodayChoice ? `\n\n今日使うひとつ\n・${currentTodayChoice}` : "";
  const personalMessage = document.querySelector("#result-personal-message").textContent;
  return `家族を想う よりそいノート\n会話のしおり\n\n${personalMessage}\n\nすべてを話そうとしなくて大丈夫です。今回話せそうなことを、ひとつ心に留めるだけでも十分です。${todayText}\n\n${currentResultSections.map(sectionToText).join("\n\n")}`;
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.append(textArea);
    textArea.select();
    document.execCommand("copy");
    textArea.remove();
  }
  showToast("コピーしました。必要なところだけ、無理なく使ってください。");
}

function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 3200);
}

function resetForm() {
  form.reset();
  currentResultSections = [];
  currentTodayChoice = "";
  formValidationStarted = false;
  updateRequiredErrors([]);
  showScreen("form");
}

function setFontSize(size) {
  const large = size === "large";
  document.documentElement.classList.toggle("font-large", large);
  document.querySelectorAll(".font-size-button").forEach((button) => {
    const selected = button.dataset.fontSize === size;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  try {
    localStorage.setItem("yorisoi-font-size", size);
  } catch {
    // The selected size still applies for the current page.
  }
}

function openPrintModal() {
  printModalReturnFocus = document.activeElement;
  printModal.hidden = false;
  document.body.classList.add("modal-open");
  confirmPrintButton.focus();
}

function closePrintModal({ restoreFocus = true } = {}) {
  printModal.hidden = true;
  document.body.classList.remove("modal-open");
  if (restoreFocus && printModalReturnFocus instanceof HTMLElement) {
    printModalReturnFocus.focus();
  }
}

document.addEventListener("click", (event) => {
  const screenLink = event.target.closest("[data-screen-link], [data-screen-button]");
  if (screenLink) {
    event.preventDefault();
    showScreen(screenLink.dataset.screenLink || screenLink.dataset.screenButton);
    return;
  }

  const copyButton = event.target.closest(".copy-section");
  if (copyButton) {
    copyText(decodeURIComponent(copyButton.closest(".result-card").dataset.copyText));
    return;
  }

  const toggleButton = event.target.closest(".result-card-toggle");
  if (toggleButton) {
    const body = document.querySelector(`#${toggleButton.getAttribute("aria-controls")}`);
    const expanded = toggleButton.getAttribute("aria-expanded") === "true";
    toggleButton.setAttribute("aria-expanded", String(!expanded));
    toggleButton.querySelector(".toggle-label").textContent = expanded ? "開く" : "閉じる";
    body.hidden = expanded;
    return;
  }

  const todayButton = event.target.closest(".choose-today");
  if (todayButton) {
    currentTodayChoice = decodeURIComponent(todayButton.dataset.todayChoice);
    document.querySelector("#today-choice-text").textContent = currentTodayChoice;
    document.querySelector("#copy-today-choice").hidden = false;
    document.querySelector("#today-choice").classList.add("has-choice");
    document.querySelector("#today-choice").scrollIntoView({ behavior: "smooth", block: "center" });
    showToast("今日のひとつに選びました。これだけでも十分です。");
    return;
  }

  const fontButton = event.target.closest(".font-size-button");
  if (fontButton) {
    setFontSize(fontButton.dataset.fontSize);
    showToast(fontButton.dataset.fontSize === "large" ? "文字を大きめにしました。" : "文字を標準の大きさにしました。");
    return;
  }

});

printModal.addEventListener("click", (event) => {
  if (event.target.closest("[data-print-modal-close]")) {
    closePrintModal();
  }
});

printModal.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    event.preventDefault();
    closePrintModal();
    return;
  }

  if (event.key !== "Tab") return;
  const focusable = [...printModal.querySelectorAll("button:not([disabled])")];
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

menuButton.addEventListener("click", () => {
  const open = siteNav.classList.toggle("is-open");
  menuButton.setAttribute("aria-expanded", String(open));
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  formValidationStarted = true;
  const values = getSelectedValues();
  const missingRequiredGroups = getMissingRequiredGroups(values);
  updateRequiredErrors(missingRequiredGroups);
  if (missingRequiredGroups.length) {
    focusRequiredGroup(missingRequiredGroups[0]);
    return;
  }
  renderResult(values);
  showScreen("result");
});

form.addEventListener("change", () => {
  if (!formValidationStarted) return;
  updateRequiredErrors(getMissingRequiredGroups(getSelectedValues()));
});

document.querySelector("#copy-all").addEventListener("click", () => copyText(getAllResultText()));
document.querySelector("#copy-today-choice").addEventListener("click", () => copyText(`今日使うひとつ\n${currentTodayChoice}`));
printButton.addEventListener("click", openPrintModal);
cancelPrintButton.addEventListener("click", () => closePrintModal());
confirmPrintButton.addEventListener("click", () => {
  closePrintModal();
  window.print();
});
document.querySelector("#reset-form").addEventListener("click", resetForm);

const initialScreen = location.hash.replace("#", "");
const safeInitialScreen = initialScreen === "result" ? "top" : initialScreen;
showScreen(screens.some((screen) => screen.dataset.screen === safeInitialScreen) ? safeInitialScreen : "top", false);

try {
  setFontSize(localStorage.getItem("yorisoi-font-size") === "large" ? "large" : "standard");
} catch {
  setFontSize("standard");
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {
      // The app remains fully usable when service workers are unavailable.
    });
  });
}
