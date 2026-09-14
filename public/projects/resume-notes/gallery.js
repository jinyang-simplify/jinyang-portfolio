const screens = [
  '../../assets/projects/resume-notes/screens/01-home.png',
  '../../assets/projects/resume-notes/screens/02-input.png',
  '../../assets/projects/resume-notes/screens/03-diagnosis-full.png',
  '../../assets/projects/resume-notes/screens/04-compare-full.png',
  '../../assets/projects/resume-notes/screens/05-compare-detail.png',
  '../../assets/projects/resume-notes/screens/06-export-full.png',
]

const resumeDemoChapters = [
  { time: 0, label: '开始体验' },
  { time: 3, label: '添加材料' },
  { time: 8.5, label: '八维诊断' },
  { time: 11.5, label: '对照改写' },
  { time: 20.5, label: '确认导出' },
  { time: 24, label: '生成文件' },
]
const resumeDemoVideo = document.querySelector('.resume-demo-video')
const resumeDemoStatus = document.querySelector('.resume-demo-status')
const resumeDemoToggle = document.querySelector('.resume-demo-toggle')
const resumeDemoReplay = document.querySelector('.resume-demo-replay')
const resumeDemoEnded = document.querySelector('.resume-video-ended')
const resumeDemoScrubber = document.querySelector('.resume-demo-scrubber')
const resumeDemoTime = document.querySelector('.resume-demo-time')
const resumeDemoTimeline = [...document.querySelectorAll('[data-resume-demo-time]')]
const resumeReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
let resumeDemoVisible = false
let resumeDemoUserPaused = resumeReduceMotion.matches
let resumeDemoStarted = false

