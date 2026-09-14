const generatedPrompt = '这是一张三行三列网格排版的城市建成环境与场地分析图，鸟瞰正投影视角，九张图片在浅蓝色背景上整齐分布。画面围绕滨水地区、城市街道结构、周边主要道路交叉口、现状建筑及覆盖范围展开，以蓝色河流、红色节点和细灰色线条建立视觉层级。整体采用低饱和蓝白配色、简洁地图线稿与建筑分析图语言，信息组织清晰、留白充足，适合用于城市设计汇报、场地研究和公共空间策略表达。'

const stages = [
  {
    key: 'ready',
    status: '图片已定位 · 城市分析图',
    title: '准备反推提示词',
    output: '识别主体、构图、视角、材质、光线、色调与风格。',
    generate: '开始反推',
    copy: '复制',
    copyDisabled: true,
  },
  {
    key: 'loading',
    status: '正在分析 · 城市分析图',
    title: '提取视觉信息',
    output: '正在识别画面主体、网格构图、地图层级、红蓝配色与建筑分析图风格……',
    generate: '正在分析',
    copy: '复制',
    copyDisabled: true,
  },
  {
    key: 'result',
    status: '分析完成 · 城市分析图',
    title: '城市建成环境分析图提示词',
    output: generatedPrompt,
    generate: '重新生成',
    copy: '复制',
    copyDisabled: false,
  },
  {
    key: 'copied',
    status: '复制完成 · 已加入最近记录',
    title: '提示词已进入创作流程',
    output: '结果已复制到剪贴板，并保存至历史记录。',
    generate: '重播',
    copy: '已复制',
    copyDisabled: false,
  },
  {
    key: 'history',
    status: 'History',
    title: '最近记录',
    output: '',
    generate: '重播',
    copy: '复制',
    copyDisabled: false,
  },
]

const delays = [1700, 2500, 4200, 1700, 0]
const demoCanvas = { width: 754, height: 634 }
const demoStage = document.querySelector('.demo-stage-scroll')
const workspace = document.querySelector('.demo-workspace')
const card = document.querySelector('.demo-card')
const status = document.querySelector('.demo-status')
const title = document.querySelector('.demo-card-body h3')
const output = document.querySelector('.demo-output')
const generate = document.querySelector('.demo-generate')
const copy = document.querySelector('.demo-copy')
const toggle = document.querySelector('.demo-toggle')
const replay = document.querySelector('.demo-replay')
const timeline = [...document.querySelectorAll('[data-demo-step]')]

const fitDemoToMobile = () => {
  const isMobile = window.matchMedia('(max-width: 760px)').matches
  if (!isMobile) {
    demoStage.style.removeProperty('--demo-mobile-height')
    workspace.style.removeProperty('--demo-mobile-scale')
    return
  }

  const scale = Math.min(demoStage.clientWidth / demoCanvas.width, 1)
  workspace.style.setProperty('--demo-mobile-scale', scale.toFixed(4))
  demoStage.style.setProperty('--demo-mobile-height', `${Math.ceil(demoCanvas.height * scale + 6)}px`)
}

fitDemoToMobile()
new ResizeObserver(fitDemoToMobile).observe(demoStage)
window.addEventListener('orientationchange', fitDemoToMobile)

let current = 0
let paused = false
let started = false
let timer

const syncToggle = () => {
  const finished = current === stages.length - 1
  toggle.textContent = finished ? '重播' : paused ? '继续' : '暂停'
  toggle.setAttribute('aria-pressed', String(paused || finished))
}

const showStage = index => {
  current = index
  const stage = stages[index]
  workspace.dataset.stage = stage.key
  card.classList.toggle('is-loading', stage.key === 'loading')
  card.classList.toggle('is-result', stage.key === 'result')
  status.textContent = stage.status
  title.textContent = stage.title
  output.textContent = stage.output
  generate.textContent = stage.generate
  generate.disabled = stage.key === 'loading'
  copy.textContent = stage.copy
  copy.disabled = stage.copyDisabled
  timeline.forEach((item, itemIndex) => {
    item.classList.toggle('is-active', itemIndex === index)
    item.classList.toggle('is-complete', itemIndex < index)
  })
  syncToggle()
}

const queueNext = () => {
  clearTimeout(timer)
  if (paused || current >= stages.length - 1) {
    syncToggle()
    return
  }
  timer = setTimeout(() => {
    showStage(current + 1)
    queueNext()
  }, delays[current])
}

const playFromStart = () => {
  clearTimeout(timer)
  paused = false
  showStage(0)
  queueNext()
}

toggle.addEventListener('click', () => {
  if (current === stages.length - 1) {
    playFromStart()
    return
  }
  paused = !paused
  syncToggle()
  if (!paused) queueNext()
  else clearTimeout(timer)
})

replay.addEventListener('click', playFromStart)

generate.addEventListener('click', () => {
  if (current === 0) {
    paused = false
    showStage(1)
    queueNext()
  } else {
    playFromStart()
  }
})

copy.addEventListener('click', async () => {
  if (copy.disabled) return
  try { await navigator.clipboard.writeText(generatedPrompt) } catch {}
  clearTimeout(timer)
  paused = false
  showStage(3)
  queueNext()
})

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
if (reduceMotion) {
  paused = true
  showStage(2)
  toggle.textContent = '播放'
} else {
  const observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting) && !started) {
      started = true
      playFromStart()
      observer.disconnect()
    }
  }, { threshold: .42 })
  observer.observe(workspace)
}

const progress = document.querySelector('.case-progress span')
const chapters = [...document.querySelectorAll('.prompt-chapter')]
const chapterLinks = [...document.querySelectorAll('.prompt-chapter-nav a')]
const revealItems = document.querySelectorAll('[data-reveal]')
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return
    entry.target.classList.add('is-visible')
    revealObserver.unobserve(entry.target)
  })
}, { rootMargin: '0px 0px -10%', threshold: .08 })

revealItems.forEach(item => revealObserver.observe(item))

const updatePage = () => {
  const distance = document.documentElement.scrollHeight - innerHeight
  progress.style.width = `${distance > 0 ? scrollY / distance * 100 : 0}%`

  let activeChapter = chapters[0]
  for (const chapter of chapters) {
    if (chapter.getBoundingClientRect().top <= innerHeight * .4) activeChapter = chapter
  }
  chapterLinks.forEach(link => {
    if (link.hash === `#${activeChapter?.id}`) link.setAttribute('aria-current', 'location')
    else link.removeAttribute('aria-current')
  })
}

updatePage()
window.addEventListener('scroll', updatePage, { passive: true })
