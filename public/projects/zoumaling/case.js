const screens = Array.from(
  { length: 24 },
  (_, index) => `../../assets/projects/zoumaling/screens/${String(index + 1).padStart(2, '0')}.jpg`,
)

const demoVideo = document.querySelector('.zml-demo-video')
const demoToggle = document.querySelector('.zml-demo-toggle')
const demoReplay = document.querySelector('.zml-demo-replay')
const demoEnded = document.querySelector('.zml-video-ended')
const demoScrubber = document.querySelector('.zml-demo-scrubber')
const demoStatus = document.querySelector('.zml-demo-status')
const demoTime = document.querySelector('.zml-demo-time')
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
let demoVisible = false
let demoUserPaused = reduceMotion.matches
let demoStarted = false

const formatTime = seconds => {
  const safeSeconds = Number.isFinite(seconds) ? Math.max(0, seconds) : 0
  const minutes = Math.floor(safeSeconds / 60)
  const remainder = Math.floor(safeSeconds % 60)
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`
}

const syncDemoPlayback = () => {
  if (!demoVideo) return
  const currentTime = demoVideo.currentTime || 0
  const duration = Number.isFinite(demoVideo.duration) ? demoVideo.duration : 0

  if (demoScrubber && !demoScrubber.matches(':active')) {
    demoScrubber.max = String(duration || 100)
    demoScrubber.value = String(currentTime)
  }
  if (demoStatus) demoStatus.textContent = formatTime(currentTime)
  if (demoTime) demoTime.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`
  if (demoToggle) {
    const isPaused = demoVideo.paused || demoVideo.ended
    demoToggle.textContent = demoVideo.ended ? '重播' : isPaused ? '播放' : '暂停'
    demoToggle.setAttribute('aria-pressed', String(isPaused))
  }
  if (demoEnded) demoEnded.hidden = !demoVideo.ended
}

const playFromStart = () => {
  if (!demoVideo) return
  demoVideo.currentTime = 0
  demoUserPaused = false
  demoVideo.play().catch(() => {})
}

demoToggle?.addEventListener('click', () => {
  if (!demoVideo) return
  if (demoVideo.ended) {
    playFromStart()
  } else if (demoVideo.paused) {
    demoUserPaused = false
    demoVideo.play().catch(() => {})
  } else {
    demoUserPaused = true
    demoVideo.pause()
  }
})
demoReplay?.addEventListener('click', playFromStart)
demoEnded?.addEventListener('click', playFromStart)
demoScrubber?.addEventListener('input', event => {
  if (!demoVideo) return
  demoVideo.currentTime = Number(event.currentTarget.value)
  syncDemoPlayback()
})

demoVideo?.addEventListener('loadedmetadata', syncDemoPlayback)
demoVideo?.addEventListener('timeupdate', syncDemoPlayback)
demoVideo?.addEventListener('play', syncDemoPlayback)
demoVideo?.addEventListener('pause', syncDemoPlayback)
demoVideo?.addEventListener('ended', syncDemoPlayback)

if (demoVideo) {
  const demoObserver = new IntersectionObserver(entries => {
    demoVisible = entries.some(entry => entry.isIntersecting)
    if (demoVisible) {
      if (!demoStarted) {
        demoStarted = true
        demoVideo.currentTime = 0
      }
      if (!demoUserPaused && !reduceMotion.matches && !demoVideo.ended) demoVideo.play().catch(() => {})
    } else if (!demoVideo.paused) {
      demoVideo.pause()
    }
  }, { threshold: 0.52 })
  demoObserver.observe(demoVideo)
  syncDemoPlayback()
}

reduceMotion.addEventListener?.('change', event => {
  demoUserPaused = event.matches
  if (event.matches) demoVideo?.pause()
  else if (demoVisible) demoVideo?.play().catch(() => {})
})

const dialog = document.querySelector('.lightbox')
const dialogImage = dialog?.querySelector('img')
const count = dialog?.querySelector('.lightbox-count')
let current = 0

const showScreen = index => {
  current = (index + screens.length) % screens.length
  if (dialogImage) {
    dialogImage.src = screens[current]
    dialogImage.alt = `走马岭系统界面 ${String(current + 1).padStart(2, '0')}`
  }
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

const revealItems = document.querySelectorAll('.zml-overview-section, [data-reveal], .project-pager')
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
const chapters = [...document.querySelectorAll('.zml-chapter')]
const chapterLinks = [...document.querySelectorAll('.zml-chapter-nav a')]
const updateProgress = () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight
  const progress = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0
  progressBar?.style.setProperty('--case-progress', progress)

  let activeChapter = chapters[0]
  for (const chapter of chapters) {
    if (chapter.getBoundingClientRect().top <= window.innerHeight * .4) activeChapter = chapter
  }
  chapterLinks.forEach(link => {
    if (link.hash === `#${activeChapter?.id}`) link.setAttribute('aria-current', 'location')
    else link.removeAttribute('aria-current')
  })
}

updateProgress()
window.addEventListener('scroll', updateProgress, { passive: true })