const formatResumeDemoTime = seconds => {
  const safeSeconds = Number.isFinite(seconds) ? Math.max(0, seconds) : 0
  const minutes = Math.floor(safeSeconds / 60)
  const remainder = Math.floor(safeSeconds % 60)
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`
}

const syncResumeDemoPlayback = () => {
  if (!resumeDemoVideo) return
  const currentTime = resumeDemoVideo.currentTime || 0
  const duration = Number.isFinite(resumeDemoVideo.duration) ? resumeDemoVideo.duration : 26
  let activeIndex = 0
  resumeDemoChapters.forEach((chapter, index) => {
    if (currentTime >= chapter.time) activeIndex = index
  })
  resumeDemoTimeline.forEach((item, index) => {
    item.parentElement?.classList.toggle('is-active', index === activeIndex)
    item.parentElement?.classList.toggle('is-complete', index < activeIndex)
    item.setAttribute('aria-current', index === activeIndex ? 'step' : 'false')
  })
  if (resumeDemoStatus) resumeDemoStatus.textContent = `${String(activeIndex + 1).padStart(2, '0')} · ${resumeDemoChapters[activeIndex].label}`
  if (resumeDemoScrubber && !resumeDemoScrubber.matches(':active')) {
    resumeDemoScrubber.max = String(duration)
    resumeDemoScrubber.value = String(currentTime)
  }
  if (resumeDemoTime) resumeDemoTime.textContent = `${formatResumeDemoTime(currentTime)} / ${formatResumeDemoTime(duration)}`
  if (resumeDemoToggle) {
    const finished = resumeDemoVideo.ended
    resumeDemoToggle.textContent = finished ? '重播' : resumeDemoVideo.paused ? '继续' : '暂停'
    resumeDemoToggle.setAttribute('aria-pressed', String(resumeDemoVideo.paused || finished))
  }
  if (resumeDemoEnded) resumeDemoEnded.hidden = !resumeDemoVideo.ended
}

resumeDemoToggle?.addEventListener('click', () => {
  if (!resumeDemoVideo) return
  if (resumeDemoVideo.ended) {
    resumeDemoVideo.currentTime = 0
    resumeDemoUserPaused = false
    resumeDemoVideo.play().catch(() => {})
    return
  }
  if (resumeDemoVideo.paused) {
    resumeDemoUserPaused = false
    resumeDemoVideo.play().catch(() => {})
  } else {
    resumeDemoUserPaused = true
    resumeDemoVideo.pause()
  }
})

const replayResumeDemo = () => {
  if (!resumeDemoVideo) return
  resumeDemoVideo.currentTime = 0
  resumeDemoUserPaused = false
  resumeDemoVideo.play().catch(() => {})
}

resumeDemoReplay?.addEventListener('click', replayResumeDemo)
resumeDemoEnded?.addEventListener('click', replayResumeDemo)

resumeDemoTimeline.forEach(item => {
  item.addEventListener('click', () => {
    if (!resumeDemoVideo) return
    resumeDemoVideo.currentTime = Number(item.dataset.resumeDemoTime || 0)
    resumeDemoUserPaused = false
    resumeDemoVideo.play().catch(() => {})
  })
})

resumeDemoScrubber?.addEventListener('input', event => {
  if (!resumeDemoVideo) return
  resumeDemoVideo.currentTime = Number(event.currentTarget.value)
  syncResumeDemoPlayback()
})

resumeDemoVideo?.addEventListener('loadedmetadata', syncResumeDemoPlayback)
resumeDemoVideo?.addEventListener('timeupdate', syncResumeDemoPlayback)
resumeDemoVideo?.addEventListener('play', syncResumeDemoPlayback)
resumeDemoVideo?.addEventListener('pause', syncResumeDemoPlayback)
resumeDemoVideo?.addEventListener('ended', syncResumeDemoPlayback)

if (resumeDemoVideo) {
  const resumeDemoObserver = new IntersectionObserver(entries => {
    resumeDemoVisible = entries.some(entry => entry.isIntersecting)
    if (resumeDemoVisible) {
      if (!resumeDemoStarted) {
        resumeDemoStarted = true
        resumeDemoVideo.currentTime = 0
      }
      if (!resumeDemoUserPaused && !resumeReduceMotion.matches && !resumeDemoVideo.ended) resumeDemoVideo.play().catch(() => {})
    } else if (!resumeDemoVideo.paused) {
      resumeDemoVideo.pause()
    }
  }, { threshold: 0.52 })
  resumeDemoObserver.observe(resumeDemoVideo)
  syncResumeDemoPlayback()
}

resumeReduceMotion.addEventListener?.('change', event => {
  resumeDemoUserPaused = event.matches
  if (event.matches) resumeDemoVideo?.pause()
  else if (resumeDemoVisible) resumeDemoVideo?.play().catch(() => {})
})

const dialog = document.querySelector('.lightbox')
const dialogImage = dialog?.querySelector('img')
const dialogMedia = dialog?.querySelector('.lightbox-media')
const count = dialog?.querySelector('.lightbox-count')
let current = 0

const showScreen = index => {
  current = (index + screens.length) % screens.length
  if (dialogImage) {
    dialogImage.src = screens[current]
    dialogImage.alt = `稿定简历产品界面 ${String(current + 1).padStart(2, '0')}`
  }
  dialogMedia?.scrollTo({ top: 0, behavior: 'auto' })
  if (count) count.textContent = `${String(current + 1).padStart(2, '0')} / ${screens.length}`
}

document.querySelectorAll('[data-index]').forEach(button => {
  button.addEventListener('click', () => {
    showScreen(Number(button.dataset.index))
    dialog?.showModal()
  })
})

dialog?.querySelector('.lightbox-close')?.addEventListener('click', () => dialog.close())
dialog?.querySelector('.lightbox-prev')?.addEventListener('click', () => showScreen(current - 1))
dialog?.querySelector('.lightbox-next')?.addEventListener('click', () => showScreen(current + 1))
dialog?.addEventListener('click', event => { if (event.target === dialog) dialog.close() })
document.addEventListener('keydown', event => {
  if (!dialog?.open) return
  if (event.key === 'ArrowLeft') showScreen(current - 1)
  if (event.key === 'ArrowRight') showScreen(current + 1)
})
const revealItems = document.querySelectorAll('.resume-overview-section, [data-reveal], .project-pager')
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return
    entry.target.classList.add('is-visible')
    revealObserver.unobserve(entry.target)
  })
}, { rootMargin: '0px 0px -10%', threshold: 0.08 })

revealItems.forEach(item => {
  item.classList.add('case-reveal')
  revealObserver.observe(item)
})

const progressBar = document.querySelector('.case-progress span')
const chapters = [...document.querySelectorAll('.resume-chapter')]
const chapterLinks = [...document.querySelectorAll('.resume-chapter-nav a')]
const updateProgress = () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight
  const progress = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0
  progressBar?.style.setProperty('--case-progress', progress)
  let activeChapter = chapters[0]
  for (const chapter of chapters) {
    if (chapter.getBoundingClientRect().top <= window.innerHeight * .4) activeChapter = chapter
  }
  chapterLinks.forEach(link => {
    if (link.hash === '#' + activeChapter?.id) link.setAttribute('aria-current', 'location')
    else link.removeAttribute('aria-current')
  })
}

updateProgress()
window.addEventListener('scroll', updateProgress, { passive: true })
