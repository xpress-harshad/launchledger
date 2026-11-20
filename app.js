import { branding, phases, presets } from './settings.js';

const storageKey = 'launchledger.workspace.v1';
const byId = (id) => document.getElementById(id);
const selector = byId('projects');
const dialog = byId('project-dialog');
const form = byId('project-form');
const backupFile = byId('backup-file');
const checklist = byId('checklist');
const fields = form.elements;
const presetNames = Object.keys(presets);

function makeProject({ title, client, domain, preset }) {
  return {
    id: crypto.randomUUID(), title, client, domain, preset,
    tasks: presets[preset].map(([phase, name, description, critical]) => ({
      phase, name, description, critical, complete: false,
      owner: '', internal: '', handover: ''
    }))
  };
}

function validProject(project) {
  const isText = (value, max) => typeof value === 'string' && value.length <= max;
  return project && isText(project.id, 100) && project.id.length > 0 &&
    isText(project.title, 100) && project.title.trim().length > 0 &&
    isText(project.client, 100) && isText(project.domain, 160) &&
    presetNames.includes(project.preset) &&
    Array.isArray(project.tasks) && project.tasks.length > 0 && project.tasks.length <= 100 &&
    project.tasks.every((task) => task && phases.includes(task.phase) &&
      isText(task.name, 200) && isText(task.description, 500) &&
      typeof task.critical === 'boolean' && typeof task.complete === 'boolean' &&
      isText(task.owner, 100) && isText(task.internal, 2000) && isText(task.handover, 2000));
}

function loadWorkspace() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved?.projects?.length && Array.isArray(saved.projects) && saved.projects.every(validProject)) {
      return saved;
    }
  } catch {
    // The demo remains usable when storage is unavailable.
  }
  const sample = makeProject({
    title: 'Cedar Studio website', client: 'Cedar Studio', domain: 'cedar.example', preset: 'New website'
  });
  sample.tasks[0].complete = true;
  sample.tasks[0].owner = 'Project lead';
  sample.tasks[0].handover = 'Test inquiries reached the studio inbox.';
  sample.tasks[1].complete = true;
  return { projects: [sample], active: sample.id };
}

const workspace = loadWorkspace();
const current = () => workspace.projects.find(({ id }) => id === workspace.active) ?? workspace.projects[0];
const notice = (message) => { byId('notice').textContent = message; };

function save() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(workspace));
    return true;
  } catch {
    const message = 'Browser storage could not save your changes. Download a backup before leaving.';
    byId('storage-note').textContent = message;
    notice(message);
    return false;
  }
}

function readiness(project) {
  const completed = project.tasks.filter(({ complete }) => complete).length;
  const blockers = project.tasks.filter(({ critical, complete }) => critical && !complete);
  const open = blockers.filter(({ phase }) => phase !== 'Client handover').length;
  const handover = blockers.length - open;
  const messages = [
    open ? `${open} launch blocker${open === 1 ? '' : 's'} open` : 'Launch blockers cleared',
    handover ? `${handover} required handover check${handover === 1 ? '' : 's'} open` : 'Required handover checks complete'
  ];
  return { completed, blockers, messages, percent: Math.round(100 * completed / project.tasks.length) };
}

function updateOverview() {
  const project = current();
  const { completed, blockers, messages, percent } = readiness(project);
  byId('progress-text').textContent = `${completed} of ${project.tasks.length} checks complete`;
  byId('percent').textContent = `${percent}%`;
  byId('progress').value = percent;
  byId('blockers').textContent = messages.join(' · ');
  byId('blockers').classList.toggle('pending', blockers.length > 0);
}

function element(tag, content, className) {
  const node = document.createElement(tag);
  if (content !== undefined) node.textContent = content;
  if (className) node.className = className;
  return node;
}

function taskField(task, key, label, isLong = false) {
  const container = element('label', label);
  const field = element(isLong ? 'textarea' : 'input');
  field.maxLength = isLong ? 2000 : 100;
  field.value = task[key];
  field.addEventListener('input', () => {
    task[key] = field.value;
    save();
  });
  container.append(field);
  return container;
}

function renderTask(task, updatePhase) {
  const row = element('div', undefined, 'task');
  const title = element('label', undefined, 'task-title');
  const input = element('input');
  input.type = 'checkbox';
  input.checked = task.complete;
  input.addEventListener('change', () => {
    task.complete = input.checked;
    save();
    updatePhase();
    updateOverview();
  });
  title.append(input, element('span', task.name));
  if (task.critical) {
    title.append(element('span', task.phase === 'Client handover' ? 'Required' : 'Launch blocker', 'tag'));
  }
  const details = element('details');
  const notes = element('div', undefined, 'notes');
  notes.append(
    taskField(task, 'owner', 'Owner'),
    taskField(task, 'internal', 'Internal notes', true),
    taskField(task, 'handover', 'Client-facing handover notes', true)
  );
  details.append(element('summary', 'Owner and notes'), notes);
  row.append(title, element('p', task.description), details);
  return row;
}

