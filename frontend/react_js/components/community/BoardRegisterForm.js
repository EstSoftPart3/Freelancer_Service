import { useState, useRef, forwardRef, useImperativeHandle } from 'react'
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css'
import skillIconMap from '@/lib/skillIconMap'

// Quill 에디터 동적 import (SSR 방지)
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })

const BoardRegisterForm = forwardRef(({ isQna = false, initialData = null }, ref) => {
  // 상태 관리
  const [title, setTitle] = useState(initialData?.ttl || '')
  const [content, setContent] = useState(initialData?.description || '')
  const [normalTags, setNormalTags] = useState(initialData?.normalTags || [])
  const [skillTags, setSkillTags] = useState(initialData?.skillTags || [])
  const [files, setFiles] = useState([])
  const [existingAttachments, setExistingAttachments] = useState(initialData?.attachments || [])
  const [tagInput, setTagInput] = useState('')
  
  const quillRef = useRef(null)
  const fileInputRef = useRef(null)

  // Quill 에디터 설정
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ color: [] }, { background: [] }],
      ['link', 'image'],
      ['clean']
    ]
  }

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'color', 'background',
    'link', 'image'
  ]

  // 일반 태그 추가
  const addNormalTag = (tag) => {
    const trimmedTag = tag.trim()
    if (trimmedTag && !normalTags.includes(trimmedTag)) {
      setNormalTags([...normalTags, trimmedTag])
      setTagInput('')
    }
  }

  // 일반 태그 삭제
  const removeNormalTag = (tag) => {
    setNormalTags(normalTags.filter(t => t !== tag))
  }

  // 기술 태그 삭제
  const removeSkillTag = (tag) => {
    setSkillTags(skillTags.filter(t => t.skillTagNm !== tag.skillTagNm))
  }

  // 기술 아이콘 가져오기
  const getSkillIcon = (name) => {
    const key = name.toLowerCase().replace(/[\s.]+/g, '')
    return skillIconMap[key] || skillIconMap.default
  }

  // 파일 선택
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files)
    setFiles([...files, ...selectedFiles])
    e.target.value = '' // 초기화
  }

  // 파일 삭제
  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  // 기존 첨부파일 삭제
  const removeExistingAttachment = (index) => {
    setExistingAttachments(existingAttachments.filter((_, i) => i !== index))
  }

  // 엔터키로 태그 추가
  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addNormalTag(tagInput)
    }
  }

  // 데이터 전송 (부모 컴포넌트에서 호출)
  const getData = () => {
    const formData = new FormData()
    formData.append('ttl', title)
    formData.append('description', content)
    formData.append('normalTags', normalTags.join(','))
    formData.append('skillTagsJson', JSON.stringify(skillTags))
    
    // 기존 첨부파일 ID들
    const fileSqs = existingAttachments.map(att => att.fileSq)
    formData.append('attachments', fileSqs.join(','))
    
    // 새 파일들
    files.forEach(file => {
      formData.append('files', file)
    })
    
    return formData
  }

  // 부모 컴포넌트에 메서드 노출
  useImperativeHandle(ref, () => ({
    getData,
    getTitle: () => title,
    getContent: () => content
  }))

  return (
    <div>
      {/* 제목 */}
      <div className="form-group mb-3">
        <label className="form-label mb-1 text-2">제목</label>
        <input
          type="text"
          className="form-control text-3 h-auto py-2"
          placeholder="제목을 입력하세요."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* 내용 */}
      <div className="form-group mb-4">
        <label className="form-label mb-1 text-2">내용</label>
        <div className="quill-editor-wrapper">
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={content}
            onChange={setContent}
            modules={modules}
            formats={formats}
            placeholder="내용을 입력해주세요."
          />
        </div>
      </div>

      <style jsx global>{`
        .quill-editor-wrapper {
          background-color: #fff;
          border-radius: 4px;
        }
        .quill-editor-wrapper .quill {
          height: 400px;
          display: flex;
          flex-direction: column;
        }
        .quill-editor-wrapper .ql-toolbar {
          flex-shrink: 0;
        }
        .quill-editor-wrapper .ql-container {
          flex: 1;
          overflow-y: auto;
          min-height: 0;
        }
        .quill-editor-wrapper .ql-editor {
          min-height: 300px;
        }
      `}</style>

      {/* 태그 영역 */}
      <div className="form-group mb-4">
        <div className="d-flex align-items-center mb-2">
          <span className="form-label mb-0 text-2 me-2">태그</span>
          {isQna && (
            <button
              type="button"
              className="btn btn-light btn-sm"
              onClick={() => {
                // TODO: 기술 태그 모달 구현
                alert('기술 태그 선택 모달 구현 예정')
              }}
            >
              기술 태그 선택 하기
            </button>
          )}
        </div>

        {/* 태그 입력 */}
        <input
          type="text"
          className="form-control mb-2"
          placeholder="태그 입력 후 엔터를 입력해주세요."
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyPress={handleTagKeyPress}
        />

        {/* 등록된 태그 */}
        <div className="mt-3 d-flex flex-wrap gap-2">
          {/* 기술 태그 */}
          {skillTags.map((tag, index) => (
            <span
              key={`skill-${index}`}
              className="btn btn-rounded btn-primary btn-sm d-flex align-items-center px-3 py-2"
            >
              <img
                src={getSkillIcon(tag.skillTagNm)}
                alt={tag.skillTagNm}
                style={{ width: '14px', height: '14px', marginRight: '4px' }}
              />
              {tag.skillTagNm}
              <i
                className="fas fa-times ms-2"
                style={{ cursor: 'pointer' }}
                onClick={() => removeSkillTag(tag)}
              ></i>
            </span>
          ))}

          {/* 일반 태그 */}
          {normalTags.map((tag, index) => (
            <span
              key={`normal-${index}`}
              className="btn btn-rounded btn-light btn-sm d-flex align-items-center px-3 py-2"
            >
              {tag}
              <i
                className="fas fa-times ms-2"
                style={{ cursor: 'pointer' }}
                onClick={() => removeNormalTag(tag)}
              ></i>
            </span>
          ))}
        </div>
      </div>

      {/* 첨부파일 */}
      <div className="form-group mb-4">
        <label className="form-label mb-1 text-2">첨부파일</label>
        <input
          ref={fileInputRef}
          type="file"
          className="form-control mb-2"
          accept="image/*, .pdf, .doc, .docx, .zip"
          multiple
          onChange={handleFileChange}
        />

        {/* 파일 목록 */}
        <ul className="mt-2">
          {/* 기존 첨부파일 */}
          {existingAttachments.map((attachment, index) => (
            <li key={`existing-${index}`} className="d-flex justify-content-between align-items-center mb-1">
              <span>{attachment.fileOriginalNm}</span>
              <i
                className="fas fa-times ms-2"
                style={{ cursor: 'pointer' }}
                onClick={() => removeExistingAttachment(index)}
              ></i>
            </li>
          ))}

          {/* 새 파일 */}
          {files.map((file, index) => (
            <li key={`new-${index}`} className="d-flex justify-content-between align-items-center mb-1">
              <span>{file.name}</span>
              <i
                className="fas fa-times ms-2"
                style={{ cursor: 'pointer' }}
                onClick={() => removeFile(index)}
              ></i>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
})

BoardRegisterForm.displayName = 'BoardRegisterForm'

export default BoardRegisterForm

