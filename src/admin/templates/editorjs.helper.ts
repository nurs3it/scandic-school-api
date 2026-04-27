// Reusable Editor.js field for admin SSR forms.
// Mirrors the news editor — same CDN tools, same JSON output, same renderer.

export const EDITORJS_STYLES = `
  .editor-section { margin-top: 8px; }
  .editor-section .editor-label {
    font-size: 12px; font-weight: 700; color: #374151;
    text-transform: uppercase; letter-spacing: 0.03em;
    margin-bottom: 8px; display: block;
  }
  .editor-hint { font-size: 11px; color: #94a3b8; margin-top: 8px; line-height: 1.5; }
  .editor-hint code { background: #f1f5f9; padding: 1px 5px; border-radius: 4px; font-size: 11px; }
  .editorjs-holder {
    border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 16px 20px;
    min-height: 320px; background: #fff;
  }
  .editorjs-holder .ce-block__content { max-width: 100%; }
  .editorjs-holder .ce-toolbar__content { max-width: 100%; }
  .editorjs-holder .codex-editor__redactor { padding-bottom: 100px !important; }
  .editorjs-holder .ce-header { font-weight: 700; }
  .editorjs-holder .ce-paragraph { line-height: 1.7; }
  .editorjs-holder .embed-tool { border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
  .editorjs-holder .image-tool__image { border-radius: 8px; }
  .editorjs-holder .image-tool__caption { font-size: 13px; color: #64748b; }
`;

const CDN_TAGS = `
<script src="https://cdn.jsdelivr.net/npm/@editorjs/editorjs@2/dist/editorjs.umd.min.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/@editorjs/header@2/dist/header.umd.min.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/@editorjs/nested-list@1/dist/nested-list.min.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/@editorjs/checklist@1/dist/bundle.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/@editorjs/quote@2/dist/bundle.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/@editorjs/warning@1/dist/bundle.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/@editorjs/code@2/dist/bundle.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/@editorjs/delimiter@1/dist/bundle.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/@editorjs/table@2/dist/table.min.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/@editorjs/image@2/dist/bundle.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/@editorjs/embed@2/dist/bundle.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/@editorjs/link@2/dist/bundle.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/@editorjs/attaches@1/dist/bundle.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/@editorjs/raw@2/dist/bundle.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/@editorjs/marker@1/dist/bundle.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/@editorjs/inline-code@1/dist/bundle.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/@editorjs/underline@1/dist/bundle.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/editorjs-paragraph-with-alignment@3/dist/bundle.js"><\/script>
`;

interface EditorjsFieldOpts {
  fieldName: string;
  holderId?: string;
  hiddenId?: string;
  label?: string;
  hint?: string;
}

export function editorjsFieldHtml(opts: EditorjsFieldOpts): string {
  const holderId = opts.holderId ?? 'editorjs-holder';
  const hiddenId = opts.hiddenId ?? 'editorjs-content';
  const label = opts.label ?? 'Полное описание';
  const hint =
    opts.hint ??
    'Нажмите <code>+</code> или <code>/</code> для выбора блока. YouTube/Instagram/Vimeo: вставьте ссылку в пустой абзац.';
  return `
    <div class="editor-section">
      <span class="editor-label">${label}</span>
      <input type="hidden" name="${opts.fieldName}" id="${hiddenId}" />
      <div id="${holderId}" class="editorjs-holder"></div>
      <p class="editor-hint">${hint}</p>
    </div>`;
}

interface EditorjsScriptsOpts {
  formId: string;
  contentB64: string;
  holderId?: string;
  hiddenId?: string;
}

