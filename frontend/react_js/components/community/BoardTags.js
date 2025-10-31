import { useState, useEffect, useRef } from 'react'
import styles from './BoardTags.module.css'

export default function BoardTags({ skillTags = [], normalTags = [] }) {
  const [totalTags, setTotalTags] = useState([])
  const [visibleTags, setVisibleTags] = useState([])
  const [hiddenCount, setHiddenCount] = useState(0)
  const [buttonMsg, setButtonMsg] = useState('+0')
  const [showAll, setShowAll] = useState(false)
  
  const containerRef = useRef(null)
  const tagRefs = useRef([])
  
  useEffect(() => {
    const tags = []
    skillTags.forEach((el) => {
      tags.push({ type: 'skill', tag_nm: el })
    })
    normalTags.forEach((el) => {
      tags.push({ type: 'normal', tag_nm: el })
    })
    setTotalTags(tags)
    setVisibleTags(tags)
  }, [skillTags, normalTags])
  
  useEffect(() => {
    if (!showAll && totalTags.length > 0) {
      calculateVisibleTags()
    }
  }, [totalTags, showAll])
  
  const calculateVisibleTags = () => {
    if (!containerRef.current || totalTags.length === 0) return
    
    const containerWidth = containerRef.current.offsetWidth
    let totalWidth = 0
    let count = 0
    
    for (let i = 0; i < totalTags.length; i++) {
      const tagEl = tagRefs.current[i]
      if (!tagEl) continue
      
      totalWidth += tagEl.offsetWidth + 8 // margin or spacing
      if (totalWidth > containerWidth) break
      count++
    }
    
    setVisibleTags(totalTags.slice(0, count))
    setHiddenCount(totalTags.length - count)
    setButtonMsg(`+${totalTags.length - count}`)
  }
  
  const clickHiddenToggle = () => {
    if (showAll) {
      setShowAll(false)
      calculateVisibleTags()
      setButtonMsg(`+${hiddenCount}`)
    } else {
      setShowAll(true)
      setVisibleTags(totalTags)
      setButtonMsg('접기')
    }
  }
  
  useEffect(() => {
    window.addEventListener('resize', calculateVisibleTags)
    return () => window.removeEventListener('resize', calculateVisibleTags)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalTags])
  
  return (
    <div
      ref={containerRef}
      className="mt-2 d-flex justify-content-start flex-wrap gap-1"
    >
      {(showAll ? totalTags : visibleTags).map((tagInfo, index) => (
        <span
          key={`${tagInfo.type}-${index}`}
          ref={(el) => (tagRefs.current[index] = el)}
          className={`btn btn-rounded btn-3d py-0 px-2 ${styles.tagBtn} ${
            tagInfo.type === 'skill' ? 'btn-primary' : 'btn-light'
          }`}
        >
          {tagInfo.type === 'skill' ? tagInfo.tag_nm.skillTagNm : tagInfo.tag_nm}
        </span>
      ))}
      {!showAll && hiddenCount > 0 && (
        <button
          className={`more-tag btn btn-light btn-rounded btn-3d py-0 px-2 ${styles.tagBtn}`}
          onClick={clickHiddenToggle}
        >
          {buttonMsg}
        </button>
      )}
      {showAll && totalTags.length > visibleTags.length && (
        <button
          className={`more-tag btn btn-light btn-rounded btn-3d py-0 px-2 ${styles.tagBtn}`}
          onClick={clickHiddenToggle}
        >
          접기
        </button>
      )}
    </div>
  )
}

