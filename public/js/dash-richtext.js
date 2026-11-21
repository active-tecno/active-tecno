// dash-richtext.js — lightweight rich-text editor (visual + HTML code view), zero dependencies.
// Usage: return { html: richEditorHTML('myId', initialHtml), after: () => richInit('myId') } from a view,
// then read the current value with richValue('myId').

const RT_STATE = {};

const RT_IC = {
  ul: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M9 6h12M9 12h12M9 18h12"/><circle cx="4.5" cy="6" r="1.3" fill="currentColor" stroke="none"/><circle cx="4.5" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="4.5" cy="18" r="1.3" fill="currentColor" stroke="none"/></svg>',
  ol: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M10 6h11M10 12h11M10 18h11M4 6h1v4M4 10h2M6 16H4c0-1 .5-2 2-2s2 .8 2 1.6c0 1.4-2 1.9-4 3.4h4"/></svg>',
  link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg>',
  image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.8"/><path d="M21 15l-5-5L5 20"/></svg>',
  eraser: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3l5 5L8 21H3v-5L16 3z"/><path d="M7 21h14"/></svg>',
  code: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6l-6 6 6 6M16 6l6 6-6 6"/></svg>',
};

function richEditorHTML(id, extraCls) {
  return `
  <div class="rt-wrap${extraCls ? ' ' + extraCls : ''}" id="rt-${id}">
    <div class="rt-bar" dir="ltr">
      <select class="rt-fmt" data-rt-fmt title="نمط الفقرة">
        <option value="p">Normal</option><option value="h1">Heading 1</option><option value="h2">Heading 2</option><option value="h3">Heading 3</option>
      </select>
      <span class="rt-sep"></span>
      <button type="button" class="rt-btn" data-cmd="bold" title="عريض"><b>B</b></button>
      <button type="button" class="rt-btn" data-cmd="italic" title="مائل"><i>I</i></button>
      <button type="button" class="rt-btn" data-cmd="underline" title="تسطير"><u>U</u></button>
      <button type="button" class="rt-btn" data-cmd="strikeThrough" title="يتوسطه خط"><s>S</s></button>
      <span class="rt-sep"></span>
      <button type="button" class="rt-btn" data-cmd="insertUnorderedList" title="قائمة نقطية">${RT_IC.ul}</button>
      <button type="button" class="rt-btn" data-cmd="insertOrderedList" title="قائمة مرقمة">${RT_IC.ol}</button>
      <span class="rt-sep"></span>
      <button type="button" class="rt-btn" data-cmd="createLink" title="رابط">${RT_IC.link}</button>
      <button type="button" class="rt-btn" data-cmd="insertImage" title="صورة">${RT_IC.image}</button>
      <input type="color" class="rt-color" title="لون النص" value="#1a2233">
      <button type="button" class="rt-btn" data-cmd="removeFormat" title="مسح التنسيق">${RT_IC.eraser}</button>
      <span class="rt-sep"></span>
      <button type="button" class="rt-btn rt-codebtn" title="عرض HTML">${RT_IC.code}</button>
    </div>
    <div class="rt-area" contenteditable="true" dir="rtl"></div>
    <textarea class="rt-code" dir="ltr" spellcheck="false" style="display:none"></textarea>
  </div>`;
}

function richInit(id, initialHtml) {
  const wrap = document.getElementById('rt-' + id);
  if (!wrap) return;
  const area = wrap.querySelector('.rt-area');
  const code = wrap.querySelector('.rt-code');
  RT_STATE[id] = { mode: 'visual' };
  area.innerHTML = initialHtml || '';
  code.value = initialHtml || '';

  wrap.querySelector('.rt-bar').addEventListener('mousedown', e => {
    // keep the selection in the editable area while using the toolbar
    if (e.target.closest('.rt-btn') || e.target.closest('.rt-fmt')) e.preventDefault();
  });
  wrap.querySelector('.rt-fmt').addEventListener('change', e => {
    if (RT_STATE[id].mode !== 'visual') return;
    area.focus();
    document.execCommand('formatBlock', false, e.target.value);
  });
  wrap.querySelector('.rt-color').addEventListener('input', e => {
    if (RT_STATE[id].mode !== 'visual') return;
    area.focus();
    document.execCommand('foreColor', false, e.target.value);
  });
  wrap.querySelectorAll('.rt-btn[data-cmd]').forEach(btn => btn.addEventListener('click', () => {
    if (RT_STATE[id].mode !== 'visual') return;
    const cmd = btn.dataset.cmd;
    area.focus();
    if (cmd === 'createLink') {
      const url = prompt('رابط URL:', 'https://');
      if (url) document.execCommand('createLink', false, url);
    } else if (cmd === 'insertImage') {
      const url = prompt('رابط الصورة:', 'https://');
      if (url) document.execCommand('insertImage', false, url);
    } else {
      document.execCommand(cmd, false, null);
    }
  }));
  wrap.querySelector('.rt-codebtn').addEventListener('click', () => rtToggleCode(id));
}

function rtToggleCode(id, forceMode) {
  const wrap = document.getElementById('rt-' + id);
  if (!wrap) return;
  const st = RT_STATE[id];
  const area = wrap.querySelector('.rt-area');
  const code = wrap.querySelector('.rt-code');
  const toCode = forceMode ? forceMode === 'code' : st.mode === 'visual';
  if (toCode) {
    code.value = area.innerHTML;
    area.style.display = 'none'; code.style.display = 'block';
    st.mode = 'code';
  } else {
    area.innerHTML = code.value;
    code.style.display = 'none'; area.style.display = 'block';
    st.mode = 'visual';
  }
  wrap.classList.toggle('rt-in-code', st.mode === 'code');
}

function richValue(id) {
  const wrap = document.getElementById('rt-' + id);
  if (!wrap) return '';
  const st = RT_STATE[id] || { mode: 'visual' };
  return st.mode === 'code' ? wrap.querySelector('.rt-code').value : wrap.querySelector('.rt-area').innerHTML;
}