function render() {
  const project = current();
  selector.replaceChildren(...workspace.projects.map(({ id, title }) => new Option(title, id)));
  selector.value = project.id;
  byId('preset').textContent = project.preset;
  byId('project-name').textContent = project.title;
  byId('project-details').textContent = [project.client, project.domain].filter(Boolean).join(' · ');
  checklist.replaceChildren();
  for (const phase of phases) {
    const tasks = project.tasks.filter((task) => task.phase === phase);
    if (!tasks.length) continue;
    const panel = element('section', undefined, 'phase');
    const title = element('header', undefined, 'phase-title row');
    const count = element('span');
    const updatePhase = () => {
      count.textContent = `${tasks.filter(({ complete }) => complete).length} / ${tasks.length} complete`;
    };
    title.append(element('h2', phase), count);
    updatePhase();
    panel.append(title, ...tasks.map((task) => renderTask(task, updatePhase)));
    checklist.append(panel);
  }
  updateOverview();
}

function openEditor(project) {
  form.dataset.projectId = project?.id ?? '';
  form.reset();
  fields.title.setCustomValidity('');

  byId('form-title').textContent = project ? 'Edit project' : 'New project';
  byId('preset-label').hidden = Boolean(project);
  if (project) {
    for (const key of ['title', 'client', 'domain', 'preset']) fields[key].value = project[key];
  }
  dialog.showModal();
  fields.title.focus();
}

function download(body, type, extension) {
  const filename = current().title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'project';
  const url = URL.createObjectURL(new Blob([body], { type }));
  const link = element('a');
  link.href = url;
  link.download = `${filename}.${extension}`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

function makeReport(project) {
  const report = document.implementation.createHTMLDocument(project.title + ' | Client handover');
  report.documentElement.lang = 'en';
  const meta = element('meta');
  meta.setAttribute('charset', 'utf-8');
  report.head.prepend(meta);
  const viewport = element('meta');
  viewport.name = 'viewport';
  viewport.content = 'width=device-width, initial-scale=1';
  report.head.append(viewport, element('style', `
    body{max-width:760px;margin:48px auto;padding:0 24px;font:16px/1.6 system-ui;color:#16251e}
    h1,h2,h3{line-height:1.2} h1,h2,p{overflow-wrap:anywhere} h2{margin-top:36px;border-bottom:1px solid #d9e3da;padding-bottom:8px}
    ul{padding-left:24px} li{margin:0 0 12px} li p{margin:3px 0;white-space:pre-wrap}
  `));
  const { completed, messages } = readiness(project);
  report.body.append(
    element('p', branding.studio + ' · Website handover'),
    element('h1', project.title),
    element('p', [project.client, project.domain].filter(Boolean).join(' · ')),
    element('p', `${completed} of ${project.tasks.length} checks complete · ${messages.join(' · ')}`)
  );
  for (const phase of phases) {
    const tasks = project.tasks.filter((task) => task.phase === phase);
    if (!tasks.length) continue;
    const list = element('ul');
    for (const task of tasks) {
      const item = element('li', `${task.name} · ${task.complete ? 'Complete' : 'Open'}`);
      if (task.handover) item.append(element('p', task.handover));
      list.append(item);
    }
    report.body.append(element('h2', phase), list);
  }
  return '<!doctype html>\n' + report.documentElement.outerHTML;
}

document.title = branding.name;
byId('brand').textContent = branding.name;
fields.preset.replaceChildren(...presetNames.map((name) => new Option(name, name)));
selector.addEventListener('change', () => {
  workspace.active = selector.value;
  save();
  render();
});
byId('new').addEventListener('click', () => openEditor());
byId('edit').addEventListener('click', () => openEditor(current()));
byId('cancel').addEventListener('click', () => dialog.close());
fields.title.addEventListener('input', () => fields.title.setCustomValidity(''));
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const details = Object.fromEntries([...new FormData(form)].map(([key, value]) => [key, value.trim()]));
  if (!details.title) {
    fields.title.setCustomValidity('Enter a project name.');
    fields.title.reportValidity();
    return;
  }
  const project = workspace.projects.find(({ id }) => id === form.dataset.projectId);
  if (project) {
    const { title, client, domain } = details;
    Object.assign(project, { title, client, domain });
  } else {
    const newProject = makeProject(details);
    workspace.projects.push(newProject);
    workspace.active = newProject.id;
  }
  if (save()) notice('Project saved.');
  dialog.close();
  render();
});
byId('report').addEventListener('click', () => {
  download(makeReport(current()), 'text/html;charset=utf-8', 'html');
  notice('Handover report downloaded.');
});
byId('backup').addEventListener('click', () => {
  download(JSON.stringify({ version: 1, project: current() }, null, 2), 'application/json', 'json');
  notice('Project backup downloaded.');
});
byId('import').addEventListener('click', () => backupFile.click());
backupFile.addEventListener('change', async () => {
  const [file] = backupFile.files;
  backupFile.value = '';
  if (!file) return;
  try {
    if (file.size > 2_000_000) throw new Error('Backup is too large.');
    const backup = JSON.parse(await file.text());
    if (backup?.version !== 1 || !validProject(backup.project)) throw new Error('Invalid project backup.');
    const project = { ...backup.project, id: crypto.randomUUID() };
    workspace.projects.push(project);
    workspace.active = project.id;
    if (save()) notice('Backup imported as a separate project.');
    render();
  } catch {
    notice('Could not import this file. Select a LaunchLedger project backup under 2 MB.');
  }
});
render();
