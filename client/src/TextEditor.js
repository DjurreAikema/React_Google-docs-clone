import React, { useCallback, useEffect, useState } from 'react'
import Quill from 'quill'
import {io} from 'socket.io-client'

import 'quill/dist/quill.snow.css'

const TOOLBAR_OPTIONS = [
    [{ header: [1, 2, 3]}],
    [{ font: []}],
    [{ list: "ordered"}, { list: "bullet"}],
    ["bold", "italic", "underline"],
    [{ color: []}, { background: []}],
    [{ script: "sub"}, { script: "super"}],
    [{ align: []}],
    ["image", "blockquote", "code-block"],
    ["clean"],
]

export default function TextEditor() {
    const [socket, setSocket] = useState()
    const [quill, setQuill] = useState()

    useEffect(() => {
        const s = io("http://localhost:3001")
        setSocket(s)

        return () => {
            s.disconnect()
        }
    }, [])

    // When the html with ref wrapperRef is created execute this code
    const wrapperRef = useCallback((wrapper) => {
        if (wrapper == null) return

        // Clear any previous wrapper and instantiate a new one
        wrapper.innerHTML = ''
        const editor = document.createElement('div')
        wrapper.append(editor)

        const q = new Quill(editor, {theme: 'snow', modules: {toolbar:TOOLBAR_OPTIONS}})
        setQuill(q)
    }, [])

    return <div class="container" ref={wrapperRef}></div>
}