export function editorjsScripts(opts: EditorjsScriptsOpts): string {
  const holderId = opts.holderId ?? 'editorjs-holder';
  const hiddenId = opts.hiddenId ?? 'editorjs-content';
  return `${CDN_TAGS}
<script>
(function () {
  var initialData = null;
  try {
    var raw = atob('${opts.contentB64}');
    if (raw) {
      var parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.blocks)) initialData = parsed;
    }
  } catch(_) {}

  // Legacy markdown / plain text fallback — wrap in a single paragraph block
  if (!initialData) {
    try {
      var legacy = atob('${opts.contentB64}');
      if (legacy && legacy.trim()) {
        initialData = {
          blocks: [{ type: 'paragraph', data: { text: legacy.replace(/</g, '&lt;').replace(/\\n/g, '<br>') } }],
        };
      }
    } catch(_) {}
  }

  var editorConfig = {
    holder: '${holderId}',
    placeholder: 'Начните писать... (нажмите / для выбора блока)',
    tools: (function() {
      var t = {};
      function add(name, cls, opts) { if (cls) t[name] = Object.assign({ class: cls }, opts || {}); }
      add('paragraph', window.Paragraph, { inlineToolbar: true, config: { preserveBlank: true } });
      add('header', window.Header, { config: { levels: [1, 2, 3, 4, 5, 6], defaultLevel: 2 }, inlineToolbar: true });
      add('list', window.NestedList || window.List || window.EditorjsList, { inlineToolbar: true, config: { defaultStyle: 'unordered' } });
      add('checklist', window.Checklist, { inlineToolbar: true });
      add('quote', window.Quote, { inlineToolbar: true, config: { quotePlaceholder: 'Введите цитату', captionPlaceholder: 'Автор цитаты' } });
      add('warning', window.Warning, { inlineToolbar: true, config: { titlePlaceholder: 'Заголовок', messagePlaceholder: 'Сообщение' } });
      add('code', window.CodeTool, { config: { placeholder: 'Введите код...' } });
      add('delimiter', window.Delimiter);
      add('table', window.Table, { inlineToolbar: true, config: { rows: 2, cols: 3, withHeadings: true } });
      add('image', window.ImageTool, {
        config: {
          endpoints: { byFile: '/admin/news/upload-image', byUrl: '/admin/news/upload-image-url' },
          field: 'image',
          captionPlaceholder: 'Подпись к изображению',
        },
      });
      add('embed', window.Embed, {
        inlineToolbar: true,
        config: {
          services: {
            youtube: true, vimeo: true, instagram: true, twitter: true,
            coub: true, codepen: true, imgur: true, gfycat: true,
            'twitch-video': true, 'twitch-channel': true, pinterest: true, facebook: true,
          },
        },
      });
      add('linkTool', window.LinkTool);
      add('attaches', window.AttachesTool, { config: { endpoint: '/admin/news/upload-file', field: 'file' } });
      add('raw', window.RawTool, { config: { placeholder: 'Вставьте HTML код...' } });
      add('marker', window.Marker);
      add('inlineCode', window.InlineCode);
      add('underline', window.Underline);
      return t;
    })(),
  };

  if (initialData) editorConfig.data = initialData;

  var editor = new window.EditorJS(editorConfig);
  window.__editorjsRefs = window.__editorjsRefs || {};
  window.__editorjsRefs['${holderId}'] = editor;

  var form = document.getElementById('${opts.formId}');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      editor.save().then(function(outputData) {
        document.getElementById('${hiddenId}').value = JSON.stringify(outputData);
        form.submit();
      }).catch(function(err) {
        console.error('Editor.js save error:', err);
        alert('Ошибка сохранения контента');
      });
    });
  }
})();
<\/script>`;
}

// Live image preview — reads selected file via FileReader and renders into a target <img>.
export function imagePreviewScript(inputName: string, previewId: string): string {
  return `
    (function() {
      var input = document.querySelector('input[type=file][name="${inputName}"]');
      var preview = document.getElementById('${previewId}');
      if (!input || !preview) return;
      input.addEventListener('change', function(e) {
        var file = e.target.files && e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(ev) {
          preview.src = ev.target.result;
          preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
      });
    })();`;
}

export function encodeContentB64(content: string | null | undefined): string {
  const s = content ?? '';
  return typeof Buffer !== 'undefined'
    ? Buffer.from(s, 'utf-8').toString('base64')
    : '';
}
