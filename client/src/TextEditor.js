import React, { useCallback } from 'react'
import Quill from 'quill'

import 'quill/dist/quill.snow.css'

export default function TextEditor() {
    // When the html with ref wrapperRef is created execute this code
    const wrapperRef = useCallback((wrapper) => {
        if (wrapper == null) return

        // Clear any previous wrapper and instantiate a new one
        wrapper.innerHTML = ''
        const editor = document.createElement('div')
        wrapper.append(editor)

        new Quill(editor, {theme: 'snow'})
    }, [])

    return <div id="container" ref={wrapperRef}></div>
}
